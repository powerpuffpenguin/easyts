"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slice = void 0;
var values_1 = require("./values");
var assert_1 = require("./assert");
var decorator_1 = require("./decorator");
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
var Slice = /** @class */ (function () {
    function Slice(array, start, end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    Slice.attach = function (a, start, end) {
        var len = a.length;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : len;
        (0, assert_1.assertUInt)({
            name: "start",
            val: start,
            max: len,
        }, {
            name: "end",
            val: end,
            max: len,
            min: start,
        });
        return new Slice(a, start, end);
    };
    /**
     * Create a slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    Slice.make = function (length, capacity) {
        capacity = capacity !== null && capacity !== void 0 ? capacity : length;
        (0, assert_1.assertUInt)({
            name: 'length',
            val: length,
        }, {
            name: 'capacity',
            val: capacity,
            min: length,
        });
        var a = new Array(capacity);
        return new Slice(a, 0, length);
    };
    /**
     * Returns the element at index i in the slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    Slice.prototype.get = function (i) {
        (0, assert_1.assertUInt)({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        return this.array[this.start + i];
    };
    /**
     * Sets the element at index i in the slice to val
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    Slice.prototype.set = function (i, val) {
        (0, assert_1.assertUInt)({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        this.array[this.start + i] = val;
    };
    Object.defineProperty(Slice.prototype, "length", {
        /**
         * return slice length
         */
        get: function () {
            return this.end - this.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Slice.prototype, "capacity", {
        /**
         * return slice capacity
         */
        get: function () {
            return this.array.length - this.start;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * take sub-slices
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    Slice.prototype.slice = function (start, end) {
        var len = this.length;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : len;
        (0, assert_1.assertUInt)({
            name: "start",
            val: start,
            max: len,
        }, {
            name: "end",
            val: end,
            max: len,
            min: start,
        });
        var o = this.start;
        return new Slice(this.array, o + start, o + end);
    };
    /**
     * Copy data from src to current slice
     * @returns How much data was copied
     */
    Slice.prototype.copy = function (src) {
        var e_1, _a;
        var n = 0;
        var end = this.end;
        var o = this.start;
        var a = this.array;
        if (end > o) {
            try {
                for (var src_1 = __values(src), src_1_1 = src_1.next(); !src_1_1.done; src_1_1 = src_1.next()) {
                    var v = src_1_1.value;
                    a[o++] = v;
                    if (o == end) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (src_1_1 && !src_1_1.done && (_a = src_1.return)) _a.call(src_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return n;
    };
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    Slice.prototype.append = function () {
        var e_2, _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var add = vals.length;
        if (add == 0) {
            return new Slice(this.array, this.start, this.end);
        }
        var cap = this.capacity;
        var grow = this.length + add;
        if (grow < cap) {
            var a_1 = this.array;
            var i = this.end;
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var v = vals_1_1.value;
                    a_1[i++] = v;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return new Slice(a_1, this.start, i);
        }
        var a = Array.from(this);
        a.push.apply(a, __spreadArray([], __read(vals), false));
        return new Slice(a, 0, a.length);
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    Slice.prototype.iterator = function (reverse) {
        var a = this.array;
        var start = this.start;
        var end = this.end;
        if (reverse) {
            var i_1 = end - 1;
            return {
                next: function () {
                    if (i_1 >= start) {
                        return {
                            value: a[i_1--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            var i_2 = start;
            return {
                next: function () {
                    if (i_2 < end) {
                        return {
                            value: a[i_2++],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    };
    /**
     * implements js Iterable
     * @sealedl
     */
    Slice.prototype[Symbol.iterator] = function () {
        return this.iterator();
    };
    Object.defineProperty(Slice.prototype, "reverse", {
        /**
         * Returns an object that implements a js Iterable, but it traverses the data in reverse
         * @sealed
         */
        get: function () {
            var _a;
            var i = this.iterator(true);
            return _a = {},
                _a[Symbol.iterator] = function () {
                    return i;
                },
                _a;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    Slice.prototype.forEach = function (callback, reverse) { };
    __decorate([
        decorator_1.methodForEach
    ], Slice.prototype, "forEach", null);
    return Slice;
}());
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
var bytesView = /** @class */ (function () {
    function bytesView(view, len) {
        this.view = view;
        this.len = len;
    }
    bytesView.prototype.length = function () {
        return this.len;
    };
    bytesView.prototype.get = function (i) {
        return this.view.getUint8(i);
    };
    return bytesView;
}());
var bytesNumber = /** @class */ (function () {
    function bytesNumber(buffer) {
        this.buffer = buffer;
    }
    bytesNumber.prototype.length = function () {
        return this.buffer.length;
    };
    bytesNumber.prototype.get = function (i) {
        return this.buffer[i];
    };
    return bytesNumber;
}());
//# sourceMappingURL=slice.js.map