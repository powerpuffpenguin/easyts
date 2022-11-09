import { CompareCallback, DeleteCallback, CloneCallback } from "../core/types";
import { Basic, Options } from "./types";
/**
 * Initialize array to heap
 */
export declare function heapify<T>(h: Array<T>, cf?: CompareCallback<T>): Array<T>;
/**
 * Fix re-establishes the heap ordering after the element at index i has changed its value.
 */
export declare function fix<T>(h: Array<T>, i: number, cf?: CompareCallback<T>): void;
/**
 * Pop removes and returns the minimum element (according to cf or <) from the heap.
 */
export declare function pop<T>(h: Array<T>, cf?: CompareCallback<T>, rf?: DeleteCallback<T>): T;
/**
 * Push pushes the element x onto the heap.
 */
export declare function push<T>(h: Array<T>, val: T, cf?: CompareCallback<T>): void;
/**
 * Remove removes and returns the element at index i from the heap.
 */
export declare function remove<T>(h: Array<T>, i: number, cf?: CompareCallback<T>, rf?: DeleteCallback<T>): T;
export declare class Heap<T> extends Basic<T> {
    private h_;
    /**
     * returns the length of the heap
     * @override
     */
    get length(): number;
    /**
     * returns the capacity of the heap
     * @override
     */
    get capacity(): number;
    get(i: number): T;
    set(i: number, val: T): void;
    constructor(opts?: Options<T>);
    push(...vals: Array<T>): void;
    pop(): T;
    remove(i: number): T;
    /**
     * Empty the data in the container
     *
     * @param callback Call callback on the removed element
     */
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
    clone(callback?: CloneCallback<T>): Heap<T>;
    /**
     * inserts a copy of another container of heap.
     */
    pushList(vals: Iterable<T>, callback?: CloneCallback<T>): void;
}
