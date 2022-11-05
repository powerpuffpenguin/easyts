import { Exception } from "../core/exception";
/**
 * Exceptions thrown by container operations
 */
export declare class ContainerException extends Exception {
}
/**
 * The container has reached the capacity limit and cannot add new data
 */
export declare const errBadAdd: ContainerException;
/**
 * iterator is invalid
 */
export declare const errIteratorInvalid: ContainerException;
/**
* iterator is invalid, usually because the container is empty
*/
export declare const errNoData: ContainerException;
/**
 * An extended iterator that provides more functionality than js iterators
 */
export interface ExpandIterator<T> extends Iterable<T> {
    /**
     * Set the value of the iteration position
     * @param v
     *
     * @throws {@link errIteratorInvalid}
     */
    set(v: T): void;
    /**
     * Returns the value at the iteration position
     *
     * @throws {@link errIteratorInvalid}
     */
    get(): T;
    /**
     * Whether the iterator is valid, operation on an invalid iterator, the behavior will be undefined
     *
     * @remarks
     * For example, deleting the element of the iterator will invalidate the iterator, and it will return an invalid iterator after traversing the container
     */
    readonly ok: boolean;
    /**
     * Returns a new iterator to point to the next element
     */
    next(): ExpandIterator<T>;
    /**
     * Returns a new iterator to point to the previous element
     */
    prev(): ExpandIterator<T>;
    /**
     * Use js iterator to iterate the container from the current position
     */
    [Symbol.iterator](): Iterator<T>;
}
/**
 * an invalid iterator to indicate the end of the iteration
 */
export declare const endIterator: ExpandIterator<any>;
/**
 * container interface
 *
 * @remarks
 * Describes the methods and properties that all containers have
 */
export interface Container<T> extends Iterable<T> {
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
     * Swap data in two containers
     *
     * @throws {@link errBadAdd}
     */
    swap(o: Container<T>): void;
    /**
     * Create a full copy of the container
     */
    clone(): Container<T>;
    /**
     * Returns true if the data depth of the two containers is consistent, and if the container data defines the equal function, the equal function will be called to compare the equality.
     * @param o
     */
    equal(o: Container<T>): boolean;
    /**
     * Empty the data in the container
     */
    clear(): void;
    /**
     * Returns an object that implements a js iterator, but it traverses the data in reverse
     */
    get reverse(): Iterable<T>;
    /**
     * Returns the expanded iterator
     */
    get iterator(): ExpandIterator<T>;
    /**
     * Returns the expanded iterator but traverses the container in reverse
     */
    get reverseIterator(): ExpandIterator<T>;
    /**
     * Call the callback in turn for each data in the container
     * @param callback
     */
    forEach(callback: (data: T) => void): void;
    /**
    * Call callback in turn (reverse) for each data in the container
    * @param callback
    */
    reverseForEach(callback: (data: T) => void): void;
    /**
     * Convert container to array
     */
    map<To>(f: (data: T) => To): Array<To>;
    /**
    * Convert container to reverse array
    */
    reverseMap<To>(f: (data: T) => To): Array<To>;
    /**
     * add element to the end of the container
     * @param vals
     *
     * @throws {@link errBadAdd}
     */
    pushBack(...vals: Array<T>): void;
    /**
    * add the element to the container head
    * @param vals
    *
    * @throws {@link errBadAdd}
    */
    pushFront(...vals: Array<T>): void;
    /**
     * remove the first element from the container
     *
     * @throws {@link errNoData}
     */
    popBack(): T;
    /**
    * remove the last element from the container
    *
    * @throws {@link errNoData}
    */
    popFront(): T;
    /**
    * Returns the first element in the container
    *
    * @throws {@link errNoData}
    */
    get first(): T;
    /**
    * Returns the last element in the container
    *
    * @throws {@link errNoData}
    */
    get last(): T;
    /**
     * delete the data pointed to by the iterator
     */
    erase(begin: ExpandIterator<T>, end?: ExpandIterator<T>): void;
}
