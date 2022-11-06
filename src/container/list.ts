import { noResult } from '../core';
import { CloneCallback, ValueCallback } from '../core/types';
import { Basic, Container, Options, errBadAdd, errEmpty, errIteratorInvalid } from './types';
export class ListElement<T>{
    /**
     * @internal
     */
    next_?: ListElement<T>
    /**
     * @internal
     */
    prev_?: ListElement<T>
    /**
     * @internal
     */
    list_?: ListImpl<T>
    constructor(list?: ListImpl<T>, public data?: T) {
        this.list_ = list
    }
    get next(): ListElement<T> | undefined {
        return this.next_
    }
    get prev(): ListElement<T> | undefined {
        return this.prev_
    }
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
 * The underlying implementation of linked lists
 * @internal
 */
class ListImpl<T>{
    /**
     * linked list length
     */
    private length_ = 0
    length() {
        return this.length_
    }
    /**
     * sentinel list element, only &root, root.prev, and root.next are used
     */
    private root: ListElement<T>
    constructor(public readonly capacity: number) {
        const root = new ListElement<T>()
        root.prev_ = root
        root.next_ = root
        this.root = root
    }

    clear(): void {
        let ele = this.first()
        if (ele) {
            while (ele) {
                ele.list_ = undefined
                ele = ele.next_
            }
            const root = this.root
            root.prev_ = root
            root.next_ = root
            this.length_ = 0
        }
    }
    iterator(reverse?: boolean): Iterator<T> {
        if (reverse) {
            let current = this.last()
            return {
                next() {
                    if (current) {
                        const data = current.data as any
                        current = current.prev_
                        return {
                            value: data,
                        }
                    }
                    return noResult
                }
            }
        } else {
            let current = this.first()
            return {
                next() {
                    if (current) {
                        const data = current.data as any
                        current = current.next_
                        return {
                            value: data,
                        }
                    }
                    return noResult
                }
            }
        }
    }
    pushBack(...vals: Array<T>): void {
        if (vals.length == 0) {
            return
        }
        const free = this.capacity - this.length_
        if (free < vals.length) {
            throw errBadAdd
        }
        const root = this.root
        for (const v of vals) {
            this.insertValue(v, root.prev_ as any)
        }
    }
    pushFront(...vals: Array<T>): void {
        if (vals.length == 0) {
            return
        }
        const free = this.capacity - this.length_
        if (free < vals.length) {
            throw errBadAdd
        }
        const root = this.root
        for (let i = vals.length - 1; i >= 0; i--) {
            this.insertValue(vals[i], root)
        }
    }
    back(): T {
        if (this.length_ == 0) {
            throw errEmpty
        }
        return (this.root.prev_ as any).data
    }
    front(): T {
        if (this.length_ == 0) {
            throw errEmpty
        }
        return (this.root.next_ as any).data
    }
    first(): ListElement<T> | undefined {
        if (this.length_ == 0) {
            return
        }
        return this.root.next_
    }
    last(): ListElement<T> | undefined {
        if (this.length_ == 0) {
            return
        }
        return this.root.prev_
    }
    remove(ele: ListElement<T>, callback?: ValueCallback<T>) {
        (ele.prev_ as ListElement<T>).next_ = ele.next_;
        (ele.next_ as ListElement<T>).prev_ = ele.prev_;
        ele.next_ = undefined // avoid memory leaks
        ele.prev_ = undefined // avoid memory leaks
        ele.list_ = undefined
        if (callback) {
            callback(ele.data as any)
        }
    }
    insert(ele: ListElement<T>, at: ListElement<T>) {
        ele.prev_ = at
        ele.next_ = at.next_
        ele.prev_.next_ = ele;
        (ele.next_ as ListElement<T>).prev_ = ele
        this.length_++
    }
    insertValue(data: T, at: ListElement<T>): ListElement<T> {
        const ele = new ListElement(this, data)
        this.insert(ele, at)
        return ele
    }
    move(ele: ListElement<T>, mark: ListElement<T>): boolean {
        if (ele == mark) {
            return false
        }
        (ele.prev_ as any).next_ = ele.next_;
        (ele.next_ as any).prev_ = ele.prev_;

        ele.prev_ = mark
        ele.next_ = mark.next_
        ele.prev_.next_ = ele;
        (ele.next_ as any).prev_ = ele
        return true
    }
    moveToBack(ele: ListElement<T>): boolean {
        const root = this.root
        if (root.prev == ele) {
            return false
        }
        return this.move(ele, root.prev as any)
    }
    moveToFront(ele: ListElement<T>): boolean {
        const root = this.root
        if (root.next == ele) {
            return false
        }
        return this.move(ele, root)
    }
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
     * @internal
     */
    private impl_: ListImpl<T>
    /**
     * Returns the current amount of data in the container
     * @override
     */
    get length(): number {
        return this.impl_.length()
    }
    /**
     * Returns the current capacity of the container
     * @override
     */
    get capacity(): number {
        return this.impl_.capacity
    }
    constructor(opts?: ListOptions<T>) {
        super(opts)
        let capacity = Number.MAX_SAFE_INTEGER
        if (opts) {
            const v = Math.floor(opts.capacity)
            if (isFinite(v) && v > 0) {
                capacity = v
            }
        }
        this.impl_ = new ListImpl<T>(capacity)
    }
    /**
     * Swap data in two containers
     * @override
     */
    swap(o: List<T>): void {
        [
            this.opts_, this.impl_,
            o.opts_, o.impl_,
        ] = [
                o.opts_, o.impl_,
                this.opts_, this.impl_,
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
        this.impl_.clear()
    }
    /**
     * Returns a js iterator
     * @override
     * 
     * @param reverse The iterator returned if true will traverse the container in reverse order
     * 
     */
    iterator(reverse?: boolean): Iterator<T> {
        return this.impl_.iterator(reverse)
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
        this.impl_.pushBack(...vals)
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
        this.impl_.pushFront(...vals)
    }
    /**
     * remove the first element from the container
     * @override
     * 
     * @param callback Call callback on the removed element
     * @throws {@link errEmpty} 
     */
    popBack(callback?: ValueCallback<T>): T {
        const list = this.impl_
        const ele = list.last()
        if (!ele) {
            throw errEmpty
        }
        list.remove(ele, callback ?? this.opts.erase)
        return ele.data as any
    }
    /**
    * remove the last element from the container
    * @override
    * 
    * @param callback Call callback on the removed element
    * @throws {@link errEmpty} 
    */
    popFront(callback?: ValueCallback<T>): T {
        const list = this.impl_
        const ele = list.first()
        if (!ele) {
            throw errEmpty
        }
        list.remove(ele, callback ?? this.opts.erase)
        return ele.data as any
    }
    /**
    * Returns the last element in the container
    * @override
    * 
    * @throws {@link errEmpty} 
    */
    get back(): T {
        return this.impl_.back()
    }
    /**
    * Returns the first element in the container
    * @override
    * 
    * @throws {@link errEmpty} 
    */
    get front(): T {
        return this.impl_.front()
    }

    /**
     * Returns the head node of the linked list
     */
    get first(): ListElement<T> | undefined {
        return this.impl_.first()
    }
    /**
     * Returns the tail node of the linked list
     */
    get last(): ListElement<T> | undefined {
        return this.impl_.last()
    }
    /**
     * Remove element from linked list
     * 
     * @param ele  the element to remove, if e is not an element of the list do nothing and return false
     */
    remove(ele: ListElement<T>, callback?: ValueCallback<T>): boolean {
        const list = this.impl_
        if (list != ele.list_) {
            return false
        }
        list.remove(ele, callback ?? this.opts.erase)
        return true
    }
    /**
     * inserts a new element e with value v immediately after mark and returns e.
     * @param v  data to be inserted
     * @param mark insert a position mark, if mark is not an element of the list do nothing and return undefined
     */
    insertAfter(v: T, mark: ListElement<T>): ListElement<T> | undefined {
        const list = this.impl_
        if (list != mark.list_) {
            return
        }
        const ele = new ListElement<T>(list, v)
        list.insert(ele, mark)
        return ele
    }
    /**
     * inserts a new element e with value v immediately before mark and returns e.
     * @param v  data to be inserted
     * @param mark insert a position mark, if mark is not an element of the list do nothing and return undefined
     */
    insertBefore(v: T, mark: ListElement<T>): ListElement<T> | undefined {
        const list = this.impl_
        if (list != mark.list_) {
            return
        }
        const ele = new ListElement<T>(list, v)
        list.insert(ele, mark.prev_ as any)
        return ele
    }
    /**
     * Moving ele to after mark, if ele or mark is not a list element, do nothing and return false
     * @param ele element to move
     * @param mark position marker to move
     * @returns Whether the list element has moved
     */
    moveAfter(ele: ListElement<T>, mark: ListElement<T>): boolean {
        const list = this.impl_
        if (list != ele.list_ ||
            list != mark.list_ ||
            ele == mark) {
            return false
        }
        return list.move(ele, mark)
    }
    /**
     * Moving ele to before mark, if ele or mark is not a list element, do nothing and return false
     * @param ele element to move
     * @param mark position marker to move
     * @returns Whether the list element has moved
     */
    moveBefore(ele: ListElement<T>, mark: ListElement<T>): boolean {
        const list = this.impl_
        if (list != ele.list_ ||
            list != mark.list_ ||
            ele == mark) {
            return false
        }
        return list.move(ele, mark.prev_ as any)
    }
    /**
     * Moving ele to back, if ele is not a list element, do nothing and return false
     * @param ele element to move
     * @returns Whether the list element has moved
     */
    moveToBack(ele: ListElement<T>): boolean {
        const list = this.impl_
        if (list != ele.list_) {
            return false
        }
        return list.moveToBack(ele)
    }
    /**
     * Moving ele to front, if ele is not a list element, do nothing and return false
     * @param ele element to move
     * @returns Whether the list element has moved
     */
    moveToFront(ele: ListElement<T>): boolean {
        const list = this.impl_
        if (list != ele.list_) {
            return false
        }
        return list.moveToFront(ele)
    }
}