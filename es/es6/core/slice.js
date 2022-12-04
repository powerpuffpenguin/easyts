import { errOutOfRange, Exception } from "./exception";
import { compare } from "./types";
import { noResult } from "./values";
export const errLenOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: len out of range');
export const errCapOutOfRange = Exception.wrap(errOutOfRange, 'makeslice: cap out of range');
function checkIndex(i, len) {
    if (i < 0 || i != Math.floor(i)) {
        throw Exception.wrap(errOutOfRange, `index out of range [${i}]`);
    }
    if (len !== undefined && i >= len) {
        throw Exception.wrap(errOutOfRange, `index out of range [${i}] with length ${len}`);
    }
    return i;
}
function checkSlice(start, end, cap) {
    if (start < 0
        || start !== Math.floor(start)
        || start > cap) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [${start}:]`);
    }
    if (end < 0
        || end !== Math.floor(end)
        || start > cap) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [:${end}]`);
    }
    else if (end < start) {
        throw Exception.wrap(errOutOfRange, `slice bounds out of range [${start}:${end}]`);
    }
}
export class Slice {
    constructor(array, start, end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link core.errOutOfRange}
     */
    static attach(a, start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = a.length;
        }
        checkSlice(start, end, a.length);
        return new Slice(a, start, end);
    }
    /**
     * Create a slice
     * @throws {@link core.errOutOfRange}
     */
    static make(length, capacity) {
        if (!isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw errLenOutOfRange;
        }
        if (capacity === undefined) {
            capacity = length;
        }
        else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw errCapOutOfRange;
        }
        const a = new Array(capacity);
        return new Slice(a, 0, length);
    }
    /**
     * Returns the element at index i in the slice
     */
    get(i) {
        checkIndex(i, this.length);
        return this.array[this.start + i];
    }
    /**
     * Sets the element at index i in the slice to val
     */
    set(i, val) {
        checkIndex(i, this.length);
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
     */
    slice(start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = this.end;
        }
        checkSlice(start, end, this.capacity);
        const o = this.start;
        return new Slice(this.array, o + start, o + end);
    }
    copy(src) {
        const n = this.length < src.length ? this.length : src.length;
        if (n != 0) {
            let i = 0;
            let start = this.start;
            const arr = this.array;
            for (const v of src) {
                arr[start + i++] = v;
                if (i == n) {
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
            const end = i + add;
            for (const v of vals) {
                a[i++] = v;
            }
            return new Slice(a, this.start, end);
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
        let start = this.start;
        let end = this.end;
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
        return {
            [Symbol.iterator]() {
                return i;
            }
        };
    }
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    forEach(callback, reverse) {
        const it = reverse ? this.reverse : this;
        for (const v of it) {
            callback(v);
        }
    }
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     *
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     *
     * @virtual
     */
    find(callback, reverse) {
        const it = reverse ? this.reverse : this;
        for (const v of it) {
            if (callback(v)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    map(callback, reverse) {
        const length = this.length;
        if (length == 0) {
            return new Array();
        }
        const it = reverse ? this.reverse : this;
        const result = new Array(length);
        let i = 0;
        for (const v of it) {
            result[i++] = callback(v);
        }
        return result;
    }
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    has(data, reverse, callback) {
        const it = reverse ? this.reverse : this;
        for (const v of it) {
            if (compare(data, v, callback) == 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    join(separator) {
        return this.map((v) => `${v}`).join(separator);
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
export class Bytes {
    constructor(buffer, start, end) {
        this.buffer = buffer;
        this.start = start;
        this.end = end;
    }
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws {@link core.errOutOfRange}
     */
    static attach(b, start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = b.byteLength;
        }
        checkSlice(start, end, b.byteLength);
        return new Bytes(b, start, end);
    }
    /**
     * Create a Bytes
     * @throws {@link core.errOutOfRange}
     */
    static make(length, capacity) {
        if (!isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw errLenOutOfRange;
        }
        if (capacity === undefined) {
            capacity = length;
        }
        else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw errCapOutOfRange;
        }
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
     */
    slice(start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = this.end;
        }
        checkSlice(start, end, this.capacity);
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
        return {
            [Symbol.iterator]() {
                return i;
            }
        };
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