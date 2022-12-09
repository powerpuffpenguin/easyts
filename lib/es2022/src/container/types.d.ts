import { ValueCallback, DeleteCallback, MapCallback, CloneCallback, CompareCallback, Comparable, ValidCallback } from "../types";
/**
 * container interface
 *
 * @remarks
 * Describes the methods and properties that all containers have
 */
export interface Container<T> extends Comparable<T>, Iterable<T> {
    /**
     * Returns the current amount of data in the container
     */
    readonly length: number;
    /**
     * Returns the current capacity of the container
     */
    readonly capacity: number;
    /**
     * Returns true if there is no data in the container
     */
    readonly isEmpty: boolean;
    /**
     * Returns true if there is data in the container
     */
    readonly isNotEmpty: boolean;
    /**
     * Returns true if the container has reached the container limit
     */
    readonly isFull: boolean;
    /**
     * Returns true if the container has not reached the container limit
     */
    readonly isNotFull: boolean;
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    clone(callback?: CloneCallback<T>): Container<T>;
    /**
     * Empty the data in the container
     *
     * @param callback Call callback on the removed element
     */
    clear(callback?: DeleteCallback<T>): void;
    /**
     * Returns true if the data depth of the two containers is consistent
     * @param o
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number;
    /**
     * Returns a js iterator
     *
     * @param reverse If true, returns an iterator to traverse in reverse
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     */
    get reverse(): Iterable<T>;
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void;
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean;
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>;
    /**
     * Returns whether the data data exists in the container
     * @param reverse If true, traverse the container in reverse order
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
 * Container Creation Options
 */
export interface Options<T> {
    /**
     * How the container creates a copy of the element, by default it is created with the = sign
     */
    readonly clone?: CloneCallback<T>;
    /**
     * How containers compare element , by default using == and <
     */
    readonly compare?: CompareCallback<T>;
    /**
     * If this callback function is set, this callback function will be called after the element is removed from the container
     */
    readonly remove?: DeleteCallback<T>;
}
/**
 * The base class of the container implements some common methods for the container
 */
export declare class Basic<T> implements Iterable<T> {
    protected opts_: Options<T> | undefined;
    protected constructor(opts?: Options<T>);
    /**
     * Returns the current amount of data in the container
     *
     * @virtual
     */
    get length(): number;
    /**
     * Returns the current capacity of the container
     *
     * @virtual
     */
    get capacity(): number;
    /**
     * Returns true if there is no data in the container
     *
     * @virtual
     */
    get isEmpty(): boolean;
    /**
     * Returns true if there is data in the container
     *
     * @virtual
     */
    get isNotEmpty(): boolean;
    /**
     * Returns true if the container has reached the container limit
     *
     * @virtual
     */
    get isFull(): boolean;
    /**
     * Returns true if the container has not reached the container limit
     *
     * @virtual
     */
    get isNotFull(): boolean;
    /**
     * Returns a js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     *
     * @virtual
     *
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * Returns true if the data depth of the two containers is consistent
     *
     * @param o
     *
     * @virtual
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number;
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
