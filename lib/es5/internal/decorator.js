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
exports.classForEach = exports.ClassForEach = void 0;
var types_1 = require("../types");
function notImplement(c, f) {
    return "class \"".concat(c, "\" not implemented function \"").concat(f, "\"");
}
var ClassForEach = /** @class */ (function () {
    function ClassForEach() {
        var _newTarget = this.constructor;
        this.__name__ = _newTarget.name;
    }
    /**
     * @virtual
     */
    ClassForEach.prototype.iterator = function (reverse) {
        throw new EvalError(notImplement(this.__name__, "iterator(reverse?: boolean): Iterator<T>"));
    };
    Object.defineProperty(ClassForEach.prototype, "length", {
        /**
         * @virtual
         */
        get: function () {
            throw new EvalError(notImplement(this.__name__, "get length(): number"));
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
    ClassForEach.prototype.forEach = function (callback, reverse) {
        throw new EvalError(notImplement(this.__name__, "forEach(callback: ValueCallback<T>, reverse?: boolean): void"));
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
    ClassForEach.prototype.find = function (callback, reverse) {
        throw new EvalError(notImplement(this.__name__, "find(callback: ValidCallback<T>, reverse?: boolean): boolean"));
    };
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    ClassForEach.prototype.has = function (data, reverse, callback) {
        throw new EvalError(notImplement(this.__name__, "has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean"));
    };
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    ClassForEach.prototype.map = function (callback, reverse) {
        throw new EvalError(notImplement(this.__name__, "map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>"));
    };
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     */
    ClassForEach.prototype.join = function (separator, callback, reverse) {
        throw new EvalError(notImplement(this.__name__, "join<TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string"));
    };
    return ClassForEach;
}());
exports.ClassForEach = ClassForEach;
function classForEach(c) {
    c.prototype.forEach = function (callback, reverse) {
        var _a, e_1, _b;
        var self = this;
        if (self.length < 1) {
            return;
        }
        var vals = (_a = {}, _a[Symbol.iterator] = function () { return self.iterator(reverse); }, _a);
        try {
            for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                var v = vals_1_1.value;
                callback(v);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (vals_1_1 && !vals_1_1.done && (_b = vals_1.return)) _b.call(vals_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    c.prototype.find = function (callback, reverse) {
        var _a, e_2, _b;
        var self = this;
        if (self.length < 1) {
            return false;
        }
        var vals = (_a = {}, _a[Symbol.iterator] = function () { return self.iterator(reverse); }, _a);
        try {
            for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                var v = vals_2_1.value;
                if (callback(v)) {
                    return true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (vals_2_1 && !vals_2_1.done && (_b = vals_2.return)) _b.call(vals_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return false;
    };
    c.prototype.has = function (data, reverse, callback) {
        var _a, e_3, _b;
        var self = this;
        if (self.length < 1) {
            return false;
        }
        var vals = (_a = {}, _a[Symbol.iterator] = function () { return self.iterator(reverse); }, _a);
        try {
            for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
                var v = vals_3_1.value;
                if ((0, types_1.compare)(data, v, callback) == 0) {
                    return true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (vals_3_1 && !vals_3_1.done && (_b = vals_3.return)) _b.call(vals_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return false;
    };
    c.prototype.map = function (callback, reverse) {
        var _a, e_4, _b;
        var self = this;
        if (self.length < 1) {
            return [];
        }
        var vals = (_a = {}, _a[Symbol.iterator] = function () { return self.iterator(reverse); }, _a);
        var result = new Array(self.length);
        var i = 0;
        try {
            for (var vals_4 = __values(vals), vals_4_1 = vals_4.next(); !vals_4_1.done; vals_4_1 = vals_4.next()) {
                var v = vals_4_1.value;
                result[i++] = callback(v);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (vals_4_1 && !vals_4_1.done && (_b = vals_4.return)) _b.call(vals_4);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return result;
    };
    c.prototype.join = function (separator, callback, reverse) {
        var c = callback !== null && callback !== void 0 ? callback : (function (v) { return "".concat(v); });
        return this.map(c, reverse).join(separator);
    };
}
exports.classForEach = classForEach;
//# sourceMappingURL=decorator.js.map