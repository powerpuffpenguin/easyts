import { noResult } from "../core";
import { Exception } from "../core/exception";
import { ValueCallback, MapCallback, CloneCallback, CompareCallback, Swappable, Comparable, compare, ValidCallback } from "../core/types";
/**
 * Exceptions thrown by container operations
 */
export class ContainerException extends Exception { }
/**
 * The container has reached the capacity limit and cannot add new data
 */
export const errBadAdd = new ContainerException('The container has reached the capacity limit and cannot add new data')
export const errEmpty = new ContainerException('The container is empty')


/**
 * container interface
 * 
 * @remarks
 * Describes the methods and properties that all containers have
 */
export interface Container<T> extends Swappable<T>, Comparable<T> {
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
     */
    swap(o: Container<T>): void
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element 
     */
    clone(callback?: CloneCallback<T>): Container<T>
    /**
     * Empty the data in the container
     */
    clear(): void
    /**
     * Returns true if the data depth of the two containers is consistent
     * @param o 
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number

    /**
     * Returns a js iterator
     * 
     * @param reverse The iterator returned if true will traverse the container in reverse order
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * Returns an object that implements a js Iterable
     */
    get iterable(): Iterable<T>;
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     */
    get reverse(): Iterable<T>
    /**
     * call callback on each element in the container in turn
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void

    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean
    /**
     * Convert container to array
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>
    /**
     * Returns whether the data data exists in the container
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean


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
     * @throws {@link errEmpty} 
     */
    popBack(): T
    /**
    * remove the last element from the container
    * 
    * @throws {@link errEmpty} 
    */
    popFront(): T
    /**
    * Returns the first element in the container
    * 
    * @throws {@link errEmpty} 
    */
    get front(): T
    /**
    * Returns the last element in the container
    * 
    * @throws {@link errEmpty} 
    */
    get back(): T
}
/**
 * The base class of the container implements some common methods for the container
 */
export class Basic<T>{
    protected constructor() { }
    /**
     * Returns the current amount of data in the container
     * @virtual
     */
    get length(): number {
        throw new ContainerException('function length not implemented')
    }
    /**
     * Returns a js iterator
     * @param reverse The iterator returned if true will traverse the container in reverse order
     * @virtual
     * 
     */
    iterator(reverse?: boolean): Iterator<T> {
        throw new ContainerException('function iterator not implemented')
    }

    /**
     * Returns true if the data depth of the two containers is consistent
     * @param o 
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number {
        let l = this.iterator(true)
        let r = o.iterator(true)
        while (true) {
            const v0 = l.next()
            const v1 = r.next()
            if (v0.done) {
                if (!v1.done) {
                    return -1
                }
                break
            } else if (v1.done) {
                return 1
            }
            const v = compare(v0.value, v1.value, callback)
            if (v != 0) {
                return v
            }
        }
        return 0
    }
    /**
     * Returns an object that implements a js Iterable
     * @sealedl
     */
    get iterable(): Iterable<T> {
        const i = this.iterator()
        return {
            [Symbol.iterator]() {
                return i
            }
        }
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<T> {
        const i = this.iterator(true)
        return {
            [Symbol.iterator]() {
                return i
            }
        }
    }
    /**
     * call callback on each element in the container in turn
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     * 
     * @virtual
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void {
        const it = reverse ? this.reverse : this.iterable
        for (const v of it) {
            callback(v)
        }
    }
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean {
        const it = reverse ? this.reverse : this.iterable
        for (const v of it) {
            if (callback(v)) {
                return true
            }
        }
        return false
    }
    /**
     * Convert container to array
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     * 
     * @virtual
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO> {
        const length = this.length
        if (length == 0) {
            return new Array<TO>()
        }
        const it = reverse ? this.reverse : this.iterable
        const result = new Array<TO>(length)
        let i = 0
        for (const v of it) {
            result[i++] = callback(v)
        }
        return result
    }
    /**
     * Returns whether the data data exists in the container
     * 
     * @virtual
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean {
        const it = reverse ? this.reverse : this.iterable
        for (const v of it) {
            if (compare(data, v, callback) == 0) {
                return true
            }
        }
        return false
    }

}
