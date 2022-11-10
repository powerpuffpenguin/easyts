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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basic = void 0;
var exception_1 = require("../core/exception");
var types_1 = require("../core/types");
/**
 * The base class of the container implements some common methods for the container
 */
var Basic = /** @class */ (function () {
    function Basic(opts) {
        this.opts_ = opts;
    }
    Object.defineProperty(Basic.prototype, "length", {
        /**
         * Returns the current amount of data in the container
         *
         * @virtual
         */
        get: function () {
            throw new exception_1.Exception('function length not implemented');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "capacity", {
        /**
         * Returns the current capacity of the container
         *
         * @virtual
         */
        get: function () {
            throw new exception_1.Exception('function capacity not implemented');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isEmpty", {
        /**
         * Returns true if there is no data in the container
         *
         * @virtual
         */
        get: function () {
            return this.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isNotEmpty", {
        /**
         * Returns true if there is data in the container
         *
         * @virtual
         */
        get: function () {
            return this.length != 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isFull", {
        /**
         * Returns true if the container has reached the container limit
         *
         * @virtual
         */
        get: function () {
            return this.length == this.capacity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isNotFull", {
        /**
         * Returns true if the container has not reached the container limit
         *
         * @virtual
         */
        get: function () {
            return this.length < this.capacity;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     *
     * @virtual
     *
     */
    Basic.prototype.iterator = function (reverse) {
        throw new exception_1.Exception('function iterator not implemented');
    };
    /**
     * Returns true if the data depth of the two containers is consistent
     *
     * @param o
     *
     * @virtual
     */
    Basic.prototype.compareTo = function (o, callback) {
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare;
        var l = this.iterator(true);
        var r = o.iterator(true);
        while (true) {
            var v0 = l.next();
            var v1 = r.next();
            if (v0.done) {
                if (!v1.done) {
                    return -1;
                }
                break;
            }
            else if (v1.done) {
                return 1;
            }
            var v = (0, types_1.compare)(v0.value, v1.value, callback);
            if (v != 0) {
                return v;
            }
        }
        return 0;
    };
    /**
     * implements js Iterable
     * @sealedl
     */
    Basic.prototype[Symbol.iterator] = function () {
        return this.iterator();
    };
    Object.defineProperty(Basic.prototype, "reverse", {
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
    Basic.prototype.forEach = function (callback, reverse) {
        var e_1, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_1 = __values(it), it_1_1 = it_1.next(); !it_1_1.done; it_1_1 = it_1.next()) {
                var v = it_1_1.value;
                callback(v);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (it_1_1 && !it_1_1.done && (_a = it_1.return)) _a.call(it_1);
            }
            finally { if (e_1) throw e_1.error; }
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
    Basic.prototype.find = function (callback, reverse) {
        var e_2, _a;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_2 = __values(it), it_2_1 = it_2.next(); !it_2_1.done; it_2_1 = it_2.next()) {
                var v = it_2_1.value;
                if (callback(v)) {
                    return true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (it_2_1 && !it_2_1.done && (_a = it_2.return)) _a.call(it_2);
            }
            finally { if (e_2) throw e_2.error; }
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
    Basic.prototype.map = function (callback, reverse) {
        var e_3, _a;
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
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (it_3_1 && !it_3_1.done && (_a = it_3.return)) _a.call(it_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    };
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    Basic.prototype.has = function (data, reverse, callback) {
        var e_4, _a;
        var _b;
        callback = callback !== null && callback !== void 0 ? callback : (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.compare;
        var it = reverse ? this.reverse : this;
        try {
            for (var it_4 = __values(it), it_4_1 = it_4.next(); !it_4_1.done; it_4_1 = it_4.next()) {
                var v = it_4_1.value;
                if ((0, types_1.compare)(data, v, callback) == 0) {
                    return true;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (it_4_1 && !it_4_1.done && (_a = it_4.return)) _a.call(it_4);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return false;
    };
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    Basic.prototype.join = function (separator) {
        return this.map(function (v) { return "".concat(v); }).join(separator);
    };
    return Basic;
}());
exports.Basic = Basic;
//# sourceMappingURL=types.js.map