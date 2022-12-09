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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
var values_1 = require("../values");
var types_1 = require("./types");
var assert_1 = require("../assert");
/**
 * A queue implemented using fixed-length arrays
 * @sealed
 */
var Queue = /** @class */ (function (_super) {
    __extends(Queue, _super);
    /**
     *
     * @param capacity if < 1 use default 10
     * @param opts
     */
    function Queue(capacity, opts) {
        if (capacity === void 0) { capacity = 10; }
        var _this = _super.call(this, opts) || this;
        /**
         * offset of array
         */
        _this.offset_ = 0;
        /**
         * queue size
         */
        _this.size_ = 0;
        capacity = Math.floor(capacity);
        if (capacity < 1) {
            capacity = 10;
        }
        _this.a_ = new Array(capacity);
        return _this;
    }
    Object.defineProperty(Queue.prototype, "length", {
        /**
         * returns the length of the queue
         * @override
         */
        get: function () {
            return this.size_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Queue.prototype, "capacity", {
        /**
         * returns the capacity of the queue
         * @override
         */
        get: function () {
            return this.a_.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * get queue element
     * @throws TypeError
     * @throws RangeError
     */
    Queue.prototype.get = function (i) {
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.size_,
        });
        var a = this.a_;
        return a[(this.offset_ + i) % a.length];
    };
    /**
     * set queue element
     * @throws TypeError
     * @throws RangeError
     */
    Queue.prototype.set = function (i, val) {
        assert_1.defaultAssert.isUInt({
            name: "i",
            val: i,
            max: this.size_,
        });
        var a = this.a_;
        a[(this.offset_ + i) % a.length] = val;
    };
    /**
     * inserts val at the back of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    Queue.prototype.pushBack = function (val) {
        var a = this.a_;
        var size = this.size_;
        if (size == a.length) {
            return false;
        }
        a[(this.offset_ + size) % a.length] = val;
        this.size_++;
        return true;
    };
    /**
     * inserts val at the front of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    Queue.prototype.pushFront = function (val) {
        var a = this.a_;
        var size = this.size_;
        if (size == a.length) {
            return false;
        }
        if (this.offset_ == 0) {
            this.offset_ = a.length;
        }
        this.offset_--;
        a[this.offset_] = val;
        this.size_++;
        return true;
    };
    /**
     * If the queue is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    Queue.prototype.popFront = function (callback) {
        return this.popFrontRaw(callback)[0];
    };
    /**
     * If the queue is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    Queue.prototype.popFrontRaw = function (callback) {
        var _a;
        var size = this.size_;
        if (size == 0) {
            return [undefined, false];
        }
        var a = this.a_;
        var val = a[this.offset_++];
        if (this.offset_ == a.length) {
            this.offset_ = 0;
        }
        this.size_--;
        callback = (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
        if (callback) {
            callback(val);
        }
        return [val, true];
    };
    /**
     * If the queue is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    Queue.prototype.popBack = function (callback) {
        return this.popBackRaw(callback)[0];
    };
    /**
     * If the queue is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    Queue.prototype.popBackRaw = function (callback) {
        var size = this.size_;
        if (size == 0) {
            return [undefined, false];
        }
        var a = this.a_;
        var val = a[(this.offset_ + size - 1) % a.length];
        this.size_--;
        if (callback) {
            callback(val);
        }
        return [val, true];
    };
    /**
     * clear the queue
     * @param callback call the callback on the removed element
     */
    Queue.prototype.clear = function (callback) {
        var e_1, _a;
        var _b;
        callback = callback !== null && callback !== void 0 ? callback : (_b = this.opts_) === null || _b === void 0 ? void 0 : _b.remove;
        if (callback) {
            try {
                for (var _c = __values(this.a_), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var v = _d.value;
                    callback(v);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.a_.splice(0);
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    Queue.prototype.iterator = function (reverse) {
        var a = this.a_;
        var length = a.length;
        var size = this.size_;
        var offset = this.offset_;
        if (reverse) {
            var i_1 = size - 1;
            return {
                next: function () {
                    if (i_1 >= 0) {
                        return {
                            value: a[(offset + (i_1--)) % length],
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
                    if (i_2 < size) {
                        return {
                            value: a[(offset + (i_2++)) % length],
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
    Queue.prototype.clone = function (callback) {
        var _a;
        var l = new Queue(this.a_.length, this.opts_);
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.clone;
        if (callback) {
            l.pushList(this, callback);
        }
        else {
            l.pushList(this);
        }
        return l;
    };
    /**
     * push a copy of another container of queue.
     */
    Queue.prototype.pushList = function (vals, callback) {
        var e_2, _a, e_3, _b;
        var _c;
        callback = callback !== null && callback !== void 0 ? callback : (_c = this.opts_) === null || _c === void 0 ? void 0 : _c.clone;
        if (callback) {
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var v = vals_1_1.value;
                    this.pushBack(callback(v));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else {
            try {
                for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                    var v = vals_2_1.value;
                    this.pushBack(v);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (vals_2_1 && !vals_2_1.done && (_b = vals_2.return)) _b.call(vals_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    };
    return Queue;
}(types_1.Basic));
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map