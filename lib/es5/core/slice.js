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
exports.Bytes = exports.StringBuilder = exports.Slice = exports.errCapOutOfRange = exports.errLenOutOfRange = void 0;
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
    Slice.prototype.copy = function (src) {
        var e_1, _a;
        var n = this.length < src.length ? this.length : src.length;
        if (n != 0) {
            var i = 0;
            var start = this.start;
            var arr = this.array;
            try {
                for (var src_1 = __values(src), src_1_1 = src_1.next(); !src_1_1.done; src_1_1 = src_1.next()) {
                    var v = src_1_1.value;
                    arr[start + i++] = v;
                    if (i == n) {
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
            var end = i + add;
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
        var e_3, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_1 = __values(it), it_1_1 = it_1.next(); !it_1_1.done; it_1_1 = it_1.next()) {
                var v = it_1_1.value;
                callback(v);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (it_1_1 && !it_1_1.done && (_a = it_1.return)) _a.call(it_1);
            }
            finally { if (e_3) throw e_3.error; }
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
        var e_4, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_2 = __values(it), it_2_1 = it_2.next(); !it_2_1.done; it_2_1 = it_2.next()) {
                var v = it_2_1.value;
                if (callback(v)) {
                    return true;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (it_2_1 && !it_2_1.done && (_a = it_2.return)) _a.call(it_2);
            }
            finally { if (e_4) throw e_4.error; }
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
        var e_5, _a;
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
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (it_3_1 && !it_3_1.done && (_a = it_3.return)) _a.call(it_3);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    };
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    Slice.prototype.has = function (data, reverse, callback) {
        var e_6, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_4 = __values(it), it_4_1 = it_4.next(); !it_4_1.done; it_4_1 = it_4.next()) {
                var v = it_4_1.value;
                if ((0, types_1.compare)(data, v, callback) == 0) {
                    return true;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (it_4_1 && !it_4_1.done && (_a = it_4.return)) _a.call(it_4);
            }
            finally { if (e_6) throw e_6.error; }
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
/**
 * Combined into a construct cache
 */
var StringBuilder = /** @class */ (function () {
    function StringBuilder() {
        this.a = new Array();
    }
    StringBuilder.prototype.write = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        (_a = this.a).push.apply(_a, __spreadArray([], __read(vals), false));
    };
    StringBuilder.prototype.undo = function () {
        return this.a.pop();
    };
    StringBuilder.prototype.toString = function () {
        return this.a.join('');
    };
    return StringBuilder;
}());
exports.StringBuilder = StringBuilder;
var Bytes = /** @class */ (function () {
    function Bytes(buffer, start, end) {
        this.buffer = buffer;
        this.start = start;
        this.end = end;
    }
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws {@link core.errOutOfRange}
     */
    Bytes.attach = function (b, start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = b.byteLength;
        }
        checkSlice(start, end, b.byteLength);
        return new Bytes(b, start, end);
    };
    /**
     * Create a Bytes
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
        var b = new ArrayBuffer(capacity);
        return new Bytes(b, 0, length);
    };
    /**
     * Create a Bytes from string
     */
    Bytes.fromString = function (str) {
        var buffer = new TextEncoder().encode(str);
        return new Bytes(buffer.buffer, 0, buffer.byteLength);
    };
    Object.defineProperty(Bytes.prototype, "length", {
        /**
         * return bytes length
         */
        get: function () {
            return this.end - this.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bytes.prototype, "capacity", {
        /**
         * return bytes capacity
         */
        get: function () {
            return this.buffer.byteLength - this.start;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * return DataView of Bytes
     */
    Bytes.prototype.dateView = function () {
        return new DataView(this.buffer, this.start, this.length);
    };
    /**
     * take sub-slices
     */
    Bytes.prototype.slice = function (start, end) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = this.end;
        }
        checkSlice(start, end, this.capacity);
        var o = this.start;
        return new Bytes(this.buffer, o + start, o + end);
    };
    Bytes.prototype.copy = function (src) {
        var n = this.length < src.length ? this.length : src.length;
        if (n != 0) {
            var d = this.dateView();
            var s = src.dateView();
            for (var i = 0; i < n; i++) {
                d.setUint8(i, s.getUint8(i));
            }
        }
        return n;
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    Bytes.prototype.iterator = function (reverse) {
        var a = this.dateView();
        var start = 0;
        var end = a.byteLength;
        if (reverse) {
            var i_3 = end - 1;
            return {
                next: function () {
                    if (i_3 >= start) {
                        return {
                            value: a.getUint8(i_3--),
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            var i_4 = start;
            return {
                next: function () {
                    if (i_4 < end) {
                        return {
                            value: a.getUint8(i_4++),
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
    Bytes.prototype[Symbol.iterator] = function () {
        return this.iterator();
    };
    Object.defineProperty(Bytes.prototype, "reverse", {
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
     * Add a new element at the end of the slice and return the new slice
     */
    Bytes.prototype.append = function () {
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var add = vals.length;
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        return this._append(new bytesNumber(vals));
    };
    Bytes.prototype.appendBytes = function () {
        var e_7, _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var dst = new Bytes(this.buffer, this.start, this.end);
        try {
            for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                var v = vals_2_1.value;
                dst = dst._append(new bytesView(v.dateView(), v.length));
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (vals_2_1 && !vals_2_1.done && (_a = vals_2.return)) _a.call(vals_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return dst;
    };
    Bytes.prototype.appendArrayBuffer = function () {
        var e_8, _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var dst = new Bytes(this.buffer, this.start, this.end);
        try {
            for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
                var v = vals_3_1.value;
                dst = dst._append(new bytesView(new DataView(v), v.byteLength));
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (vals_3_1 && !vals_3_1.done && (_a = vals_3.return)) _a.call(vals_3);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return dst;
    };
    Bytes.prototype.appendString = function (str) {
        if (str.length == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        return this.appendArrayBuffer(new TextEncoder().encode(str).buffer);
    };
    Bytes.prototype._append = function (b) {
        var add = b.length();
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        var cap = this.capacity;
        var length = this.length;
        var grow = length + add;
        if (grow < cap) {
            var start_1 = this.end;
            var dst_1 = new Bytes(this.buffer, this.start, start_1 + add);
            var view_1 = dst_1.dateView();
            for (var i = 0; i < add; i++) {
                view_1.setUint8(start_1 + i, b.get(i));
            }
            return dst_1;
        }
        cap = length * 2;
        if (cap < grow) {
            cap += grow;
        }
        var src = this.dateView();
        var buffer = new ArrayBuffer(cap);
        var view = new DataView(buffer);
        var dst = new Bytes(buffer, 0, grow);
        for (var i = 0; i < length; i++) {
            view.setUint8(i, src.getUint8(i));
        }
        var start = this.end;
        for (var i = 0; i < add; i++) {
            view.setUint8(start + i, b.get(i));
        }
        return dst;
    };
    Bytes.prototype.toString = function () {
        return new TextDecoder().decode(this.dateView());
    };
    return Bytes;
}());
exports.Bytes = Bytes;
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