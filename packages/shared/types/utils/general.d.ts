declare const hasOwn: <T extends object>(val: T, key: string | symbol | number) => key is keyof T;
declare function getPropertyValFromObj<T extends object>(val: T, key: string | symbol | number): T[keyof T] | undefined;
declare const isPlainObject: <T extends object>(val: unknown) => val is T;
declare function isPromise<T = any>(val: unknown): val is Promise<T>;

export { getPropertyValFromObj, hasOwn, isPlainObject, isPromise };
