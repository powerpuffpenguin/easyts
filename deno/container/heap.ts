import { noResult } from '../values.ts';
import { CompareCallback, DeleteCallback, compare, CloneCallback, ReturnValue, ReturnValueRaw } from '../types.ts';
import { Basic, Options, Container } from './types.ts';
import { defaultAssert } from '../assert.ts';

function getIndex(i: number): number {
    if (i < 1) {
        return 0
    }
    return Math.floor(i)
}
/**
 * Initialize array to heap
 */
export function heapify<T>(h: Array<T>, cf?: CompareCallback<T>): Array<T> {
    // heapify
    const n = h.length
    for (let i = getIndex(n / 2) - 1; i >= 0; i--) {
        down(h, i, n, cf)
    }
    return h
}
function up<T>(h: Array<T>, j: number, cf?: CompareCallback<T>) {
    while (true) {
        const i = getIndex((j - 1) / 2) // parent
        if (i == j
            || compare(h[j], h[i], cf) >= 0
        ) {
            break
        }

        [h[i], h[j]] = [h[j], h[i]]
        j = i
    }
}
function down<T>(h: Array<T>, i0: number, n: number, cf?: CompareCallback<T>): boolean {
    let i = i0
    while (true) {
        let j1 = 2 * i + 1
        if (j1 >= n || j1 < 0) { // j1 < 0 after int overflow
            break
        }
        let j = j1 // left child
        let j2 = j1 + 1
        if (j2 < n && compare(h[j2], h[j1], cf) < 0) {
            j = j2 // = 2*i + 2  // right child
        }
        if (compare(h[j], h[i], cf) >= 0) {
            break
        }
        [h[i], h[j]] = [h[j], h[i]]
        i = j
    }
    return i > i0
}
/**
 * Fix re-establishes the heap ordering after the element at index i has changed its value.
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export function fix<T>(h: Array<T>, i: number, cf?: CompareCallback<T>) {
    defaultAssert.isUInt({
        name: "i",
        val: i,
        max: h.length,
        notMax: true,
    })
    if (!down(h, i, h.length, cf)) {
        up(h, i, cf)
    }
}
/**
 * Pop removes and returns the minimum element (according to cf or <) from the heap.
 * 
 * @throws {@link core.errOutOfRange}
 */
export function pop<T>(h: Array<T>, cf?: CompareCallback<T>, rf?: DeleteCallback<T>): ReturnValue<T> {
    const n = h.length - 1;
    if (n < 0) {
        return
    } else if (n != 0) {
        [h[0], h[n]] = [h[n], h[0]]
    }
    down(h, 0, n, cf)
    const v = h[h.length - 1]
    h.pop()
    if (rf) {
        rf(v)
    }
    return v
}
export function popRaw<T>(h: Array<T>, cf?: CompareCallback<T>, rf?: DeleteCallback<T>): ReturnValueRaw<T> {
    const n = h.length - 1;
    if (n < 0) {
        return [undefined, false]
    } else if (n != 0) {
        [h[0], h[n]] = [h[n], h[0]]
    }
    down(h, 0, n, cf)
    const v = h[h.length - 1]
    h.pop()
    if (rf) {
        rf(v)
    }
    return [v, true]
}
/**
 * Push pushes the element x onto the heap.
 */
export function push<T>(h: Array<T>, val: T, cf?: CompareCallback<T>) {
    let j = h.length
    h.push(val)
    up(h, j, cf)
}
/**
 * Remove removes and returns the element at index i from the heap.
 * 
 * @throws {@link core.errOutOfRange}
 */
