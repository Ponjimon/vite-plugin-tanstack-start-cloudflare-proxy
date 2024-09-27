/// <reference types="./env.d.ts" />

import { H3Event, splitCookiesString, type EventHandler } from 'vinxi/http'
import type { Plugin } from 'vite'
import type { GetPlatformProxyOptions } from 'wrangler'
import { once } from 'node:events'
import { Readable } from 'node:stream'
import type { ServerResponse } from 'node:http'

// Adapted from solid-start's `handleNodeResponse`:
// https://github.com/solidjs/solid-start/blob/7398163869b489cce503c167e284891cf51a6613/packages/start/node/fetch.js#L162-L185
async function toNodeRequest(res: Response, nodeRes: ServerResponse) {
  nodeRes.statusCode = res.status
  nodeRes.statusMessage = res.statusText

  const cookiesStrings = []

  for (const [name, value] of res.headers) {
    if (name === 'set-cookie') {
      cookiesStrings.push(...splitCookiesString(value))
    } else nodeRes.setHeader(name, value)
  }

  if (cookiesStrings.length) {
    nodeRes.setHeader('set-cookie', cookiesStrings)
  }

  if (res.body) {
    // https://github.com/microsoft/TypeScript/issues/29867
    const responseBody = res.body as unknown as AsyncIterable<Uint8Array>
    const readable = Readable.from(responseBody)
    readable.pipe(nodeRes)
    await once(readable, 'end')
  } else {
    nodeRes.end()
  }
}

function importWrangler() {
  try {
    return import(`${'__wrangler'.replaceAll('_', '')}`) as Promise<typeof import('wrangler')>
  } catch (_) {
    throw Error('Could not import `wrangler`. Do you have it installed?')
  }
}

const NAME = 'vite-plugin-tss-cloudflare-proxy'

const cloudflareDevProxyVitePlugin = <
  Env = Record<string, unknown>,
  Cf extends Record<string, unknown> = IncomingRequestCfProperties,
>(
  options: GetPlatformProxyOptions = {},
): Plugin => {
  return {
    name: NAME,
    config: () => ({
      ssr: {
        resolve: {
          externalConditions: ['workerd', 'worker'],
        },
      },
    }),
    configureServer: async (viteDevServer) => {
      // This is to avoid https://github.com/nksaraf/vinxi/issues/348
      const { getPlatformProxy } = await importWrangler()
      // Do not include `dispose` in Cloudflare context
      const { dispose, ...cloudflare } = await getPlatformProxy<Env, Cf>(options)
      const context = { cloudflare }
      return () => {
        const { handler: entry, name } = viteDevServer.config.router
        // Currently, only the api router is supported
        if (name !== 'api' || !entry) {
          return
        }
        viteDevServer.middlewares.use(async (nodeReq, nodeRes, next) => {
          try {
            const { default: handler } = (await viteDevServer.ssrLoadModule(entry)) as {
              default: EventHandler
            }
            const event = new H3Event(nodeReq, nodeRes)
            Object.assign(event.context, { cloudflare: context.cloudflare })
            const res = await handler(event)
            await toNodeRequest(res, nodeRes)
          } catch (error) {
            next(error)
          }
        })
      }
    },
  }
}

export default cloudflareDevProxyVitePlugin
