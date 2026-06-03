declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: unknown
    ): number;
  }
}

export function findLastIndex<T>(
  array: T[],
  callback: (this: unknown, value: T, index: number, array: T[]) => unknown,
  thisArg?: unknown
): number {
  if (typeof callback?.call !== 'function') {
    throw new TypeError(`TypeError: ${typeof callback} is not a function`);
  }
  for (let index = array.length - 1; index >= 0; index--) {
    if (callback.call(thisArg, array[index] as T, index, array)) return index;
  }
  return -1;
}

export function handleFindLastIndexPolyfill(): void {
  if (typeof Array.prototype.findLastIndex !== 'function') {
    Array.prototype.findLastIndex = function <T>(
      this: T[],
      callback: (value: T, index: number, array: T[]) => unknown,
      thisArg?: unknown
    ): number {
      return findLastIndex(this, callback, thisArg);
    };
  }
}

export default handleFindLastIndexPolyfill;
