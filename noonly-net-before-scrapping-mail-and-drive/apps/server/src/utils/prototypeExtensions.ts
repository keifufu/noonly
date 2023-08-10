export { }

declare global {
  interface Array<T> {
    asyncForEach: (callback: (item: T, index: number, array: T[]) => Promise<void>, parallel?: boolean) => Promise<void>
  }
}

if (!Array.prototype.asyncForEach) {
  Object.defineProperty(Array.prototype, 'asyncForEach', { enumerable: false,
    writable: false,
    configurable: false,
    value: async function(fn: (item: any, index: number, array: any[]) => Promise<void>, parallel = true) {
      if (parallel) {
        const promises = []
        for (let index = 0; index < this.length; index++)
          promises.push(fn(this[index], index, this))
        await Promise.all(promises)
      } else {
        for (let index = 0; index < this.length; index++)
          await fn(this[index], index, this)
      }
    } })
}