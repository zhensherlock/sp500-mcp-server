import { fork, spawn } from 'node:child_process'
import { once } from 'node:events'
import { build } from 'tsdown'

const serverEntry = new URL('../dist/server.js', import.meta.url)
let server
let inspector
let stopping = false

async function stopChild(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return
  const exited = once(child, 'exit')
  if (!child.killed) child.kill()
  await exited
}

function startInspector(agentCardUrl) {
  inspector = spawn('a2a-inspector', ['--no-open', '--host', '127.0.0.1', '--port', '5174', '-a', agentCardUrl], {
    stdio: 'inherit',
  })
  inspector.once('error', error => {
    if (error.code === 'ENOENT') {
      console.warn('a2a-inspector is not on PATH. Install it from https://github.com/a2aproject/a2a-inspector/releases')
      return
    }
    console.warn('Could not start a2a-inspector.', error)
  })
}

async function restartServer(signal) {
  if (stopping) return
  // Release the port before starting the new server.
  await stopChild(server)
  if (stopping || signal.aborted) return

  const child = fork(serverEntry, { execArgv: ['--enable-source-maps'] })
  server = child
  child.once('message', agentCardUrl => {
    if (!inspector && !stopping && !child.killed && typeof agentCardUrl === 'string') {
      startInspector(agentCardUrl)
    }
  })
  child.once('error', error => console.error('Could not start the A2A server.', error))
  child.once('exit', (code, exitSignal) => {
    if (!stopping && !child.killed && code !== 0) {
      console.error(`A2A server exited (${exitSignal ?? code}).`)
    }
  })
}

const buildHandle = build({
  watch: true,
  onSuccess: (_config, signal) =>
    restartServer(signal).catch(error => console.error('Could not start the A2A server.', error)),
}).catch(error => {
  console.error('Could not start the A2A build watcher.', error)
  process.exitCode = 1
})

async function shutdown() {
  if (stopping) return
  stopping = true
  const results = await Promise.allSettled([
    stopChild(server),
    stopChild(inspector),
    buildHandle.then(handle => handle?.watch.close()),
  ])
  const failure = results.find(result => result.status === 'rejected')
  if (failure) {
    console.error('Could not shut down A2A development.', failure.reason)
    process.exitCode = 1
  }
  process.exit()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
process.once('exit', () => {
  server?.kill()
  inspector?.kill()
})