export function remove<T>(h: Array<T>, i: number, cf?: CompareCallback<T>, rf?: DeleteCallback<T>): T {
    defaultAssert.isUInt({
        name: 'i',
        val: i,
        max: h.length,
        notMax: true,
    })
    let n = h.length - 1
    if (n != i) {
        [h[i], h[n]] = [h[n], h[i]]
        if (!down(h, i, n, cf)) {
            up(h, i, cf)
        }
    }
    const v = h[h.length - 1]
    h.pop()
    if (rf) {
        rf(v)
    }
    return v
}
export class Heap<T> extends Basic<T> implements Container<T> {
    /**
     * Initialize array to heap
     */
    heapify() {
        heapify(this.h_, this.opts_?.compare)
    }
    /**
     * Fix re-establishes the heap ordering after the element at index i has changed its value.
     */
    fix(i: number) {
        fix(this.h_, i, this.opts_?.compare)
    }
    /**
     * array heap 
     */
    private readonly h_: Array<T>
    /**
     * Returns an array of underlying storage
     */
    get heap(): Array<T> {
        return this.h_
    }
    /**
     * returns the length of the heap
     * @override
     */
    get length(): number {
        return this.h_.length
    }
    /**
     * returns the capacity of the heap
     * @override
     */
    get capacity(): number {
        return Number.MAX_SAFE_INTEGER
    }
    /**
     * get heap array element
     * @throws {@link core.errOutOfRange}
     */
    get(i: number): T {
        const h = this.h_
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: h.length,
            notMax: true,
        })
        return h[i]
    }
    /**
     * set heap array element
     * @throws {@link core.errOutOfRange}
     */
    set(i: number, val: T): void {
        const h = this.h_
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: h.length,
            notMax: true,
        })
        const o = h[i]
        h[i] = val
        const cf = this.opts_?.compare
        if (compare(o, val, cf) == 0) {
            return
        }
        fix(h, i, cf)
    }
    constructor(opts?: Options<T>, heap?: Array<T>) {
        super(opts)
        if (heap) {
            this.h_ = heap
        } else {
            this.h_ = new Array<T>()
        }
    }
    /**
     * Push pushes the element vals onto the heap.
     */
    push(...vals: Array<T>) {
        if (vals.length == 0) {
            return
        }
        const h = this.h_
        const cf = this.opts_?.compare
        for (const v of vals) {
            push(h, v, cf)
        }
    }
    /**
     * Pop removes and returns the minimum element (according opts.compare cf or <) from the heap.
     */
    pop(): ReturnValue<T> {
        return pop(this.h_, this.opts_?.compare, this.opts_?.remove)
    }
    /**
     * Pop removes and returns the minimum element (according opts.compare cf or <) from the heap.
     */
    popRaw(): ReturnValueRaw<T> {
        return popRaw(this.h_, this.opts_?.compare, this.opts_?.remove)
    }
    /**
     * Remove removes and returns the element at index i from the heap.
     * 
     * @throws {@link core.errOutOfRange}
     */
    remove(i: number): T {
        return remove(this.h_, i, this.opts_?.compare, this.opts_?.remove)
    }
    /**
     * Empty the data in the container
     * 
     * @param callback Call callback on the removed element
     * @override
     */
    clear(callback?: DeleteCallback<T>): void {
        callback = callback ?? this.opts_?.remove
        if (callback) {
            for (const v of this.h_) {
                callback(v)
            }
        }
        this.h_.splice(0)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T> {
        const h = this.h_
        if (reverse) {
            let i = h.length - 1
            return {
                next() {
                    if (i >= 0) {
                        return {
                            value: h[i--],
                        }
                    }
                    return noResult
                }
            }
        } else {
            let i = 0
            return {
                next() {
                    if (i < h.length) {
                        return {
                            value: h[i++],
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
    clone(callback?: CloneCallback<T>): Heap<T> {
        const l = new Heap<T>(this.opts_)
        callback = callback ?? this.opts_?.clone
        if (callback) {
            l.pushList(this, callback)
        } else {
            l.h_.push(...this.h_)
        }
        return l
    }
    /**
     * inserts a copy of another container of heap.
     */
    pushList(vals: Iterable<T>, callback?: CloneCallback<T>) {
        callback = callback ?? this.opts_?.clone
        if (callback) {
            for (const v of vals) {
                this.push(callback(v))
            }
        } else {
            for (const v of vals) {
                this.push(v)
            }
        }
    }
}


