import { noResult } from "./values";
import { defaultAssert } from './assert'
import { classForEach, ClassForEach } from './internal/decorator';
function growSlice(old: number, oldcap: number, cap: number): number {
    let newcap = oldcap
    const doublecap = newcap + newcap
    if (cap > doublecap) {
        newcap = cap
    } else {
        const threshold = 256
        if (oldcap < threshold) {
            newcap = doublecap
        } else {
            // Check 0 < newcap to detect overflow
            // and prevent an infinite loop.
            while (0 < newcap && newcap < cap) {
                // Transition from growing 2x for small slices
                // to growing 1.25x for large slices. This formula
                // gives a smooth-ish transition between the two.
                newcap += Math.floor((newcap + 3 * threshold) / 4)
            }
            // Set newcap to the requested cap when
            // the newcap calculation overflowed.
            if (newcap <= 0) {
                newcap = cap
            }
        }
    }

    return newcap
}
export class Slice<T> extends ClassForEach<T> implements Iterable<T> {
    /**
     * Creates a slice attached to the incoming array
     * @throws TypeError
     * @throws RangeError
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T> {
        const len = a.length
        start = start ?? 0
        end = end ?? len
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: len,
            },
            {
                name: "end",
                val: end,
                max: len,
                min: start,
            },
        )
        return new Slice(a, start, end)
    }
    /**
     * Create a slice
     * @throws TypeError
     * @throws RangeError
     */
    static make<T>(length: number, capacity?: number): Slice<T> {
        capacity = capacity ?? length
        defaultAssert.isUInt(
            {
                name: 'length',
                val: length,
            },
            {
                name: 'capacity',
                val: capacity,
                min: length,
            }
        )
        const a = new Array<T>(capacity)
        return new Slice<T>(a, 0, length)
    }
    private constructor(public readonly array: Array<T>,
        public readonly start: number,
        public readonly end: number,
    ) {
        super()
        classForEach((Slice as any))
    }
    /**
     * Returns the element at index i in the slice
     * @throws TypeError
     * @throws RangeError
     */
    get(i: number): T {
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        })
        return this.array[this.start + i]
    }
    /**
     * Sets the element at index i in the slice to val
     * @throws TypeError
     * @throws RangeError
     */
    set(i: number, val: T): void {
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        })
        this.array[this.start + i] = val
    }
    /**
     * return slice length
     */
    get length(): number {
        return this.end - this.start
    }
    /**
     * return slice capacity
     */
    get capacity(): number {
        return this.array.length - this.start
    }
    /**
     * take sub-slices
     * @throws TypeError
     * @throws RangeError
     */
    slice(start?: number, end?: number): Slice<T> {
        const max = this.capacity
        start = start ?? 0
        end = end ?? this.length
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: max,
            },
            {
                name: "end",
                val: end,
                max: max,
                min: start,
            },
        )
        const o = this.start
        return new Slice(this.array, o + start, o + end)
    }
    /**
     * Copy data from src to current slice
     * @returns How much data was copied
     */
    copy(src: Iterable<T>): number {
        let n = 0
        const end = this.end
        let o = this.start
        const a = this.array
        if (end > o) {
            for (const v of src) {
                a[o++] = v
                if (o == end) {
                    break
                }
            }
        }
        return n
    }
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals: Array<T>): Slice<T> {
        const add = vals.length
        if (add == 0) {
            return new Slice(this.array, this.start, this.end)
        }
        const cap = this.capacity
        const len = this.length
        const grow = len + add
        if (grow < cap) {
            const a = this.array
            let i = this.end
            for (const v of vals) {
                a[i++] = v
            }
            return new Slice(a, this.start, i)
        }
        const arr = this.array
        const a = new Array<T>(growSlice(len, cap, grow))
        let i = 0;
        for (; i < len; i++) {
            a[i] = arr[i]
        }
        for (const val of vals) {
            a[i++] = val
        }
        return new Slice<T>(a, 0, a.length)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T> {
        const a = this.array
        const start = this.start
        const end = this.end
        if (reverse) {
            let i = end - 1
            return {
                next() {
                    if (i >= start) {
                        return {
                            value: a[i--],
                        }
                    }
                    return noResult
                }
            }
        } else {
            let i = start
            return {
                next() {
                    if (i < end) {
                        return {
                            value: a[i++],
                        }
                    }
                    return noResult
                }
            }
        }
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
        return { [Symbol.iterator]() { return i } }
    }
}
/**
 * Combined into a construct cache
 */
