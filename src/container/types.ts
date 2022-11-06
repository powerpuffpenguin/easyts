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
     * 
     * @param callback Call callback on the removed element
     */
    clear(callback?: ValueCallback<T>): void
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
     * add element to the end of the container
     * @param vals 
     * 
     * @throws {@link errBadAdd}
     */
    pushBackIterable(it: Iterable<T>): void
    /**
    * add the element to the container head
    * @param vals 
    * 
    * @throws {@link errBadAdd}
    */
    pushFrontIterable(it: Iterable<T>): void
    /**
     * remove the first element from the container
     * 
     * @param callback Call callback on the removed element
     * @throws {@link errEmpty} 
     */
    popBack(callback?: ValueCallback<T>): T
    /**
    * remove the last element from the container
    * 
    * @param callback Call callback on the removed element
    * @throws {@link errEmpty} 
    */
    popFront(callback?: ValueCallback<T>): T
    /**
    * Returns the last element in the container
    * 
    * @throws {@link errEmpty} 
    */
    get back(): T
    /**
    * Returns the first element in the container
    * 
    * @throws {@link errEmpty} 
    */
    get front(): T
}
/**
 * Container Creation Options
 */
export interface Options<T> {
    /**
     * How the container creates a copy of the element, by default it is created with the = sign
     */
    readonly clone?: CloneCallback<T>
    /**
     * How containers compare element , by default using == and <  
     */
    readonly compare?: CompareCallback<T>
    /**
     * If this callback function is set, this callback function will be called before the element is removed from the container
     */
    readonly erase?: ValueCallback<T>
}
/**
 * The base class of the container implements some common methods for the container
 */
export class Basic<T>{
    protected opts_: any
    protected constructor(opts?: Options<T>) {
        this.opts_ = opts
    }
    /**
     * Returns the current amount of data in the container
     * 
     * @virtual
     */
    get length(): number {
        throw new ContainerException('function length not implemented')
    }
    /**
     * Returns the current capacity of the container
     * 
     * @virtual
     */
    get capacity(): number {
        throw new ContainerException('function capacity not implemented')
    }
    /**
     * Returns true if there is no data in the container
     * 
     * @virtual
     */
    get isEmpty(): boolean {
        return this.length == 0
    }
    /**
     * Returns true if there is data in the container
     * 
     * @virtual
     */
    get isNotEmpty(): boolean {
        return this.length != 0
    }
    /**
     * Returns true if the container has reached the container limit
     * 
     * @virtual
     */
    get isFull(): boolean {
        return this.length == this.capacity
    }
    /**
     * Returns true if the container has not reached the container limit
     * 
     * @virtual
     */
    get isNotFull(): boolean {
        return this.length < this.capacity
    }

    /**
     * Returns a js iterator
     * @param reverse The iterator returned if true will traverse the container in reverse order
     * 
     * @virtual
     * 
     */
    iterator(reverse?: boolean): Iterator<T> {
        throw new ContainerException('function iterator not implemented')
    }

    /**
     * Returns true if the data depth of the two containers is consistent
     * 
     * @param o 
     * 
     * @virtual
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number {
        callback = callback ?? this.opts_?.compare

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
     * add element to the end of the container
     * @throws {@link errBadAdd}
     */
    pushBack(...vals: Array<T>): void {
        throw new ContainerException('function pushBack not implemented')
    }
    /**
    * add the element to the container head
    * @throws {@link errBadAdd}
    */
    pushFront(...vals: Array<T>): void {
        throw new ContainerException('function pushFront not implemented')
    }
    /**
     * add element to the end of the container
     * @param vals 
     * 
     * @throws {@link errBadAdd}
     * 
     * @virtual
     */
    pushBackIterable(it: Iterable<T>): void {
        const vals = new Array<T>()
        for (const v of it) {
            vals.push(v)
        }
        if (vals.length != 0) {
            this.pushBack(...vals)
        }
    }
    /**
    * add the element to the container head
    * @param vals 
    * 
    * @throws {@link errBadAdd}
    * 
    * @virtual
    */
    pushFrontIterable(it: Iterable<T>): void {
        const vals = new Array<T>()
        for (const v of it) {
            vals.push(v)
        }
        if (vals.length != 0) {
            this.pushFront(...vals)
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
     * 
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     * 
     * @virtual
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
        callback = callback ?? this.opts_?.compare

        const it = reverse ? this.reverse : this.iterable
        for (const v of it) {
            if (compare(data, v, callback) == 0) {
                return true
            }
        }
        return false
    }

}

