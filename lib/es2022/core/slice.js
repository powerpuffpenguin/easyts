"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slice = exports.errCapOutOfRange = exports.errLenOutOfRange = void 0;
const exception_1 = require("./exception");
const values_1 = require("./values");
exports.errLenOutOfRange = exception_1.Exception.wrap(exception_1.errOutOfRange, 'makeslice: len out of range');
exports.errCapOutOfRange = exception_1.Exception.wrap(exception_1.errOutOfRange, 'makeslice: cap out of range');
function checkIndex(i, len) {
    if (i < 0 || i != Math.floor(i)) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
    }
    if (len !== undefined && i >= len) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}] with length ${len}`);
    }
    return i;
}
function checkSlice(start, end, cap) {
    if (start < 0
        || start !== Math.floor(start)
        || start > cap) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `slice bounds out of range [${start}:]`);
    }
    if (end < 0
        || end !== Math.floor(end)
        || start > cap) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `slice bounds out of range [:${end}]`);
    }
    else if (end < start) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `slice bounds out of range [${start}:${end}]`);
    }
}
class Slice {
    array;
    start;
    end;
    /**
     *
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
     * @throws {@link core.errOutOfRange}
     * @throws {@link core.errOutOfRange}
     */
    static make(length, capacity) {
        if (length == undefined || !isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw exports.errLenOutOfRange;
        }
        if (capacity === undefined) {
            capacity = length;
        }
        else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw exports.errCapOutOfRange;
        }
        const a = new Array(capacity);
        return new Slice(a, 0, a.length);
    }
    constructor(array, start, end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    get(i) {
        checkIndex(i, this.length);
        return this.array[this.start + i];
    }
    set(i, val) {
        checkIndex(i, this.length);
        this.array[this.start + i] = val;
    }
    get length() {
        return this.end - this.start;
    }
    get capacity() {
        return this.array.length - (this.end - this.start);
    }
    slice(start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = this.end;
        }
        checkSlice(start, end, this.capacity);
        const o = this.start;
        return new Slice(this.array, o + this.start, o + end);
    }
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
        let length = this.length * 2;
        if (length < grow) {
            length = Math.floor((cap + add) * 4 / 3);
        }
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
        return {
            [Symbol.iterator]() {
                return i;
            }
        };
    }
}
exports.Slice = Slice;
const s = Slice.attach([1, 2, 3, 4, 5], 2);
for (const v of s.reverse) {
    console.log(v);
}
//# sourceMappingURL=slice.js.map