export class StringBuilder {
    private a = new Array<string>()
    constructor() { }
    write(...vals: Array<any>) {
        this.a.push(...vals)
    }
    undo(): string | undefined {
        return this.a.pop()
    }
    toString(): string {
        return this.a.join('')
    }
}
export class Bytes extends ClassForEach<number> implements Iterable<number>{
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws TypeError
     * @throws RangeError
     */
    static attach(b: ArrayBuffer, start?: number, end?: number): Bytes {
        const len = b.byteLength
        start = start ?? 0
        end = end ?? len
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: len,
            },
            {
                name: "end",
                val: end,
                max: len,
                min: start,
            },
        )
        return new Bytes(b, start, end)
    }
    /**
     * Create a Bytes
     * @throws TypeError
     * @throws RangeError
     */
    static make(length: number, capacity?: number): Bytes {
        capacity = capacity ?? length
        defaultAssert.isUInt(
            {
                name: 'length',
                val: length,
            },
            {
                name: 'capacity',
                val: capacity,
                min: length,
            }
        )
        const b = new ArrayBuffer(capacity)
        return new Bytes(b, 0, length)
    }
    /**
     * Create a Bytes from string
     */
    static fromString(str: string): Bytes {
        const buffer = new TextEncoder().encode(str)
        return new Bytes(buffer.buffer, 0, buffer.byteLength)
    }
    private constructor(public readonly buffer: ArrayBuffer,
        public readonly start: number,
        public readonly end: number,
    ) {
        super()
        classForEach((Bytes as any))
    }
    /**
     * return bytes length
     */
    get length(): number {
        return this.end - this.start
    }
    /**
     * return bytes capacity
     */
    get capacity(): number {
        return this.buffer.byteLength - this.start
    }
    /**
     * 
     * return DataView of Bytes
     * @throws TypeError
     * @throws RangeError
     */
    dataView(start?: number, end?: number): DataView {
        const max = this.capacity
        start = start ?? 0
        end = end ?? this.length
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: max,
            },
            {
                name: "end",
                val: end,
                max: max,
                min: start,
            },
        )
        const o = this.start
        return new DataView(this.buffer, o + start, end - start)
    }
    /**
     * return Uint8Array of Bytes
     * @throws TypeError
     * @throws RangeError
     */
    data(start?: number, end?: number): Uint8Array {
        const max = this.capacity
        start = start ?? 0
        end = end ?? this.length
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: max,
            },
            {
                name: "end",
                val: end,
                max: max,
                min: start,
            },
        )
        const o = this.start
        return new Uint8Array(this.buffer, o + start, end - start)
    }
    /**
     * take sub-slices
     * @throws TypeError
     * @throws RangeError
     */
    slice(start?: number, end?: number): Bytes {
        const max = this.capacity
        start = start ?? 0
        end = end ?? this.length
        defaultAssert.isUInt(
            {
                name: "start",
                val: start,
                max: max,
            },
            {
                name: "end",
                val: end,
                max: max,
                min: start,
            },
        )
        const o = this.start
        return new Bytes(this.buffer, o + start, o + end)
    }
    copyBytes(src: Bytes): number {
        if (src.length == 0) {
            return 0
        }
        return this._copy(src.data())
    }
    copyArray(src: ArrayLike<number> | ArrayBuffer): number {
        return this._copy(new Uint8Array(src))
    }
    copyString(src: string): number {
        if (src.length == 0) {
            return 0
        }
        return this._copy(new TextEncoder().encode(src))
    }
    private _copy(s: Uint8Array): number {
        const n = this.length < s.length ? this.length : s.length
        if (n != 0) {
            const d = this.data()
            d.set(s)
        }
        return n
    }

    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<number> {
        const a = this.data()
        if (reverse) {
            const start = 0
            let i = a.byteLength - 1
            return {
                next() {
                    if (i >= start) {
                        return {
                            value: a[i--],
                        }
                    }
                    return noResult
                }
            }
        } else {
            return a[Symbol.iterator]()
        }
    }
    /**
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator](): Iterator<number> {
        return this.iterator()
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<number> {
        const i = this.iterator(true)
        return { [Symbol.iterator]() { return i } }
    }

    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals: Array<number>): Bytes {
        const add = vals.length
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end)
        }
        return this._append(new Uint8Array(vals))
    }
    appendBytes(...vals: Array<Bytes>): Bytes {
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end)
            case 1:
                return this._append(vals[0].data())
            default:
                return this._appends(vals.map((val) => val.data()))
        }
    }
    appendArray(...vals: Array<ArrayBuffer | ArrayLike<number>>): Bytes {
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end)
            case 1:
                return this._append(new Uint8Array(vals[0]))
            default:
                return this._appends(vals.map((val) => new Uint8Array(val)))
        }
    }
    appendString(...strs: Array<string>): Bytes {
        switch (strs.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end)
            case 1:
                return this._append(new TextEncoder().encode(strs[0]))
            default:
                return this._appends(strs.map((val) => new TextEncoder().encode(val)))
        }
    }
    private _appends(vals: Array<Uint8Array>): Bytes {
        const start = this.start
        let end = this.end
        if (vals.length == 0) {
            return new Bytes(this.buffer, start, end)
        }

        let add = 0
        for (const val of vals) {
            add += val.length
        }
        if (add == 0) {
            return new Bytes(this.buffer, start, end)
        }
        const dst = this._growSlice(add)
        const view = dst.data()
        for (const val of vals) {
            view.set(val, end)
            end += val.length
        }
        return dst
    }
    private _growSlice(add: number): Bytes {
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end)
        }
        let cap = this.capacity
        const len = this.length
        const grow = len + add
        if (grow < cap) {
            const start = this.end
            const dst = new Bytes(this.buffer, this.start, start + add)
            return dst
        }
        cap = growSlice(len, cap, grow)
        const buffer = new ArrayBuffer(cap)
        const view = new Uint8Array(buffer)
        const dst = new Bytes(buffer, 0, grow)
        view.set(this.data())
        return dst
    }
    private _append(val: Uint8Array): Bytes {
        const add = val.length
        const end = this.end
        if (add == 0) {
            return new Bytes(this.buffer, this.start, end)
        }
        const dst = this._growSlice(add)
        dst.data().set(val, end)
        return dst
    }
    toString(): string {
        return new TextDecoder().decode(this.data())
    }
}