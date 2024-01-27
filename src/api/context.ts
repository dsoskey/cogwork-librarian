export function defaultFunction(name: string) {
  return () => console.error(`${name} called without a provider`)
}
export function defaultPromise(name: string) {
  return () => Promise.reject(`${name} called without a provider!`)
}