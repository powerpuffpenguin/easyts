export interface Source<T> extends Iterable<T> {
    readonly length: number;
}
export declare class Slice<T> {
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
     */
    get(i: number): T;
    /**
     * return slice length
     */
    get length(): number;
    /**
     * return slice capacity
     */
    get capacity(): number;
}
