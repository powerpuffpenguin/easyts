import { Exception } from "./exception";
export declare const errLenOutOfRange: Exception;
export declare const errCapOutOfRange: Exception;
export declare class Slice<T> {
    readonly array: Array<T>;
    readonly start: number;
    readonly end: number;
    /**
     *
     * @throws {@link core.errOutOfRange}
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T>;
    /**
     * @throws {@link core.errOutOfRange}
     * @throws {@link core.errOutOfRange}
     */
    static make<T>(length: number, capacity: number): Slice<T>;
    private constructor();
    get(i: number): T;
    set(i: number, val: T): void;
    get length(): number;
    get capacity(): number;
    slice(start?: number, end?: number): Slice<T>;
    append(...vals: Array<T>): Slice<T>;
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator](): Iterator<T>;
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<T>;
}
