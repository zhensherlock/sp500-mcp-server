import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/server.ts', 'src/client.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: true,
  dts: false,
  fixedExtension: false,
})
