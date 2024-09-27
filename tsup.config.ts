import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'node18',
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  minify: false,
  tsconfig: './tsconfig.build.json',
  treeshake: 'recommended',
})
