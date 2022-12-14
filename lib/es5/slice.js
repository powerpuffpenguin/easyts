"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Bytes = exports.StringBuilder = exports.Slice = void 0;
var values_1 = require("./values");
var assert_1 = require("./assert");
var decorator_1 = require("./internal/decorator");
function growSlice(old, oldcap, cap) {
    var newcap = oldcap;
    var doublecap = newcap + newcap;
    if (cap > doublecap) {
        newcap = cap;
    }
    else {
        var threshold = 256;
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
var Slice = /** @class */ (function (_super) {
    __extends(Slice, _super);
    function Slice(array, start, end) {
        var _this = _super.call(this) || this;
        _this.array = array;
        _this.start = start;
        _this.end = end;
        (0, decorator_1.classForEach)(Slice);
        return _this;
    }
    /**
     * Creates a slice attached to the incoming array
     * @throws TypeError
     * @throws RangeError
     */
    Slice.attach = function (a, start, end) {
        var len = a.length;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : len;
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
    };
    /**
     * Create a slice
     * @throws TypeError
     * @throws RangeError
     */
    Slice.make = function (length, capacity) {
        capacity = capacity !== null && capacity !== void 0 ? capacity : length;
        assert_1.defaultAssert.isUInt({
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
     * @throws TypeError
     * @throws RangeError
     */
    Slice.prototype.get = function (i) {
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.length,
            notMax: true,
        });
        return this.array[this.start + i];
    };
    /**
     * Sets the element at index i in the slice to val
     * @throws TypeError
     * @throws RangeError
     */
    Slice.prototype.set = function (i, val) {
        assert_1.defaultAssert.isUInt({
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
     * @throws TypeError
     * @throws RangeError
     */
    Slice.prototype.slice = function (start, end) {
        var max = this.capacity;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : this.length;
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
        var e_2, _a, e_3, _b;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var add = vals.length;
        if (add == 0) {
            return new Slice(this.array, this.start, this.end);
        }
        var cap = this.capacity;
        var len = this.length;
        var grow = len + add;
        if (grow < cap) {
            var a_1 = this.array;
            var i_1 = this.end;
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var v = vals_1_1.value;
                    a_1[i_1++] = v;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return new Slice(a_1, this.start, i_1);
        }
        var arr = this.array;
        var a = new Array(growSlice(len, cap, grow));
        var i = 0;
        for (; i < len; i++) {
            a[i] = arr[i];
        }
        try {
            for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                var val = vals_2_1.value;
                a[i++] = val;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (vals_2_1 && !vals_2_1.done && (_b = vals_2.return)) _b.call(vals_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
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
            var i_2 = end - 1;
            return {
                next: function () {
                    if (i_2 >= start) {
                        return {
                            value: a[i_2--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            var i_3 = start;
            return {
                next: function () {
                    if (i_3 < end) {
                        return {
                            value: a[i_3++],
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
            return _a = {}, _a[Symbol.iterator] = function () { return i; }, _a;
        },
        enumerable: false,
        configurable: true
    });
    return Slice;
}(decorator_1.ClassForEach));
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
var Bytes = /** @class */ (function (_super) {
    __extends(Bytes, _super);
    function Bytes(buffer, start, end) {
        var _this = _super.call(this) || this;
        _this.buffer = buffer;
        _this.start = start;
        _this.end = end;
        (0, decorator_1.classForEach)(Bytes);
        return _this;
    }
    /**
     * Creates a Bytes attached to the incoming ArrayBuffer
     * @throws TypeError
     * @throws RangeError
     */
    Bytes.attach = function (b, start, end) {
        var len = b.byteLength;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : len;
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
    };
    /**
     * Create a Bytes
     * @throws TypeError
     * @throws RangeError
     */
    Bytes.make = function (length, capacity) {
        capacity = capacity !== null && capacity !== void 0 ? capacity : length;
        assert_1.defaultAssert.isUInt({
            name: 'length',
            val: length,
        }, {
            name: 'capacity',
            val: capacity,
            min: length,
        });
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
     * @throws TypeError
     * @throws RangeError
     */
    Bytes.prototype.dataView = function (start, end) {
        var max = this.capacity;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : this.length;
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
        var o = this.start;
        return new DataView(this.buffer, o + start, end - start);
    };
    /**
     * return Uint8Array of Bytes
     * @throws TypeError
     * @throws RangeError
     */
    Bytes.prototype.data = function (start, end) {
        var max = this.capacity;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : this.length;
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
        var o = this.start;
        return new Uint8Array(this.buffer, o + start, end - start);
    };
    /**
     * take sub-slices
     * @throws TypeError
     * @throws RangeError
     */
    Bytes.prototype.slice = function (start, end) {
        var max = this.capacity;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : this.length;
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
        var o = this.start;
        return new Bytes(this.buffer, o + start, o + end);
    };
    Bytes.prototype.copyBytes = function (src) {
        if (src.length == 0) {
            return 0;
        }
        return this._copy(src.data());
    };
    Bytes.prototype.copyArray = function (src) {
        return this._copy(new Uint8Array(src));
    };
    Bytes.prototype.copyString = function (src) {
        if (src.length == 0) {
            return 0;
        }
        return this._copy(new TextEncoder().encode(src));
    };
    Bytes.prototype._copy = function (s) {
        var n = this.length < s.length ? this.length : s.length;
        if (n != 0) {
            var d = this.data();
            d.set(s);
        }
        return n;
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    Bytes.prototype.iterator = function (reverse) {
        var a = this.data();
        if (reverse) {
            var start_1 = 0;
            var i_4 = a.byteLength - 1;
            return {
                next: function () {
                    if (i_4 >= start_1) {
                        return {
                            value: a[i_4--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            return a[Symbol.iterator]();
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
            return _a = {}, _a[Symbol.iterator] = function () { return i; }, _a;
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
        return this._append(new Uint8Array(vals));
    };
    Bytes.prototype.appendBytes = function () {
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(vals[0].data());
            default:
                return this._appends(vals.map(function (val) { return val.data(); }));
        }
    };
    Bytes.prototype.appendArray = function () {
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        switch (vals.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(new Uint8Array(vals[0]));
            default:
                return this._appends(vals.map(function (val) { return new Uint8Array(val); }));
        }
    };
    Bytes.prototype.appendString = function () {
        var strs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            strs[_i] = arguments[_i];
        }
        switch (strs.length) {
            case 0:
                return new Bytes(this.buffer, this.start, this.end);
            case 1:
                return this._append(new TextEncoder().encode(strs[0]));
            default:
                return this._appends(strs.map(function (val) { return new TextEncoder().encode(val); }));
        }
    };
    Bytes.prototype._appends = function (vals) {
        var e_4, _a, e_5, _b;
        var start = this.start;
        var end = this.end;
        if (vals.length == 0) {
            return new Bytes(this.buffer, start, end);
        }
        var add = 0;
        try {
            for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
                var val = vals_3_1.value;
                add += val.length;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (vals_3_1 && !vals_3_1.done && (_a = vals_3.return)) _a.call(vals_3);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (add == 0) {
            return new Bytes(this.buffer, start, end);
        }
        var dst = this._growSlice(add);
        var view = dst.data();
        try {
            for (var vals_4 = __values(vals), vals_4_1 = vals_4.next(); !vals_4_1.done; vals_4_1 = vals_4.next()) {
                var val = vals_4_1.value;
                view.set(val, end);
                end += val.length;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (vals_4_1 && !vals_4_1.done && (_b = vals_4.return)) _b.call(vals_4);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return dst;
    };
    Bytes.prototype._growSlice = function (add) {
        if (add == 0) {
            return new Bytes(this.buffer, this.start, this.end);
        }
        var cap = this.capacity;
        var len = this.length;
        var grow = len + add;
        if (grow < cap) {
            var start = this.end;
            var dst_1 = new Bytes(this.buffer, this.start, start + add);
            return dst_1;
        }
        cap = growSlice(len, cap, grow);
        var buffer = new ArrayBuffer(cap);
        var view = new Uint8Array(buffer);
        var dst = new Bytes(buffer, 0, grow);
        view.set(this.data());
        return dst;
    };
    Bytes.prototype._append = function (val) {
        var add = val.length;
        var end = this.end;
        if (add == 0) {
            return new Bytes(this.buffer, this.start, end);
        }
        var dst = this._growSlice(add);
        dst.data().set(val, end);
        return dst;
    };
    Bytes.prototype.toString = function () {
        return new TextDecoder().decode(this.data());
    };
    return Bytes;
}(decorator_1.ClassForEach));
exports.Bytes = Bytes;
//# sourceMappingURL=slice.js.map