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
