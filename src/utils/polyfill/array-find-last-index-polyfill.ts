export function findLastIndex(
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: Array<any>,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (value: any, index: number, array: any[]) => unknown,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thisArg?: any
): number {
  if (typeof callback?.call !== 'function') {
    throw new TypeError(`TypeError: ${typeof callback} is not a function`);
  }
  for (let index = array.length - 1; index >= 0; index--) {
    if (callback.call(thisArg, array[index], index, array)) return index;
  }
  return -1;
}

export function handleFindLastIndexPolyfill(): void {
  if (typeof Array.prototype.findLastIndex !== 'function') {
    Array.prototype.findLastIndex = function (
      // TODO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: (value: any, index: number, array: any[]) => unknown,
      // TODO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      thisArg?: any
    ): number {
      return findLastIndex(this, callback, thisArg);
    };
  }
}

export default handleFindLastIndexPolyfill;
