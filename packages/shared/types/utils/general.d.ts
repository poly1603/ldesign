export declare const hasOwn: <T extends object>(val: T, key: string | symbol | number) => key is keyof T;
export declare function getPropertyValFromObj<T extends object>(val: T, key: string | symbol | number): T[keyof T] | undefined;
export declare const isPlainObject: <T extends object>(val: unknown) => val is T;
export declare function isPromise<T = any>(val: unknown): val is Promise<T>;
//# sourceMappingURL=general.d.ts.map