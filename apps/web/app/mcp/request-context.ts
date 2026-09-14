import { AsyncLocalStorage } from 'node:async_hooks'

const requestOriginStorage = new AsyncLocalStorage<string>()

export function getRequestOrigin() {
  return requestOriginStorage.getStore()
}

export function runWithRequestOrigin<T>(origin: string, callback: () => T) {
  return requestOriginStorage.run(origin, callback)
}
