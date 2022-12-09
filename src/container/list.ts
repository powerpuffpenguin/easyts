import { DeleteCallback, CloneCallback, ReturnValue, ReturnValueRaw } from "../types";
import { noResult } from "../values";
import { Basic, Container, Options } from "./types";
/**
 * linked list element
 * @sealed
 */
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
     * which list the element is in
     */
    private list_?: List<T>
    /**
     * @internal
     */
    _list(): List<T> | undefined {
        return this.list_
    }
    /**
     * @internal
     */
    _remove() {
        this.list_ = undefined
    }
    /**
     * @internal
     * Create elements in internal
     */
    static make<T>(list?: List<T>, data?: T): ListElement<T> {
        return new ListElement<T>(list, data)
    }
    /**
     * Prohibit third-party instantiation
     */
    private constructor(list?: List<T>, public data?: T) {
        this.list_ = list
    }
    /**
     * return next element
     */
    next(): ListElement<T> | undefined {
        const list = this.list_
        if (!list) {
            return
        }
        const v = this.next_
        return v == list._root() ? undefined : v
    }
    /**
     * return previous element
     */
    prev(): ListElement<T> | undefined {
        const list = this.list_
        if (!list) {
            return
        }
        const v = this.prev_
        return v == list._root() ? undefined : v
    }

}
/**
 * Doubly linked list. Refer to the golang standard library implementation
 * @sealed
 */
export class List<T> extends Basic<T> implements Container<T>{
    /**
     * sentinel list element, only root, root.prev, and root.next are used
     */
    private root_: ListElement<T>
    /**
     * @internal
     */
    _root(): ListElement<T> {
        return this.root_
    }
    /**
     * record linked list length
     */
    private length_ = 0
    /**
     * returns the length of the linked list
     * @override
     */
    get length(): number {
        return this.length_
    }
    /**
     * returns the capacity of the linked list
     * @override
     */
    get capacity(): number {
        return Number.MAX_SAFE_INTEGER
    }
    constructor(opts?: Options<T>) {
        super(opts)
        const root = ListElement.make<T>()
        root.next_ = root
        root.prev_ = root
        this.root_ = root
    }
    /**
     * returns the first element of list l or undefined if the list is empty.
     */
    front(): ListElement<T> | undefined {
        if (this.length_ == 0) {
            return undefined
        }
        return this.root_.next_
    }
    /**
     *  returns the last element of list l or nil if the list is empty.
     */
    back(): ListElement<T> | undefined {
        if (this.length_ == 0) {
            return undefined
        }
        return this.root_.prev_
    }
    /**
     * insert inserts e after at, increments length
     */
    private _insert(e: ListElement<T>, at: ListElement<T>) {
        e.prev_ = at
        e.next_ = at.next_
        e.prev_.next_ = e
        e.next_!.prev_ = e

        this.length_++
    }
    // insertValue is a convenience wrapper for insert(&Element{Value: v}, at).
    private _insertValue(v: T, at: ListElement<T>): ListElement<T> {
        const e = ListElement.make(this, v)
        this._insert(e, at)
        return e
    }
    /**
     * remove removes e from its list, decrements length
     */
    private _remove(e: ListElement<T>): ListElement<T> {
        e.prev_!.next_ = e.next_
        e.next_!.prev_ = e.prev_
        e.next_ = undefined // avoid memory leaks
        e.prev_ = undefined // avoid memory leaks
        e._remove()
        this.length_--
        return e
    }
    /**
     * move moves e to next to at and returns e.
     */
    private _move(e: ListElement<T>, at: ListElement<T>): boolean {
        if (e == at) {
            return false
        }
        e.prev_!.next_ = e.next_
        e.next_!.prev_ = e.prev_

        e.prev_ = at
        e.next_ = at.next_
        e.prev_!.next_ = e
        e.next_!.prev_ = e
        return true
    }
    /**
     * clear the list
     * 
     * @remarks
     * It will cause a bug if a call to remove is passed after calling clear and an element before clear is passed in. like this
     * 
     * ```
     * const l = new List<number>()
     * const ele = l.pushBack(1)
     * l.cear()
     * console.log((l.remove(ele)) // output true
     * console.log(l.length) // output -1
     * ```
     * 
     * This bug is generated because the element records which linked list it is in and the clear function does not clear the mark .
     * 
     * So remove(ele) mistakenly deletes the expired element. To solve this problem, it is necessary to traverse the linked list once in 'clear' to clear all tags, but this will damage efficiency. However, this bug is not common and the caller can be avoided, so I'm not going to fix it.
     * 
     * You can also avoid this bug by passing in an empty implementation of the callback function, because calling the callback for all elements also requires traversing the list once, so in this case the code also empties the token before the callback.
     * 
     * ```
     * const l = new List<number>()
     * const ele = l.pushBack(1)
     * l.cear(()=>{})
     * console.log((l.remove(ele)) // output false
     * console.log(l.length) // output 0
     * ```
     * 
     * @param callback call the callback on the removed element
     */
    clear(callback?: DeleteCallback<T>): void {
        const front = this.front()
        if (front) {
            const root = this.root_
            root.prev_ = root
            root.next_ = root
            this.length_ = 0

            let ele: ListElement<T> | undefined = front
            // fix bug,rest list tag
            // while (ele) {
            //     ele._remove()
            //     ele = ele.next_
            // }
            callback = callback ?? this.opts_?.remove
            if (callback) {
                ele = front
                while (ele != root) {
                    ele._remove() //  rest list tag
                    callback(ele.data!)
                    ele = ele.next_!
                }
            }
        }
    }
    /**
     * remove e from list if e is an element of list.
     * @param e element to remove
     * @param callback call the callback on the removed element
     */
    remove(e: ListElement<T>, callback?: DeleteCallback<T>): boolean {
        if (e._list() != this) {
            return false
        }
        this._remove(e)
        callback = callback ?? this.opts_?.remove
        if (callback) {
            callback(e.data!)
        }
        return true
    }
    /**
     * If the list is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popBack(callback?: DeleteCallback<T>): ReturnValue<T> {
        const e = this.back()
        if (e) {
            this._remove(e)
            callback = callback ?? this.opts_?.remove
            if (callback) {
                callback(e.data!)
            }
            return e.data
        }
    }
    /**
 * If the list is not empty delete the element at the back
 * @param callback call the callback on the removed element
 * @returns deleted data
 */
    popBackRaw(callback?: DeleteCallback<T>): ReturnValueRaw<T> {
        const e = this.back()
        if (e) {
            this._remove(e)
            callback = callback ?? this.opts_?.remove
            if (callback) {
                callback(e.data!)
            }
            return [e.data!, true]
        }
        return [undefined, false]
    }
    /**
     * If the list is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popFront(callback?: DeleteCallback<T>): ReturnValue<T> {
        const e = this.front()
        if (e) {
            this._remove(e)
            callback = callback ?? this.opts_?.remove
            if (callback) {
                callback(e.data!)
            }
            return e.data!
        }
    }
    /**
     * If the list is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popFrontRaw(callback?: DeleteCallback<T>): ReturnValueRaw<T> {
        const e = this.front()
        if (e) {
            this._remove(e)
            callback = callback ?? this.opts_?.remove
            if (callback) {
                callback(e.data!)
            }
            return [e.data!, true]
        }
        return [undefined, false]
    }
    /**
     * inserts a new element e with value v at the back of list and returns e.
     */
    pushBack(v: T): ListElement<T> {
        return this._insertValue(v, this.root_.prev_!)
    }
    /**
     * inserts a new element e with value v at the front of list and returns e.
     */
    pushFront(v: T): ListElement<T> {
        return this._insertValue(v, this.root_)
    }
    /**
     * inserts a new element e with value v immediately before mark and returns e.
     */
    insertBefore(v: T, mark: ListElement<T>): ListElement<T> | undefined {
        if (mark._list() != this) {
            return
        }
        return this._insertValue(v, mark.prev_!)
    }
    /**
     * inserts a new element e with value v immediately after mark and returns e.
     */
    insertAfter(v: T, mark: ListElement<T>): ListElement<T> | undefined {
        if (mark._list() != this) {
            return
        }
        return this._insertValue(v, mark)
    }
    /**
     * moves element e to the front of list.
     */
    moveToFront(e: ListElement<T>): boolean {
        if (e._list() != this) {
            return false
        }
        const root = this.root_
        if (root.next_ == e) {
            return false
        }
        return this._move(e, root)
    }
    /**
     * moves element e to the back of list.
     */
    moveToBack(e: ListElement<T>): boolean {
        if (e._list() != this) {
            return false
        }
        const root = this.root_
        if (root.prev_ == e) {
            return false
        }
        return this._move(e, root.prev_!)
    }

