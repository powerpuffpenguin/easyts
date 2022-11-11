"use strict";
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
exports.Bytes = exports.Slice = exports.errCapOutOfRange = exports.errLenOutOfRange = void 0;
var exception_1 = require("./exception");
var types_1 = require("./types");
var values_1 = require("./values");
exports.errLenOutOfRange = exception_1.Exception.wrap(exception_1.errOutOfRange, 'makeslice: len out of range');
exports.errCapOutOfRange = exception_1.Exception.wrap(exception_1.errOutOfRange, 'makeslice: cap out of range');
function checkIndex(i, len) {
    if (i < 0 || i != Math.floor(i)) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, "index out of range [".concat(i, "]"));
    }
    if (len !== undefined && i >= len) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, "index out of range [".concat(i, "] with length ").concat(len));
    }
    return i;
}
function checkSlice(start, end, cap) {
    if (start < 0
        || start !== Math.floor(start)
        || start > cap) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, "slice bounds out of range [".concat(start, ":]"));
    }
    if (end < 0
        || end !== Math.floor(end)
        || start > cap) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, "slice bounds out of range [:".concat(end, "]"));
    }
    else if (end < start) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, "slice bounds out of range [".concat(start, ":").concat(end, "]"));
    }
}
var Slice = /** @class */ (function () {
    function Slice(array, start, end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    /**
     * Creates a slice attached to the incoming array
     * @throws {@link core.errOutOfRange}
     */
    Slice.attach = function (a, start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = a.length;
        }
        checkSlice(start, end, a.length);
        return new Slice(a, start, end);
    };
    /**
     * Create a slice
     * @throws {@link core.errOutOfRange}
     * @throws {@link core.errOutOfRange}
     */
    Slice.make = function (length, capacity) {
        if (!isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw exports.errLenOutOfRange;
        }
        if (capacity === undefined) {
            capacity = length;
        }
        else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw exports.errCapOutOfRange;
        }
        var a = new Array(capacity);
        return new Slice(a, 0, length);
    };
    /**
     * Returns the element at index i in the slice
     */
    Slice.prototype.get = function (i) {
        checkIndex(i, this.length);
        return this.array[this.start + i];
    };
    /**
     * Sets the element at index i in the slice to val
     */
    Slice.prototype.set = function (i, val) {
        checkIndex(i, this.length);
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
     */
    Slice.prototype.slice = function (start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = this.end;
        }
        checkSlice(start, end, this.capacity);
        var o = this.start;
        return new Slice(this.array, o + start, o + end);
    };
    /**
     * Add a new element at the end of the slice and return the new slice
     */
    Slice.prototype.append = function () {
        var e_1, _a;
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
            var end = i + add;
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var v = vals_1_1.value;
                    a_1[i++] = v;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return new Slice(a_1, this.start, end);
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
    Slice.prototype.forEach = function (callback, reverse) {
        var e_2, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_1 = __values(it), it_1_1 = it_1.next(); !it_1_1.done; it_1_1 = it_1.next()) {
                var v = it_1_1.value;
                callback(v);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (it_1_1 && !it_1_1.done && (_a = it_1.return)) _a.call(it_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     *
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     *
     * @virtual
     */
    Slice.prototype.find = function (callback, reverse) {
        var e_3, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_2 = __values(it), it_2_1 = it_2.next(); !it_2_1.done; it_2_1 = it_2.next()) {
                var v = it_2_1.value;
                if (callback(v)) {
                    return true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (it_2_1 && !it_2_1.done && (_a = it_2.return)) _a.call(it_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return false;
    };
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    Slice.prototype.map = function (callback, reverse) {
        var e_4, _a;
        var length = this.length;
        if (length == 0) {
            return new Array();
        }
        var it = reverse ? this.reverse : this;
        var result = new Array(length);
        var i = 0;
        try {
            for (var it_3 = __values(it), it_3_1 = it_3.next(); !it_3_1.done; it_3_1 = it_3.next()) {
                var v = it_3_1.value;
                result[i++] = callback(v);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (it_3_1 && !it_3_1.done && (_a = it_3.return)) _a.call(it_3);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return result;
    };
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    Slice.prototype.has = function (data, reverse, callback) {
        var e_5, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_4 = __values(it), it_4_1 = it_4.next(); !it_4_1.done; it_4_1 = it_4.next()) {
                var v = it_4_1.value;
                if ((0, types_1.compare)(data, v, callback) == 0) {
                    return true;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (it_4_1 && !it_4_1.done && (_a = it_4.return)) _a.call(it_4);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return false;
    };
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    Slice.prototype.join = function (separator) {
        return this.map(function (v) { return "".concat(v); }).join(separator);
    };
    return Slice;
}());
exports.Slice = Slice;
var Bytes = /** @class */ (function () {
    function Bytes(buffer, start, end) {
        this.buffer = buffer;
        this.start = start;
        this.end = end;
    }
    Bytes.fromString = function (str) {
        var buffer = new TextEncoder().encode(str);
        return new Bytes(buffer, 0, buffer.length);
    };
    /**
     * Create a slice
     * @throws {@link core.errOutOfRange}
     * @throws {@link core.errOutOfRange}
     */
    Bytes.make = function (length, capacity) {
        if (!isFinite(length) || length < 0 || length != Math.floor(length)) {
            throw exports.errLenOutOfRange;
        }
        if (capacity === undefined) {
            capacity = length;
        }
        else if (!isFinite(capacity) || capacity < length || capacity != Math.floor(capacity)) {
            throw exports.errCapOutOfRange;
        }
        var buffer = new Uint8Array(capacity);
        return new Bytes(buffer, 0, length);
    };
    Bytes.prototype.toString = function () {
        return new TextDecoder().decode(this.buffer.subarray(this.start, this.end));
    };
    return Bytes;
}());
exports.Bytes = Bytes;
//# sourceMappingURL=slice.js.map