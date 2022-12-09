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
exports.Heap = exports.remove = exports.push = exports.popRaw = exports.pop = exports.fix = exports.heapify = void 0;
var values_1 = require("../values");
var types_1 = require("../types");
var types_2 = require("./types");
var assert_1 = require("../assert");
function getIndex(i) {
    if (i < 1) {
        return 0;
    }
    return Math.floor(i);
}
/**
 * Initialize array to heap
 */
function heapify(h, cf) {
    // heapify
    var n = h.length;
    for (var i = getIndex(n / 2) - 1; i >= 0; i--) {
        down(h, i, n, cf);
    }
    return h;
}
exports.heapify = heapify;
function up(h, j, cf) {
    var _a;
    while (true) {
        var i = getIndex((j - 1) / 2); // parent
        if (i == j
            || (0, types_1.compare)(h[j], h[i], cf) >= 0) {
            break;
        }
        _a = __read([h[j], h[i]], 2), h[i] = _a[0], h[j] = _a[1];
        j = i;
    }
}
function down(h, i0, n, cf) {
    var _a;
    var i = i0;
    while (true) {
        var j1 = 2 * i + 1;
        if (j1 >= n || j1 < 0) { // j1 < 0 after int overflow
            break;
        }
        var j = j1; // left child
        var j2 = j1 + 1;
        if (j2 < n && (0, types_1.compare)(h[j2], h[j1], cf) < 0) {
            j = j2; // = 2*i + 2  // right child
        }
        if ((0, types_1.compare)(h[j], h[i], cf) >= 0) {
            break;
        }
        _a = __read([h[j], h[i]], 2), h[i] = _a[0], h[j] = _a[1];
        i = j;
    }
    return i > i0;
}
/**
 * Fix re-establishes the heap ordering after the element at index i has changed its value.
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
function fix(h, i, cf) {
    assert_1.defaultAssert.isUInt({
        name: "i",
        val: i,
        max: h.length,
        notMax: true,
    });
    if (!down(h, i, h.length, cf)) {
        up(h, i, cf);
    }
}
exports.fix = fix;
/**
 * Pop removes and returns the minimum element (according to cf or <) from the heap.
 *
 * @throws {@link core.errOutOfRange}
 */
function pop(h, cf, rf) {
    var _a;
    var n = h.length - 1;
    if (n < 0) {
        return;
    }
    else if (n != 0) {
        _a = __read([h[n], h[0]], 2), h[0] = _a[0], h[n] = _a[1];
    }
    down(h, 0, n, cf);
    var v = h[h.length - 1];
    h.pop();
    if (rf) {
        rf(v);
    }
    return v;
}
exports.pop = pop;
function popRaw(h, cf, rf) {
    var _a;
    var n = h.length - 1;
    if (n < 0) {
        return [undefined, false];
    }
    else if (n != 0) {
        _a = __read([h[n], h[0]], 2), h[0] = _a[0], h[n] = _a[1];
    }
    down(h, 0, n, cf);
    var v = h[h.length - 1];
    h.pop();
    if (rf) {
        rf(v);
    }
    return [v, true];
}
exports.popRaw = popRaw;
/**
 * Push pushes the element x onto the heap.
 */
function push(h, val, cf) {
    var j = h.length;
    h.push(val);
    up(h, j, cf);
}
exports.push = push;
/**
 * Remove removes and returns the element at index i from the heap.
 *
 * @throws {@link core.errOutOfRange}
 */
