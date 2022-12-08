import { noResult } from "./values";
import { defaultAssert } from './assert';
import { classForEach, ClassForEach } from './internal/decorator';
export class Slice extends ClassForEach {
    constructor(array, start, end) {
        super();
        this.array = array;
        this.start = start;
        this.end = end;
        classForEach(Slice);
    }
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static attach(a, start, end) {
        const len = a.length;
        start = start ?? 0;
        end = end ?? len;
        defaultAssert.isUInt({
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
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static make(length, capacity) {
        capacity = capacity ?? length;
        defaultAssert.isUInt({
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
    /**
     * Returns the element at index i in the slice
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    get(i) {
        defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        return this.array[this.start + i];
    }
    /**
     * Sets the element at index i in the slice to val
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    set(i, val) {
        defaultAssert.isUInt({
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
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    slice(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        defaultAssert.isUInt({
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
        const grow = this.length + add;
        if (grow < cap) {
            const a = this.array;
            let i = this.end;
            for (const v of vals) {
                a[i++] = v;
            }
            return new Slice(a, this.start, i);
        }
        const a = Array.from(this);
        a.push(...vals);
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
                    return noResult;
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
                    return noResult;
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
/**
 * Combined into a construct cache
 */
export class StringBuilder {
    constructor() {
        this.a = new Array();
    }
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
export class Bytes extends ClassForEach {
    constructor(buffer, start, end) {
        super();
        this.buffer = buffer;
        this.start = start;
        this.end = end;
        classForEach(Bytes);
    }
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static attach(b, start, end) {
        const len = b.byteLength;
        start = start ?? 0;
        end = end ?? len;
        defaultAssert.isUInt({
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
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    static make(length, capacity) {
        capacity = capacity ?? length;
        defaultAssert.isUInt({
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
     */
    dateView() {
        return new DataView(this.buffer, this.start, this.length);
    }
    /**
     * take sub-slices
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    slice(start, end) {
        const max = this.capacity;
        start = start ?? 0;
        end = end ?? this.length;
        defaultAssert.isUInt({
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
            const d = this.dateView();
            const s = src.dateView();
            for (let i = 0; i < n; i++) {
                d.setUint8(i, s.getUint8(i));
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
        const a = this.dateView();
        let start = 0;
        let end = a.byteLength;
        if (reverse) {
            let i = end - 1;
            return {
                next() {
                    if (i >= start) {
                        return {
                            value: a.getUint8(i--),
                        };
                    }
                    return noResult;
                }
            };
        }
        else {
            let i = start;
            return {
                next() {
                    if (i < end) {
                        return {
                            value: a.getUint8(i++),
                        };
                    }
                    return noResult;
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
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    append(...vals) {
        const add = vals.length;
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        return this._append(new bytesNumber(vals));
    }
    appendBytes(...vals) {
        let dst = new Bytes(this.buffer, this.start, this.end);
        for (const v of vals) {
            dst = dst._append(new bytesView(v.dateView(), v.length));
        }
        return dst;
    }
    appendArrayBuffer(...vals) {
        let dst = new Bytes(this.buffer, this.start, this.end);
        for (const v of vals) {
            dst = dst._append(new bytesView(new DataView(v), v.byteLength));
        }
        return dst;
    }
    appendString(str) {
        if (str.length == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        return this.appendArrayBuffer(new TextEncoder().encode(str).buffer);
    }
    _append(b) {
        const add = b.length();
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        let cap = this.capacity;
        const length = this.length;
        const grow = length + add;
        if (grow < cap) {
            const start = this.end;
            const dst = new Bytes(this.buffer, this.start, start + add);
            const view = dst.dateView();
            for (let i = 0; i < add; i++) {
                view.setUint8(start + i, b.get(i));
            }
            return dst;
        }
        cap = length * 2;
        if (cap < grow) {
            cap += grow;
        }
        const src = this.dateView();
        const buffer = new ArrayBuffer(cap);
        const view = new DataView(buffer);
        const dst = new Bytes(buffer, 0, grow);
        for (let i = 0; i < length; i++) {
            view.setUint8(i, src.getUint8(i));
        }
        const start = this.end;
        for (let i = 0; i < add; i++) {
            view.setUint8(start + i, b.get(i));
        }
        return dst;
    }
    toString() {
        return new TextDecoder().decode(this.dateView());
    }
}
class bytesView {
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