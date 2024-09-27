[![npm](https://img.shields.io/npm/v/vite-plugin-tss-cloudflare-proxy)](https://www.npmjs.com/package/vite-plugin-tss-cloudflare-proxy) [![JSR Package](https://jsr.io/badges/@ponjimon/vite-plugin-tss-cloudflare-proxy)](https://jsr.io/@ponjimon/vite-plugin-tss-cloudflare-proxy) [![node-current](https://img.shields.io/node/v/vite-plugin-tss-cloudflare-proxy)](https://nodejs.org/)

# vite-plugin-tss-cloudflare-proxy

A Vite plugin to make Cloudflare Bindings work locally when using TanStack Start.

## 📦 Install

```sh
npm i -D vite-plugin-tss-cloudflare-proxy
```

```sh
yarn add -D vite-plugin-tss-cloudflare-proxy
```

```sh
pnpm add -D vite-plugin-tss-cloudflare-proxy
```

```sh
bun add -D vite-plugin-tss-cloudflare-proxy
```

Or, using JSR:

```sh
npx jsr add @ponjimon/vite-plugin-tss-cloudflare-proxy
```

```sh
yarn dlx jsr add @ponjimon/vite-plugin-tss-cloudflare-proxy
```

```sh
pnpm dlx jsr add @ponjimon/vite-plugin-tss-cloudflare-proxy
````

```sh
bunx jsr add @ponjimon/vite-plugin-tss-cloudflare-proxy
```

## 👨‍💻 Usage

```ts
import cloudflareDevProxyVitePlugin from '@ponjimon/vite-plugin-tss-cloudflare-proxy'
import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  vite: {
    plugins: () => [
      cloudflareDevProxyVitePlugin(),
    ],
  },
})
```

Next, create a `env.d.ts` file in `app/env.d.ts` with the following content:

```ts
/// <reference types="@cloudflare/workers-types" />

import type { H3EventContext } from 'vinxi/http'
import type { PlatformProxy } from 'wrangler'

interface EnvVars {
    // Add your bindings here
    // KV: KVNamespace
}

declare global {
  interface Env extends EnvVars {}
}

declare module 'vinxi/http' {
  interface H3EventContext {
    cf: CfProperties
    cloudflare: Omit<PlatformProxy<Env>, 'dispose'>
  }
}

declare global {
  interface Request {
    context: H3EventContext
  }
}
```

Next, you will have to update the API entry handler (`app/api.ts`):

```diff
--- app/api.ts
+++ app/api.ts
@@ -1,3 +1,11 @@
-import { createStartAPIHandler, defaultAPIFileRouteHandler } from '@tanstack/start/api'
+import { defaultAPIFileRouteHandler } from '@tanstack/start/api'
+import { eventHandler, toWebRequest } from 'vinxi/http'
 
-export default createStartAPIHandler(defaultAPIFileRouteHandler)
+const apiHandler = eventHandler(async (event) => {
+  const request = toWebRequest(event)
+  request.context = event.context
+  const res = await defaultAPIFileRouteHandler({ request })
+  return res
+})
+
+export default apiHandler
```

Now you will have access to the Cloudflare bindings locally but also on the edge, for example:

```ts
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/completion')({
  GET: async ({ request }) => {
    const res = await request.context.cloudflare.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: 'Hello, World!' }],
    })
    if ('response' in res) {
      return new Response(res.response)
    }
    return new Response('No response')
  },
})
```

## ⚠️ Caveats
> [!IMPORTANT]
> This plugin is still experimental and may not work for all use cases.
> It is specifically tailored to work with the `@tanstack/start` framework.
> 
> Currently, it will **only** work with [API Routes](https://tanstack.com/router/v1/docs/framework/react/start/api-routes).
> [Server Functions](https://tanstack.com/router/v1/docs/framework/react/start/server-functions) are **not** supported yet.

## 🙏 Acknowledgements

The base for this plugin was taken from [Remix](https://github.com/remix-run/remix/blob/6f83cf3d11436f6306a5d5f2468ce2cc4fe8e3ea/packages/remix-dev/vite/cloudflare-proxy-plugin.ts)

And a special thanks to [opennextjs-cloudflare](https://github.com/opennextjs/opennextjs-cloudflare/blob/11802c4973ed887ae48d6fef721f107399a5a668/packages/cloudflare/src/api/get-cloudflare-context.ts#L72) for overcoming [this issue](https://github.com/nksaraf/vinxi/issues/348).