function remove(h, i, cf, rf) {
    var _a;
    assert_1.defaultAssert.isUInt({
        name: 'i',
        val: i,
        max: h.length,
        notMax: true,
    });
    var n = h.length - 1;
    if (n != i) {
        _a = __read([h[n], h[i]], 2), h[i] = _a[0], h[n] = _a[1];
        if (!down(h, i, n, cf)) {
            up(h, i, cf);
        }
    }
    var v = h[h.length - 1];
    h.pop();
    if (rf) {
        rf(v);
    }
    return v;
}
exports.remove = remove;
var Heap = /** @class */ (function (_super) {
    __extends(Heap, _super);
    function Heap(opts, heap) {
        var _this = _super.call(this, opts) || this;
        if (heap) {
            _this.h_ = heap;
        }
        else {
            _this.h_ = new Array();
        }
        return _this;
    }
    /**
     * Initialize array to heap
     */
    Heap.prototype.heapify = function () {
        var _a;
        heapify(this.h_, (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare);
    };
    /**
     * Fix re-establishes the heap ordering after the element at index i has changed its value.
     */
    Heap.prototype.fix = function (i) {
        var _a;
        fix(this.h_, i, (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare);
    };
    Object.defineProperty(Heap.prototype, "heap", {
        /**
         * Returns an array of underlying storage
         */
        get: function () {
            return this.h_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Heap.prototype, "length", {
        /**
         * returns the length of the heap
         * @override
         */
        get: function () {
            return this.h_.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Heap.prototype, "capacity", {
        /**
         * returns the capacity of the heap
         * @override
         */
        get: function () {
            return Number.MAX_SAFE_INTEGER;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * get heap array element
     * @throws {@link core.errOutOfRange}
     */
    Heap.prototype.get = function (i) {
        var h = this.h_;
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: h.length,
            notMax: true,
        });
        return h[i];
    };
    /**
     * set heap array element
     * @throws {@link core.errOutOfRange}
     */
    Heap.prototype.set = function (i, val) {
        var _a;
        var h = this.h_;
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: h.length,
            notMax: true,
        });
        var o = h[i];
        h[i] = val;
        var cf = (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare;
        if ((0, types_1.compare)(o, val, cf) == 0) {
            return;
        }
        fix(h, i, cf);
    };
    /**
     * Push pushes the element vals onto the heap.
     */
    Heap.prototype.push = function () {
        var e_1, _a;
        var _b;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        if (vals.length == 0) {
            return;
        }
        var h = this.h_;
        var cf = (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.compare;
        try {
            for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                var v = vals_1_1.value;
                push(h, v, cf);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Pop removes and returns the minimum element (according opts.compare cf or <) from the heap.
     */
    Heap.prototype.pop = function () {
        var _a, _b;
        return pop(this.h_, (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare, (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.remove);
    };
    /**
     * Pop removes and returns the minimum element (according opts.compare cf or <) from the heap.
     */
    Heap.prototype.popRaw = function () {
        var _a, _b;
        return popRaw(this.h_, (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare, (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.remove);
    };
    /**
     * Remove removes and returns the element at index i from the heap.
     *
     * @throws {@link core.errOutOfRange}
     */
    Heap.prototype.remove = function (i) {
        var _a, _b;
        return remove(this.h_, i, (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare, (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.remove);
    };
    /**
     * Empty the data in the container
     *
     * @param callback Call callback on the removed element
     * @override
     */
    Heap.prototype.clear = function (callback) {
        var e_2, _a;
        var _b;
        callback = callback !== null && callback !== void 0 ? callback : (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.remove;
        if (callback) {
            try {
                for (var _c = __values(this.h_), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var v = _d.value;
                    callback(v);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        this.h_.splice(0);
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    Heap.prototype.iterator = function (reverse) {
        var h = this.h_;
        if (reverse) {
            var i_1 = h.length - 1;
            return {
                next: function () {
                    if (i_1 >= 0) {
                        return {
                            value: h[i_1--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            var i_2 = 0;
            return {
                next: function () {
                    if (i_2 < h.length) {
                        return {
                            value: h[i_2++],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    };
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    Heap.prototype.clone = function (callback) {
        var _a;
        var _b;
        var l = new Heap(this.opts_);
        callback = callback !== null && callback !== void 0 ? callback : (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.clone;
        if (callback) {
            l.pushList(this, callback);
        }
        else {
            (_a = l.h_).push.apply(_a, __spreadArray([], __read(this.h_), false));
        }
        return l;
    };
    /**
     * inserts a copy of another container of heap.
     */
    Heap.prototype.pushList = function (vals, callback) {
        var e_3, _a, e_4, _b;
        var _c;
        callback = callback !== null && callback !== void 0 ? callback : (_c = this.opts_) === null || _c === void 0 ? void 0 : _c.clone;
        if (callback) {
            try {
                for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                    var v = vals_2_1.value;
                    this.push(callback(v));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (vals_2_1 && !vals_2_1.done && (_a = vals_2.return)) _a.call(vals_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        else {
            try {
                for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
                    var v = vals_3_1.value;
                    this.push(v);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (vals_3_1 && !vals_3_1.done && (_b = vals_3.return)) _b.call(vals_3);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    };
    return Heap;
}(types_2.Basic));
exports.Heap = Heap;
//# sourceMappingURL=heap.js.map