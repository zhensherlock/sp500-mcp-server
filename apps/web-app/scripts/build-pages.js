import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'

const appRoot = resolve(import.meta.dirname, '..')
const pagesRoot = resolve(appRoot, 'src/pages')
const viteBin = resolve(appRoot, 'node_modules/.bin/vite')

const pages = readdirSync(pagesRoot)
  .filter(file => /\.([jt])sx?$/.test(file))
  .map(file => basename(file, extname(file)))
  .sort()

for (const [index, page] of pages.entries()) {
  const result = spawnSync(viteBin, ['build'], {
    cwd: appRoot,
    env: {
      ...process.env,
      MCP_APP_EMPTY_OUT_DIR: index === 0 ? 'true' : 'false',
      MCP_APP_PAGE: page,
    },
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
