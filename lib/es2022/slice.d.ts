import { ClassForEach } from './internal/decorator';
export declare class Slice<T> extends ClassForEach<T> implements Iterable<T> {
    readonly array: Array<T>;
    readonly start: number;
    readonly end: number;
    /**
     * Creates a slice attached to the incoming array
     * @throws TypeError
     * @throws RangeError
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T>;
    /**
     * Create a slice
     * @throws TypeError
     * @throws RangeError
     */
    static make<T>(length: number, capacity?: number): Slice<T>;
    private constructor();
    /**
     * Returns the element at index i in the slice
     * @throws TypeError
     * @throws RangeError
     */
    get(i: number): T;
    /**
     * Sets the element at index i in the slice to val
     * @throws TypeError
     * @throws RangeError
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
     * @throws TypeError
     * @throws RangeError
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
export declare class Bytes extends ClassForEach<number> implements Iterable<number> {
    readonly buffer: ArrayBuffer;
    readonly start: number;
    readonly end: number;
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws TypeError
     * @throws RangeError
     */
    static attach(b: ArrayBuffer, start?: number, end?: number): Bytes;
    /**
     * Create a Bytes
     * @throws TypeError
     * @throws RangeError
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
     * @throws TypeError
     * @throws RangeError
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
