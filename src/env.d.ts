/// <reference types="@cloudflare/workers-types" />

import type { H3EventContext } from 'vinxi/http'
import type { PlatformProxy } from 'wrangler'

// biome-ignore lint/suspicious/noEmptyInterface: will be augmentes by consumer
export interface EnvVars {}

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
