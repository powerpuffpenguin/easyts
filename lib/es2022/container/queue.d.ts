import { Basic, Options } from './types';
import { CloneCallback, DeleteCallback } from "../core/types";
/**
 * A queue implemented using fixed-length arrays
 */
export declare class Queue<T> extends Basic<T> {
    /**
     * offset of array
     */
    private offset_;
    /**
     * queue size
     */
    private size_;
    private a_;
    /**
     *
     * @param capacity if < 1 use default 10
     * @param opts
     */
    constructor(capacity?: number, opts?: Options<T>);
    /**
     * returns the length of the queue
     * @override
     */
    get length(): number;
    /**
     * returns the capacity of the queue
     * @override
     */
    get capacity(): number;
    /**
     * get queue element
     * @throws {@link errOutOfRange}
     */
    get(i: number): T;
    /**
     * set queue element
     * @throws {@link errOutOfRange}
     */
    set(i: number, val: T): void;
    pushBack(val: T): boolean;
    pushFront(val: T): boolean;
    popFront(callback?: DeleteCallback<T>): IteratorResult<T>;
    popBack(callback?: DeleteCallback<T>): IteratorResult<T>;
    clear(callback?: DeleteCallback<T>): void;
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    clone(callback?: CloneCallback<T>): Queue<T>;
    /**
     * push a copy of another container of queue.
     */
    pushList(vals: Iterable<T>, callback?: CloneCallback<T>): void;
}
