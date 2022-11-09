/**
 * A queue implemented using fixed-length arrays
 */
export declare class Queue<T> {
    private readonly arrs;
    private offset_;
    private size_;
    constructor(arrs: Array<T>);
    get length(): number;
    get capacity(): number;
    push(val: T): boolean;
    pop(): IteratorResult<T>;
}
