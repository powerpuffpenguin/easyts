import { noResult } from '../core';
import { CloneCallback, ValueCallback } from '../core/types';
import { Basic, Container, Options, errBadAdd, errEmpty } from './types';
export class ListElement<T>{
    next?: ListElement<T>
    prev?: ListElement<T>
    constructor(public data?: T) { }
}
export interface ListOptions<T> extends Options<T> {
    /**
     * If it is greater than 0, it will be used as the upper limit of the capacity of the linked list.
     * 
     * @defaultValue Number.MAX_SAFE_INTEGER
     */
    readonly capacity: number
}
/**
 * Doubly linked list
 * @sealed
 */
export class List<T> extends Basic<T> implements Container<T> {
    protected get opts(): ListOptions<T> {
        return this.opts_
    }
    /**
     * linked list length
     */
    private length_ = 0
    /**
     * linked list head
     */
    private front_?: ListElement<T>
    /**
     * tail of linked list
     */
    private back_?: ListElement<T>
    /**
     * Returns the current amount of data in the container
     * @override
     */
    get length(): number {
        return this.length_
    }
    /**
     * Returns the current capacity of the container
     * @override
     */
    get capacity(): number {
        return this.capacity_
    }
    private capacity_: number
    constructor(opts?: ListOptions<T>) {
        super(opts)
        if (opts) {
            const v = Math.floor(opts.capacity)
            if (isFinite(v) && v > 0) {
                this.capacity_ = v
                return
            }
        }
        this.capacity_ = Number.MAX_SAFE_INTEGER
    }
    /**
     * Swap data in two containers
     * @override
     */
    swap(o: List<T>): void {
        [
            this.opts_, this.capacity_, this.length_, this.front_, this.back_,
            o.opts_, o.capacity_, o.length_, o.front_, o.back_,
        ] = [
                o.opts_, o.capacity_, o.length_, o.front_, o.back_,
                this.opts_, this.capacity_, this.length_, this.front_, this.back_,
            ]
    }
    /**
     * Create a full copy of the container
     * @override
     * 
     * @param callback How to create a duplicate copy of an element 
     */
    clone(callback?: CloneCallback<T>): List<T> {
        const l = new List(this.opts)
        callback = callback ?? this.opts.clone
        if (callback) {
            for (const v of this.iterable) {
                l.pushBack(callback(v))
            }
        } else {
            for (const v of this.iterable) {
                l.pushBack(v)
            }
        }
        return l
    }
    /**
     * Empty the data in the container
     * @override
     * @param callback Call callback on the removed element
     */
    clear(callback?: ValueCallback<T>): void {
        if (this.isEmpty) {
            return
        }
        callback = callback ?? this.opts.erase
        if (callback) {
            for (const v of this.iterable) {
                callback(v)
            }
        }
        this.front_ = undefined
        this.back_ = undefined
        this.length_ = 0
    }
    /**
     * Returns a js iterator
     * @override
     * 
     * @param reverse The iterator returned if true will traverse the container in reverse order
     * 
     */
    iterator(reverse?: boolean): Iterator<T> {
        if (reverse) {
            let current = this.back_
            return {
                next() {
                    if (current) {
                        const data = current.data as any
                        current = current.prev
                        return {
                            value: data,
                        }
                    }
                    return noResult
                }
            }
        } else {
            let current = this.front_
            return {
                next() {
                    if (current) {
                        const data = current.data as any
                        current = current.next
                        return {
                            value: data,
                        }
                    }
                    return noResult
                }
            }
        }
    }
    /**
     * add element to the end of the container
     * @override
     * 
     * @param vals 
     * 
     * @throws {@link errBadAdd}
     */
    pushBack(...vals: Array<T>): void {
        if (vals.length == 0) {
            return
        }
        const free = this.capacity - this.length
        if (free < vals.length) {
            throw errBadAdd
        }
        let front = this.front_
        if (front) {
            let back = this.back_ as ListElement<T>
            for (let i = 0; i < vals.length; i++) {
                const current = new ListElement<T>(vals[i])

                current.prev = back
                back.next = current

                back = current
            }
            this.back_ = back
        } else {
            let back = new ListElement<T>(vals[0])
            this.front_ = back

            for (let i = 1; i < vals.length; i++) {
                const current = new ListElement<T>(vals[i])

                current.prev = back
                back.next = current

                back = current
            }
            this.back_ = back
        }
        this.length_ += vals.length
    }
    /**
    * add the element to the container head
    * @override
    * 
    * @param vals 
    * 
    * @throws {@link errBadAdd}
    * 
    */
    pushFront(...vals: Array<T>): void {
        if (vals.length == 0) {
            return
        }
        const free = this.capacity - this.length
        if (free < vals.length) {
            throw errBadAdd
        }
        let front = this.front_
        let i = vals.length - 1
        if (front) {
            for (; i >= 0; i--) {
                const current = new ListElement<T>(vals[i])
                current.next = front
                front.prev = current

                front = current
            }
            this.front_ = front
        } else {
            let front = new ListElement<T>(vals[i--])
            this.back_ = front
            for (; i >= 0; i--) {
                const current = new ListElement<T>(vals[i])
                current.next = front
                front.prev = current

                front = current
            }
            this.front_ = front
        }
        this.length_ += vals.length
    }
    /**
     * remove the first element from the container
     * @override
     * 
     * @param callback Call callback on the removed element
     * @throws {@link errEmpty} 
     */
    popBack(callback?: ValueCallback<T>): T {
        const back = this.back_
        if (!back) {
            throw errEmpty
        }
        this.length_--
        this.back_ = back.prev
        if (this.back_) {
            this.back_.next = undefined
        } else {
            this.front_ = undefined
        }
        back.prev = undefined
        const data = back.data as any
        callback = callback ?? this.opts.erase
        if (callback) {
            callback(data)
        }
        return data
    }
    /**
    * remove the last element from the container
    * @override
    * 
    * @param callback Call callback on the removed element
    * @throws {@link errEmpty} 
    */
    popFront(callback?: ValueCallback<T>): T {
        const front = this.front_
        if (!front) {
            throw errEmpty
        }
        this.length_--
        this.front_ = front.next
        if (this.front_) {
            this.front_.prev = undefined
        } else {
            this.back_ = undefined
        }
        front.next = undefined
        const data = front.data as any
        callback = callback ?? this.opts.erase
        if (callback) {
            callback(data)
        }
        return data
    }
    /**
    * Returns the last element in the container
    * @override
    * 
    * @throws {@link errEmpty} 
    */
    get back(): T {
        const v = this.back_
        if (!v) {
            throw errEmpty
        }
        return v.data as any
    }
    /**
    * Returns the first element in the container
    * @override
    * 
    * @throws {@link errEmpty} 
    */
    get front(): T {
        const v = this.front_
        if (!v) {
            throw errEmpty
        }
        return v.data as any
    }

