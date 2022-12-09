import { noResult } from "../values"
import { Basic, Options } from './types';
import { CloneCallback, DeleteCallback, ReturnValue, ReturnValueRaw } from "../types";
import { defaultAssert } from "../assert";
/**
 * A queue implemented using fixed-length arrays
 * @sealed
 */
export class Queue<T> extends Basic<T> {
    /**
     * offset of array
     */
    private offset_ = 0
    /**
     * queue size
     */
    private size_ = 0
    private a_: Array<T>
    /**
     * 
     * @param capacity if < 1 use default 10
     * @param opts 
     */
    constructor(capacity = 10, opts?: Options<T>) {
        super(opts)
        capacity = Math.floor(capacity)
        if (capacity < 1) {
            capacity = 10
        }
        this.a_ = new Array<T>(capacity)
    }
    /**
     * returns the length of the queue
     * @override
     */
    get length(): number {
        return this.size_
    }
    /**
     * returns the capacity of the queue
     * @override
     */
    get capacity(): number {
        return this.a_.length
    }
    /**
     * get queue element
     * @throws TypeError
     * @throws RangeError
     */
    get(i: number): T {
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.size_,
        })

        const a = this.a_
        return a[(this.offset_ + i) % a.length]
    }
    /**
     * set queue element
     * @throws TypeError
     * @throws RangeError
     */
    set(i: number, val: T): void {
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.size_,
        })

        const a = this.a_
        a[(this.offset_ + i) % a.length] = val
    }
    /**
     * inserts val at the back of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    pushBack(val: T): boolean {
        const a = this.a_
        const size = this.size_
        if (size == a.length) {
            return false
        }
        a[(this.offset_ + size) % a.length] = val
        this.size_++
        return true
    }
    /**
     * inserts val at the front of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    pushFront(val: T): boolean {
        const a = this.a_
        const size = this.size_
        if (size == a.length) {
            return false
        }
        if (this.offset_ == 0) {
            this.offset_ = a.length
        }
        this.offset_--
        a[this.offset_] = val
        this.size_++
        return true
    }
    /**
     * If the queue is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popFront(callback?: DeleteCallback<T>): ReturnValue<T> {
        return this.popFrontRaw(callback)[0]
    }
    /**
     * If the queue is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popFrontRaw(callback?: DeleteCallback<T>): ReturnValueRaw<T> {
        const size = this.size_
        if (size == 0) {
            return [undefined, false]
        }
        const a = this.a_
        const val = a[this.offset_++]
        if (this.offset_ == a.length) {
            this.offset_ = 0
        }
        this.size_--
        callback = this.opts_?.remove
        if (callback) {
            callback(val)
        }
        return [val, true]
    }
    /**
     * If the queue is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popBack(callback?: DeleteCallback<T>): ReturnValue<T> {
        return this.popBackRaw(callback)[0]
    }
    /**
     * If the queue is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popBackRaw(callback?: DeleteCallback<T>): ReturnValueRaw<T> {
        const size = this.size_
        if (size == 0) {
            return [undefined, false]
        }
        const a = this.a_
        const val = a[(this.offset_ + size - 1) % a.length]
        this.size_--
        if (callback) {
            callback(val)
        }
        return [val, true]
    }
    /**
     * clear the queue
     * @param callback call the callback on the removed element
     */
    clear(callback?: DeleteCallback<T>) {
        callback = callback ?? this.opts_?.remove
        if (callback) {
            for (const v of this.a_) {
                callback(v)
            }
        }
        this.a_.splice(0)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T> {
        const a = this.a_
        const length = a.length
        const size = this.size_
        const offset = this.offset_
        if (reverse) {
            let i = size - 1
            return {
                next() {
                    if (i >= 0) {
                        return {
                            value: a[(offset + (i--)) % length],
                        }
                    }
                    return noResult
                }
            }
        } else {
            let i = 0
            return {
                next() {
                    if (i < size) {
                        return {
                            value: a[(offset + (i++)) % length],
                        }
                    }
                    return noResult
                }
            }
        }
    }
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element 
     */
    clone(callback?: CloneCallback<T>): Queue<T> {
        const l = new Queue<T>(this.a_.length, this.opts_)
        callback = callback ?? this.opts_?.clone
        if (callback) {
            l.pushList(this, callback)
        } else {
            l.pushList(this)
        }
        return l
    }
    /**
     * push a copy of another container of queue.
     */
    pushList(vals: Iterable<T>, callback?: CloneCallback<T>) {
        callback = callback ?? this.opts_?.clone
        if (callback) {
            for (const v of vals) {
                this.pushBack(callback(v))
            }
        } else {
            for (const v of vals) {
                this.pushBack(v)
            }
        }
    }
}