    /**
     * moves element e to its new position before mark.
     */
    moveBefore(e: ListElement<T>, mark: ListElement<T>): boolean {
        if (e._list() != this ||
            e == mark ||
            mark._list() != this) {
            return false
        }
        return this._move(e, mark.prev_!)
    }
    /**
     * moves element e to its new position after mark.
     */
    moveAfter(e: ListElement<T>, mark: ListElement<T>): boolean {
        if (e._list() != this ||
            e == mark ||
            mark._list() != this) {
            return false
        }
        return this._move(e, mark)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T> {
        if (reverse) {
            let current = this.back()
            const front = this.front()
            return {
                next() {
                    if (current) {
                        const data = current.data!
                        if (current == front) {
                            current = undefined // fix pushFrontList(this)
                        } else {
                            current = current.prev()
                        }
                        return {
                            value: data,
                        }
                    }
                    return noResult
                }
            }
        } else {
            let current = this.front()
            const back = this.back()
            return {
                next() {
                    if (current) {
                        const data = current.data!
                        if (current == back) {
                            current = undefined // fix pushBackList(this)
                        } else {
                            current = current.next()
                        }
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
     * inserts a copy of another container at the back of list.
     */
    pushBackList(vals: Iterable<T>, callback?: CloneCallback<T>) {
        callback = callback ?? this.opts_?.clone
        if (callback) {
            for (const v of vals) {
                this._insertValue(callback(v), this.root_.prev_!)
            }
        } else {
            for (const v of vals) {
                this._insertValue(v, this.root_.prev_!)
            }
        }
    }
    /**
     * inserts a copy of another container at the front of list l.
     */
    pushFrontList(vals: Iterable<T>, callback?: CloneCallback<T>) {
        let ele: ListElement<T> | undefined
        callback = callback ?? this.opts_?.clone
        if (callback) {
            for (const v of vals) {
                if (ele) {
                    ele = this._insertValue(callback(v), ele)
                } else {
                    ele = this._insertValue(callback(v), this.root_!)
                }
            }
        } else {
            for (const v of vals) {
                if (ele) {
                    ele = this._insertValue(v, ele)
                } else {
                    ele = this._insertValue(v, this.root_!)
                }
            }
        }
    }


    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element 
     */
    clone(callback?: CloneCallback<T>): List<T> {
        const l = new List<T>(this.opts_)
        l.pushBackList(this, callback)
        return l
    }
}
