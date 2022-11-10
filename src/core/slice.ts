import { errOutOfRange, Exception } from "./exception";
import { noResult } from "./values";

export const errLenOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: len out of range')
export const errCapOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: cap out of range')
function checkIndex(i: number, len?: number): number {
    if (i < 0 || i != Math.floor(i)) {
        throw Exception.wrap(errOutOfRange, `index out of range [${i}]`)
    }
    if (len !== undefined && i >= len) {
        throw Exception.wrap(errOutOfRange, `index out of range [${i}] with length ${len}`)
    }
    return i
}

function checkSlice(start: number, end: number, cap: number) {
    if (start < 0
        || start !== Math.floor(start)
        || start > cap) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [${start}:]`)
    }
    if (end < 0
        || end !== Math.floor(end)
        || start > cap) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [:${end}]`)
    } else if (end < start) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [${start}:${end}]`)
    }
}
export class Slice<T> {
    /**
     * 
     * @throws {@link core.errOutOfRange} 
     */
    static attach<T>(a: Array<T>, start?: number, end?: number): Slice<T> {
        if (start === undefined) {
            start = 0
        }
        if (end === undefined) {
            end = a.length
        }
        checkSlice(start, end, a.length)
        return new Slice(a, start, end)
    }
    /**
     * @throws {@link core.errOutOfRange}
     * @throws {@link core.errOutOfRange}
     */
    static make<T>(length: number, capacity: number): Slice<T> {
        if (length == undefined || !isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw errLenOutOfRange
        }
        if (capacity === undefined) {
            capacity = length
        } else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw errCapOutOfRange
        }
        const a = new Array<T>(capacity)
        return new Slice<T>(a, 0, a.length)
    }
    private constructor(public readonly array: Array<T>,
        public readonly start: number,
        public readonly end: number,
    ) { }
    get(i: number): T {
        checkIndex(i, this.length)
        return this.array[this.start + i]
    }
    set(i: number, val: T): void {
        checkIndex(i, this.length)
        this.array[this.start + i] = val
    }
    get length(): number {
        return this.end - this.start
    }
    get capacity(): number {
        return this.array.length - (this.end - this.start)
    }
    slice(start?: number, end?: number): Slice<T> {
        if (start === undefined) {
            start = 0
        }
        if (end === undefined) {
            end = this.end
        }
        checkSlice(start, end, this.capacity)
        const o = this.start
        return new Slice(this.array, o + this.start, o + end)
    }
    append(...vals: Array<T>): Slice<T> {
        const add = vals.length
        if (add == 0) {
            return new Slice(this.array, this.start, this.end)
        }
        const cap = this.capacity
        const grow = this.length + add
        if (grow < cap) {
            const a = this.array
            let i = this.end
            const end = i + add
            for (const v of vals) {
                a[i++] = v
            }
            return new Slice(a, this.start, end)
        }
        const a = Array.from(this)
        a.push(...vals)

        return new Slice<T>(a, 0, a.length)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<T> {
        const a = this.array
        let start = this.start
        let end = this.end
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
        return {
            [Symbol.iterator]() {
                return i
            }
        }
    }
}

export class StringSlice {
    /**
     * 
     * @throws {@link core.errOutOfRange} 
     */
    static attach(a: string, start?: number, end?: number): StringSlice {
        if (start === undefined) {
            start = 0
        }
        if (end === undefined) {
            end = a.length
        }
        checkSlice(start, end, a.length)
        return new StringSlice(a, start, end)
    }
    private constructor(public readonly array: string,
        public readonly start: number,
        public readonly end: number,
    ) { }
    get(i: number): string {
        checkIndex(i, this.length)
        return this.array[this.start + i]
    }
    get length(): number {
        return this.end - this.start
    }
    get capacity(): number {
        return this.array.length - (this.end - this.start)
    }
    slice(start?: number, end?: number): StringSlice {
        if (start === undefined) {
            start = 0
        }
        if (end === undefined) {
            end = this.end
        }
        checkSlice(start, end, this.capacity)
        const o = this.start
        return new StringSlice(this.array, o + this.start, o + end)
    }
    append(str: string): StringSlice {
        const add = str.length
        if (add == 0) {
            return new StringSlice(this.array, this.start, this.end)
        }
        str = this.array + str
        return new StringSlice(str, 0, str.length)
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse?: boolean): Iterator<string> {
        const a = this.array
        let start = this.start
        let end = this.end
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
    [Symbol.iterator](): Iterator<string> {
        return this.iterator()
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse(): Iterable<string> {
        const i = this.iterator(true)
        return {
            [Symbol.iterator]() {
                return i
            }
        }
    }
}