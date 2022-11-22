import { Exception } from "./exception";
import { CompareCallback, MapCallback, ValidCallback, ValueCallback } from "./types";
export declare const errLenOutOfRange: Exception;
export declare const errCapOutOfRange: Exception;
export interface Source<T> extends Iterable<T> {
    readonly length: number;
}
export declare class Slice<T> {
    readonly array: Array<T>;
    readonly start: number;
    readonly end: number;
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link core.errOutOfRange}
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T>;
    /**
     * Create a slice
     * @throws {@link core.errOutOfRange}
     */
    static make<T>(length: number, capacity?: number): Slice<T>;
    private constructor();
    /**
     * Returns the element at index i in the slice
     */
    get(i: number): T;
    /**
     * Sets the element at index i in the slice to val
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
     */
    slice(start?: number, end?: number): Slice<T>;
    copy(src: Source<T>): number;
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
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     *
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     *
     * @virtual
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean;
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>;
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean;
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string | undefined): string;
}
/**
 * Combined into a construct cache
 */
export declare class StringBuilder {
    private a;
    constructor();
    write(...vals: Array<any>): void;
    undo(): string | undefined;
    toString(): string;
}
export declare class Bytes {
    readonly buffer: ArrayBuffer;
    readonly start: number;
    readonly end: number;
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws {@link core.errOutOfRange}
     */
    static attach(b: ArrayBuffer, start?: number, end?: number): Bytes;
    /**
     * Create a Bytes
     * @throws {@link core.errOutOfRange}
     */
    static make(length: number, capacity?: number): Bytes;
    /**
     * Create a Bytes from string
     */
    static fromString(str: string): Bytes;
    private constructor();
    /**
     * return bytes length
     */
    get length(): number;
    /**
     * return bytes capacity
     */
    get capacity(): number;
    /**
     *
     * return DataView of Bytes
     */
    dateView(): DataView;
    /**
     * take sub-slices
     */
    slice(start?: number, end?: number): Bytes;
    copy(src: Bytes): number;
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<number>;
    /**
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator](): Iterator<number>;
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<number>;
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals: Array<number>): Bytes;
    appendBytes(...vals: Array<Bytes>): Bytes;
    appendArrayBuffer(...vals: Array<ArrayBuffer>): Bytes;
    appendString(str: string): Bytes;
    private _append;
    toString(): string;
}