    /**
     * Returns the head node of the linked list
     */
    get first(): ListElement<T> | undefined {
        return this.front_
    }
    /**
     * Returns the tail node of the linked list
     */
    get last(): ListElement<T> | undefined {
        return this.back_
    }
    /**
     * Remove element from linked list
     * @param e  
     */
    remove(e: ListElement<T>, callback?: ValueCallback<T>): boolean {
        if (e == this.front_) {
            this.popFront(callback)
            return true
        } else if (e == this.back_) {
            this.popBack(callback)
            return true
        }
        if (!e.next || !e.prev || this.length_ < 3) {
            return false
        }
        this.length_--
        e.prev.next = e.next
        e.next.prev = e.prev
        callback = callback ?? this.opts.erase
        if (callback) {
            callback(e.data as any)
        }
        return true
    }
    /**
     * inserts a new element e with value v immediately after mark and returns e.
     * @param v 
     * @param mark 
     */
    insertAfter(v: T, mark: ListElement<T>): ListElement<T> {
        const ele = new ListElement<T>(v)
        ele.prev = mark
        ele.next = mark.next
        mark.next = ele

        if (mark == this.back_) {
            this.back_ = ele
        }
        this.length_++
        return ele
    }
    /**
     * inserts a new element e with value v immediately before mark and returns e.
     */
    insertBefore(v: T, mark: ListElement<T>): ListElement<T> {
        const ele = new ListElement<T>(v)
        ele.prev = mark.prev
        mark.prev = ele
        ele.next = mark

        if (mark == this.front_) {
            this.front_ = ele
        }
        this.length_++
        return ele
    }
    /**
     * moves element e to its new position after mark.
     */
    moveAfter(e: ListElement<T>, mark: ListElement<T>) {
        throw 'not implemented'
    }
    /**
     * moves element e to its new position before mark.
     */
    moveBefore(e: ListElement<T>, mark: ListElement<T>) {
        throw 'not implemented'
    }
    /**
     * moves element e to the back of list 
     */
    moveToBack(e: ListElement<T>) {
        throw 'not implemented'
    }
    /**
     * moves element e to the front of list
     */
    moveToFront(e: ListElement<T>) {
        throw 'not implemented'
    }
}