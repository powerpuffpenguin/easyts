"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slice = void 0;
const assert_1 = require("./assert");
// export const errLenOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: len out of range')
// export const errCapOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: cap out of range')
// function checkIndex(i: number, len?: number): number {
//     if (i < 0 || i != Math.floor(i)) {
//         throw Exception.wrap(errOutOfRange, `index out of range [${i}]`)
//     }
//     if (len !== undefined && i >= len) {
//         throw Exception.wrap(errOutOfRange, `index out of range [${i}] with length ${len}`)
//     }
//     return i
// }
function checkSlice(start, end, cap) {
    (0, assert_1.assertUInt)({
        name: "end",
        val: end,
        max: cap,
    }, {
        name: "start",
        val: start,
        max: end,
    });
}
class Slice {
    array;
    start;
    end;
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static attach(a, start, end) {
        start = start ?? 0;
        end = end ?? a.length;
        (0, assert_1.assertUInt)({
            name: "start",
            val: start,
            max: a.length,
        }, {
            name: "end",
            val: end,
            max: a.length,
            min: start,
        });
        return new Slice(a, start, end);
    }
    /**
     * Create a slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static make(length, capacity) {
        capacity = capacity ?? length;
        (0, assert_1.assertUInt)({
            name: 'length',
            val: length,
        }, {
            name: 'capacity',
            val: capacity,
            min: length,
        });
        const a = new Array(capacity);
        return new Slice(a, 0, length);
    }
    constructor(array, start, end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    /**
     * Returns the element at index i in the slice
     */
    get(i) {
        (0, assert_1.assertUInt)({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        return this.array[this.start + i];
    }
    //     /**
    //      * Sets the element at index i in the slice to val
    //      */
    //     set(i: number, val: T): void {
    //         checkIndex(i, this.length)
    //         this.array[this.start + i] = val
    //     }
    /**
     * return slice length
     */
    get length() {
        return this.end - this.start;
    }
    /**
     * return slice capacity
     */
    get capacity() {
        return this.array.length - this.start;
    }
}
exports.Slice = Slice;
// export class Bytes {
//     /**
//      * Creates a Bytes attached to the incoming ArrayBuffer
//      * @throws {@link core.errOutOfRange} 
//      */
//     static attach(b: ArrayBuffer, start?: number, end?: number): Bytes {
//         if (start === undefined) {
//             start = 0
//         }
//         if (end === undefined) {
//             end = b.byteLength
//         }
//         checkSlice(start, end, b.byteLength)
//         return new Bytes(b, start, end)
//     }
//     /**
//      * Create a Bytes
//      * @throws {@link core.errOutOfRange}
//      */
//     static make(length: number, capacity?: number): Bytes {
//         if (!isFinite(length) || length < 0 || length != Math.floor(length)) {
//             throw errLenOutOfRange
//         }
//         if (capacity === undefined) {
//             capacity = length
//         } else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
//             throw errCapOutOfRange
//         }
//         const b = new ArrayBuffer(capacity)
//         return new Bytes(b, 0, length)
//     }
//     /**
//      * Create a Bytes from string
//      */
//     static fromString(str: string): Bytes {
//         const buffer = new TextEncoder().encode(str)
//         return new Bytes(buffer.buffer, 0, buffer.byteLength)
//     }
//     private constructor(public readonly buffer: ArrayBuffer,
//         public readonly start: number,
//         public readonly end: number,
//     ) {
//     }
//     /**
//      * return bytes length
//      */
//     get length(): number {
//         return this.end - this.start
//     }
//     /**
//      * return bytes capacity
//      */
//     get capacity(): number {
//         return this.buffer.byteLength - this.start
//     }
//     /**
//      * 
//      * return DataView of Bytes
//      */
//     dateView(): DataView {
//         return new DataView(this.buffer, this.start, this.length)
//     }
//     /**
//      * take sub-slices
//      */
//     slice(start?: number, end?: number): Bytes {
//         if (start === undefined) {
//             start = 0
//         }
//         if (end === undefined) {
//             end = this.end
//         }
//         checkSlice(start, end, this.capacity)
//         const o = this.start
//         return new Bytes(this.buffer, o + start, o + end)
//     }
//     copy(src: Bytes): number {
//         const n = this.length < src.length ? this.length : src.length
//         if (n != 0) {
//             const d = this.dateView()
//             const s = src.dateView()
//             for (let i = 0; i < n; i++) {
//                 d.setUint8(i, s.getUint8(i))
//             }
//         }
//         return n
//     }
//     /**
//      * return js iterator
//      * @param reverse If true, returns an iterator to traverse in reverse
//      * @override
//      */
//     iterator(reverse?: boolean): Iterator<number> {
//         const a = this.dateView()
//         let start = 0
//         let end = a.byteLength
//         if (reverse) {
//             let i = end - 1
//             return {
//                 next() {
//                     if (i >= start) {
//                         return {
//                             value: a.getUint8(i--),
//                         }
//                     }
//                     return noResult
//                 }
//             }
//         } else {
//             let i = start
//             return {
//                 next() {
//                     if (i < end) {
//                         return {
//                             value: a.getUint8(i++),
//                         }
//                     }
//                     return noResult
//                 }
//             }
//         }
//     }
//     /**
//      * implements js Iterable
//      * @sealedl
//      */
//     [Symbol.iterator](): Iterator<number> {
//         return this.iterator()
//     }
//     /**
//      * Returns an object that implements a js Iterable, but it traverses the data in reverse
//      * @sealed
//      */
//     get reverse(): Iterable<number> {
//         const i = this.iterator(true)
//         return {
//             [Symbol.iterator]() {
//                 return i
//             }
//         }
//     }
//     /**
//      * Add a new element at the end of the slice and return the new slice
//      */
//     append(...vals: Array<number>): Bytes {
//         const add = vals.length
//         if (add == 0) {
//             return new Bytes(this.buffer, this.start, this.end)
//         }
//         return this._append(new bytesNumber(vals))
//     }
//     appendBytes(...vals: Array<Bytes>): Bytes {
//         let dst = new Bytes(this.buffer, this.start, this.end)
//         for (const v of vals) {
//             dst = dst._append(new bytesView(v.dateView(), v.length))
//         }
//         return dst
//     }
//     appendArrayBuffer(...vals: Array<ArrayBuffer>): Bytes {
//         let dst = new Bytes(this.buffer, this.start, this.end)
//         for (const v of vals) {
//             dst = dst._append(new bytesView(new DataView(v), v.byteLength))
//         }
//         return dst
//     }
//     appendString(str: string): Bytes {
//         if (str.length == 0) {
//             return new Bytes(this.buffer, this.start, this.end)
//         }
//         return this.appendArrayBuffer(new TextEncoder().encode(str).buffer)
//     }
//     private _append(b: bytesLike): Bytes {
//         const add = b.length()
//         if (add == 0) {
//             return new Bytes(this.buffer, this.start, this.end)
//         }
//         let cap = this.capacity
//         const length = this.length
//         const grow = length + add
//         if (grow < cap) {
//             const start = this.end
//             const dst = new Bytes(this.buffer, this.start, start + add)
//             const view = dst.dateView()
//             for (let i = 0; i < add; i++) {
//                 view.setUint8(start + i, b.get(i))
//             }
//             return dst
//         }
//         cap = length * 2
//         if (cap < grow) {
//             cap += grow
//         }
//         const src = this.dateView()
//         const buffer = new ArrayBuffer(cap)
//         const view = new DataView(buffer)
//         const dst = new Bytes(buffer, 0, grow)
//         for (let i = 0; i < length; i++) {
//             view.setUint8(i, src.getUint8(i))
//         }
//         const start = this.end
//         for (let i = 0; i < add; i++) {
//             view.setUint8(start + i, b.get(i))
//         }
//         return dst
//     }
//     toString(): string {
//         return new TextDecoder().decode(this.dateView())
//     }
// }
class bytesView {
    view;
    len;
    constructor(view, len) {
        this.view = view;
        this.len = len;
    }
    length() {
        return this.len;
    }
    get(i) {
        return this.view.getUint8(i);
    }
}
class bytesNumber {
    buffer;
    constructor(buffer) {
        this.buffer = buffer;
    }
    length() {
        return this.buffer.length;
    }
    get(i) {
        return this.buffer[i];
    }
}
//# sourceMappingURL=slice.js.map