import { Exception } from "../core/exception";
import { ValueCallback, DeleteCallback, MapCallback, CloneCallback, CompareCallback, Comparable, compare, ValidCallback } from "../core/types";
/**
 * Exceptions thrown by container operations
 */
export class ContainerException extends Exception { }


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
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element 
     */
    clone(callback?: CloneCallback<T>): Container<T>
    /**
     * Empty the data in the container
     * 
     * @param callback Call callback on the removed element
     */
    clear(callback?: DeleteCallback<T>): void
    /**
     * Returns true if the data depth of the two containers is consistent
     * @param o 
     */
    compareTo(o: Container<T>, callback?: CompareCallback<T>): number

    /**
     * Returns a js iterator
     * 
     * @param reverse If true, returns an iterator to traverse in reverse
     */
    iterator(reverse?: boolean): Iterator<T>;
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
     * @param reverse If true, traverse the container in reverse order
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean

    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator 
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string | undefined): string
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
     * If this callback function is set, this callback function will be called after the element is removed from the container
     */
    readonly remove?: DeleteCallback<T>
}
/**
 * The base class of the container implements some common methods for the container
 */
export class Basic<T> implements Iterable<T>{
    protected opts_: Options<T> | undefined
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
     * @param reverse If true, returns an iterator to traverse in reverse
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
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator](): Iterator<T> {
        return this.iterator()
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<T> {
        const i = this.iterator(true)
        return {
            *[Symbol.iterator]() {
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
        const it = reverse ? this.reverse : this
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
        const it = reverse ? this.reverse : this
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
        const it = reverse ? this.reverse : this
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
        const it = reverse ? this.reverse : this
        for (const v of it) {
            if (compare(data, v, callback) == 0) {
                return true
            }
        }
        return false
    }
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator 
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string | undefined): string {
        return this.map((v) => `${v}`).join(separator)
    }
}

