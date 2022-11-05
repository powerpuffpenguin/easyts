import { Exception } from "../core/exception";
/**
 * Exceptions thrown by container operations
 */
export class ContainerException extends Exception { }
/**
 * The container has reached the capacity limit and cannot add new data
 */
export const errBadAdd = new ContainerException('The container has reached the capacity limit and cannot add new data')
export const errNoData = new ContainerException('not found any data')
/**
 * iterator is invalid
 */
export const errIteratorInvalid = new ContainerException('Iterator is invalid')

/**
 * Cannot append data after end iterator
 */
export const errAfterEnd = new ContainerException('Cannot append data after end iterator')

/**
 * Iterator begin and end do not match
 */
export const errRangeNotMatched = new ContainerException('[begin,end) not matched')

/**
* Iterator range is invalid
*/
export const errBadRange = new ContainerException('[begin,end) range is invalid')

/**
 * Iterator position is invalid
 * 
 * @remarks
 * 
 */
export const errPositionInvalid = new ContainerException('Iterator position is invalid')

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
    set(v: T): void
    /**
     * Returns the value at the iteration position
     * 
     * @throws {@link errIteratorInvalid}
     */
    get(): T

    /**
     * true if this is a reverse iterator, false otherwise
     */
    get r(): boolean

    /**
     * Whether the iterator is valid, operation on an invalid iterator, the behavior will be undefined
     * 
     * @remarks
     * For example, deleting the element of the iterator will invalidate the iterator, and it will return an invalid iterator after traversing the container
     */
    readonly ok: boolean
    /**
     * Returns a new iterator to point to the next element
     */
    next(): ExpandIterator<T>
    /**
     * Returns a new iterator to point to the previous element
     */
    prev(): ExpandIterator<T>

    /**
     * Use js iterator to iterate the container from the current position
     */
    [Symbol.iterator](): Iterator<T>

    /**
     * Returns the container to which the iterator belongs
     * 
     * @returns if deleted will return undefined
     * 
     */
    get c(): Container<T> | undefined

    /**
     * Returns true if both iterations point to the same position
     * @param o 
     */
    same(o: ExpandIterator<T>): boolean
}

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
    readonly length: number
    /**
     * Returns the current capacity of the container
     */
    readonly capacity: number
    /**
     * Returns true if there is no data in the container
     */
    readonly isEmpty: boolean
    /**
     * Returns true if there is data in the container
     */
    readonly isNotEmpty: boolean
    /**
     * Returns true if the container has reached the container limit
     */
    readonly isFull: boolean
    /**
     * Returns true if the container has not reached the container limit
     */
    readonly isNotFull: boolean
    /**
     * Swap data in two containers
     * 
     * @throws {@link errBadAdd}
     */
    swap(o: Container<T>): void
    /**
     * Create a full copy of the container
     */
    clone(): Container<T>
    /**
     * Returns true if the data depth of the two containers is consistent, and if the container data defines the equal function, the equal function will be called to compare the equality.
     * @param o 
     */
    equal(o: Container<T>): boolean
    /**
     * Empty the data in the container
     */
    clear(): void
    /**
     * Returns an object that implements a js iterator, but it traverses the data in reverse
     */
    get reverse(): Iterable<T>

    /**
     * Call the callback in turn for each data in the container
     * @param callback 
     */
    forEach(callback: (data: T) => void): void
    /**
    * Call callback in turn (reverse) for each data in the container
    * @param callback 
    */
    reverseForEach(callback: (data: T) => void): void

    /**
     * Convert container to array
     */
    map<To>(f: (data: T) => To): Array<To>

    /**
    * Convert container to reverse array
    */
    reverseMap<To>(f: (data: T) => To): Array<To>

    /**
     * add element to the end of the container
     * @param vals 
     * 
     * @throws {@link errBadAdd}
     */
    pushBack(...vals: Array<T>): void
    /**
    * add the element to the container head
    * @param vals 
    * 
    * @throws {@link errBadAdd}
    */
    pushFront(...vals: Array<T>): void

    /**
     * remove the first element from the container
     * 
     * @throws {@link errNoData} 
     */
    popBack(): T
    /**
    * remove the last element from the container
    * 
    * @throws {@link errNoData} 
    */
    popFront(): T
    /**
    * Returns the first element in the container
    * 
    * @throws {@link errNoData} 
    */
    get first(): T
    /**
    * Returns the last element in the container
    * 
    * @throws {@link errNoData} 
    */
    get last(): T

    /**
     * delete the data pointed to by the iterator
     */
    erase(iterator: ExpandIterator<T>): void

    /**
     * append data after iterator position
     * @param iterator 
     * @param vals 
     * 
     * @throws {@link errAfterEnd}
     */
    after(iterator: ExpandIterator<T>, ...vals: Array<T>): void
    /**
     * append data before iterator position
     * @param iterator 
     * @param vals 
     */
    before(iterator: ExpandIterator<T>, ...vals: Array<T>): void

    /**
     * Returns the start position of the forward extended iterator
     */
    begin(): ExpandIterator<T>
    /**
     * Returns the forward extended iterator end position
     */
    end(): ExpandIterator<T>
    /**
     * Returns the start position of the extended iterator in reverse
     */
    rbegin(): ExpandIterator<T>
    /**
     * Returns the end position of the extended iterator in reverse
     */
    rend(): ExpandIterator<T>

    /**
     * Returns true if it is an iterator of the current container, otherwise returns false
     */
    own(it: ExpandIterator<T>): boolean
}
