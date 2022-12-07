import { ValueCallback } from "./types";
export declare class Slice<T> implements Iterable<T> {
    readonly array: Array<T>;
    readonly start: number;
    readonly end: number;
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T>;
    /**
     * Create a slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static make<T>(length: number, capacity?: number): Slice<T>;
    private constructor();
    /**
     * Returns the element at index i in the slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    get(i: number): T;
    /**
     * Sets the element at index i in the slice to val
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    set(i: number, val: T): void;
    /**
     * return slice length
     */
    get length(): number;
    /**
     * return slice capacity
     */
    get capacity(): number;
    /**
     * take sub-slices
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    slice(start?: number, end?: number): Slice<T>;
    /**
     * Copy data from src to current slice
     * @returns How much data was copied
     */
    copy(src: Iterable<T>): number;
    /**
     * Add a new element at the end of the slice and return the new slice
     */
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
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void;
}
