"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bytes = exports.StringBuilder = exports.Slice = void 0;
const values_1 = require("./values");
const assert_1 = require("./assert");
const decorator_1 = require("./internal/decorator");
function growSlice(old, oldcap, cap) {
    let newcap = oldcap;
    const doublecap = newcap + newcap;
    if (cap > doublecap) {
        newcap = cap;
    }
    else {
        const threshold = 256;
        if (oldcap < threshold) {
            newcap = doublecap;
        }
        else {
            // Check 0 < newcap to detect overflow
            // and prevent an infinite loop.
            while (0 < newcap && newcap < cap) {
                // Transition from growing 2x for small slices
                // to growing 1.25x for large slices. This formula
                // gives a smooth-ish transition between the two.
                newcap += Math.floor((newcap + 3 * threshold) / 4);
            }
            // Set newcap to the requested cap when
            // the newcap calculation overflowed.
            if (newcap <= 0) {
                newcap = cap;
            }
        }
    }
    return newcap;
}
class Slice extends decorator_1.ClassForEach {
    array;
    start;
    end;
    /**
     * Creates a slice attached to the incoming array
     * @throws TypeError
     * @throws RangeError
     */
    static attach(a, start, end) {
        const len = a.length;
        start = start ?? 0;
        end = end ?? len;
        assert_1.defaultAssert.isUInt({
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
    }
    /**
     * Create a slice
     * @throws TypeError
     * @throws RangeError
     */
    static make(length, capacity) {
        capacity = capacity ?? length;
        assert_1.defaultAssert.isUInt({
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
        super();
        this.array = array;
        this.start = start;
        this.end = end;
        (0, decorator_1.classForEach)(Slice);
    }
    /**
     * Returns the element at index i in the slice
     * @throws TypeError
     * @throws RangeError
     */
    get(i) {
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        return this.array[this.start + i];
    }
    /**
     * Sets the element at index i in the slice to val
     * @throws TypeError
     * @throws RangeError
     */
    set(i, val) {
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        this.array[this.start + i] = val;
    }
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
    /**
     * take sub-slices
     * @throws TypeError
     * @throws RangeError
     */
    slice(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        assert_1.defaultAssert.isUInt({
            name: "start",
            val: start,
            max: max,
        }, {
            name: "end",
            val: end,
            max: max,
            min: start,
        });
        const o = this.start;
        return new Slice(this.array, o + start, o + end);
    }
    /**
     * Copy data from src to current slice
     * @returns How much data was copied
     */
    copy(src) {
        let n = 0;
        const end = this.end;
        let o = this.start;
        const a = this.array;
        if (end > o) {
            for (const v of src) {
                a[o++] = v;
                if (o == end) {
                    break;
                }
            }
        }
        return n;
    }
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals) {
        const add = vals.length;
        if (add == 0) {
            return new Slice(this.array, this.start, this.end);
        }
        const cap = this.capacity;
        const len = this.length;
        const grow = len + add;
        if (grow < cap) {
            const a = this.array;
            let i = this.end;
            for (const v of vals) {
                a[i++] = v;
            }
            return new Slice(a, this.start, i);
        }
        const arr = this.array;
        const a = new Array(growSlice(len, cap, grow));
        let i = 0;
        for (; i < len; i++) {
            a[i] = arr[i];
        }
        for (const val of vals) {
            a[i++] = val;
        }
        return new Slice(a, 0, a.length);
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse) {
        const a = this.array;
        const start = this.start;
        const end = this.end;
        if (reverse) {
            let i = end - 1;
            return {
                next() {
                    if (i >= start) {
                        return {
                            value: a[i--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            let i = start;
            return {
                next() {
                    if (i < end) {
                        return {
                            value: a[i++],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    }
    /**
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator]() {
        return this.iterator();
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse() {
        const i = this.iterator(true);
        return { [Symbol.iterator]() { return i; } };
    }
}
exports.Slice = Slice;
/**
 * Combined into a construct cache
 */
class StringBuilder {
    a = new Array();
    constructor() { }
    write(...vals) {
        this.a.push(...vals);
    }
    undo() {
        return this.a.pop();
    }
    toString() {
        return this.a.join('');
    }
}
exports.StringBuilder = StringBuilder;
class Bytes extends decorator_1.ClassForEach {
    buffer;
    start;
    end;
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws TypeError
     * @throws RangeError
     */
    static attach(b, start, end) {
        const len = b.byteLength;
        start = start ?? 0;
        end = end ?? len;
        assert_1.defaultAssert.isUInt({
            name: "start",
            val: start,
            max: len,
        }, {
            name: "end",
            val: end,
            max: len,
            min: start,
        });
        return new Bytes(b, start, end);
    }
    /**
     * Create a Bytes
     * @throws TypeError
     * @throws RangeError
     */
    static make(length, capacity) {
        capacity = capacity ?? length;
        assert_1.defaultAssert.isUInt({
            name: 'length',
            val: length,
        }, {
            name: 'capacity',
            val: capacity,
            min: length,
        });
        const b = new ArrayBuffer(capacity);
        return new Bytes(b, 0, length);
    }
    /**
     * Create a Bytes from string
     */
    static fromString(str) {
        const buffer = new TextEncoder().encode(str);
        return new Bytes(buffer.buffer, 0, buffer.byteLength);
    }
    constructor(buffer, start, end) {
        super();
        this.buffer = buffer;
        this.start = start;
        this.end = end;
        (0, decorator_1.classForEach)(Bytes);
    }
    /**
     * return bytes length
     */
    get length() {
        return this.end - this.start;
    }
    /**
     * return bytes capacity
     */
    get capacity() {
        return this.buffer.byteLength - this.start;
    }
    /**
     *
     * return DataView of Bytes
     * @throws TypeError
     * @throws RangeError
     */
    dataView(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        assert_1.defaultAssert.isUInt({
            name: "start",
            val: start,
            max: max,
        }, {
            name: "end",
            val: end,
            max: max,
            min: start,
        });
        const o = this.start;
        return new DataView(this.buffer, o + start, end - start);
    }
    /**
     * return Uint8Array of Bytes
     * @throws TypeError
     * @throws RangeError
     */
    data(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        assert_1.defaultAssert.isUInt({
            name: "start",
            val: start,
            max: max,
        }, {
            name: "end",
            val: end,
            max: max,
            min: start,
        });
        const o = this.start;
        return new Uint8Array(this.buffer, o + start, end - start);
    }
    /**
     * take sub-slices
     * @throws TypeError
     * @throws RangeError
     */
    slice(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        assert_1.defaultAssert.isUInt({
            name: "start",
            val: start,
            max: max,
        }, {
            name: "end",
            val: end,
            max: max,
            min: start,
        });
        const o = this.start;
        return new Bytes(this.buffer, o + start, o + end);
    }
    copy(src) {
        const n = this.length < src.length ? this.length : src.length;
        if (n != 0) {
            const d = this.data();
            const s = src.data(undefined, n);
            for (let i = 0; i < n; i++) {
                d.set(s);
            }
        }
        return n;
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse) {
        const a = this.data();
        if (reverse) {
            const start = 0;
            let i = a.byteLength - 1;
            return {
                next() {
                    if (i >= start) {
                        return {
                            value: a[i--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            return a[Symbol.iterator]();
        }
    }
    /**
     * implements js Iterable
     * @sealedl
     */
    [Symbol.iterator]() {
        return this.iterator();
    }
    /**
     * Returns an object that implements a js Iterable, but it traverses the data in reverse
     * @sealed
     */
    get reverse() {
        const i = this.iterator(true);
        return { [Symbol.iterator]() { return i; } };
    }
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals) {
        const add = vals.length;
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        return this._append(vals);
    }
    appendBytes(...vals) {
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(vals[0].data());
            default:
                return this._appends(vals.map((val) => val.data()));
        }
    }
    appendArrayBuffer(...vals) {
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(new Uint8Array(vals[0]));
            default:
                return this._appends(vals.map((val) => new Uint8Array(val)));
        }
    }
    appendString(...strs) {
        switch (strs.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(new TextEncoder().encode(strs[0]));
            default:
                return this._appends(strs.map((val) => new TextEncoder().encode(val)));
        }
    }
    _appends(vals) {
        const start = this.start;
        let end = this.end;
        if (vals.length == 0) {
            return new Bytes(this.buffer, start, end);
        }
        let add = 0;
        for (const val of vals) {
            add += val.length;
        }
        if (add == 0) {
            return new Bytes(this.buffer, start, end);
        }
        const dst = this._growSlice(add);
        const view = dst.data();
        for (const val of vals) {
            view.set(val, end);
            end += val.length;
        }
        return dst;
    }
    _growSlice(add) {
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        let cap = this.capacity;
        const len = this.length;
        const grow = len + add;
        if (grow < cap) {
            const start = this.end;
            const dst = new Bytes(this.buffer, this.start, start + add);
            return dst;
        }
        cap = growSlice(len, cap, grow);
        const buffer = new ArrayBuffer(cap);
        const view = new Uint8Array(buffer);
        const dst = new Bytes(buffer, 0, grow);
        view.set(this.data());
        return dst;
    }
    _append(val) {
        const add = val.length;
        const end = this.end;
        if (add == 0) {
            return new Bytes(this.buffer, this.start, end);
        }
        const dst = this._growSlice(add);
        dst.data().set(val, end);
        return dst;
    }
    toString() {
        return new TextDecoder().decode(this.data());
    }
}
exports.Bytes = Bytes;
//# sourceMappingURL=slice.js.map