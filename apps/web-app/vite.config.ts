import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import path, { basename, extname, resolve } from 'node:path'

const isDevelopment = process.env.NODE_ENV === 'development'
const appRoot = resolve(__dirname)
const pagesRoot = resolve(appRoot, 'src/pages')

const pageEntries = readdirSync(pagesRoot)
  .filter(file => /\.([jt])sx?$/.test(file))
  .sort()
  .reduce<Record<string, string>>((entries, file) => {
    const name = basename(file, extname(file))
    const htmlPath = resolve(appRoot, `${name}.html`)

    if (!existsSync(htmlPath)) {
      writeFileSync(
        htmlPath,
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>S&P 500 MCP APP</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/pages/${file}"></script>
</body>
</html>
`,
      )
    }

    entries[name] = htmlPath
    return entries
  }, {})

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    sourcemap: isDevelopment ? 'inline' : undefined,
    cssMinify: !isDevelopment,
    minify: !isDevelopment,

    rollupOptions: {
      input: pageEntries,
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
