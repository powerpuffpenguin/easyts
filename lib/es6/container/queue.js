"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const values_1 = require("../core/values");
const exception_1 = require("../core/exception");
const types_1 = require("./types");
/**
 * A queue implemented using fixed-length arrays
 */
class Queue extends types_1.Basic {
    /**
     *
     * @param capacity if < 1 use default 10
     * @param opts
     */
    constructor(capacity = 10, opts) {
        super(opts);
        /**
         * offset of array
         */
        this.offset_ = 0;
        /**
         * queue size
         */
        this.size_ = 0;
        capacity = Math.floor(capacity);
        if (capacity < 1) {
            capacity = 10;
        }
        this.a_ = new Array(capacity);
    }
    /**
     * returns the length of the queue
     * @override
     */
    get length() {
        return this.size_;
    }
    /**
     * returns the capacity of the queue
     * @override
     */
    get capacity() {
        return this.a_.length;
    }
    /**
     * get queue element
     * @throws {@link core.errOutOfRange}
     */
    get(i) {
        const a = this.a_;
        if (i < 0 || i >= this.size_) {
            throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
        }
        return a[(this.offset_ + i) % a.length];
    }
    /**
     * set queue element
     * @throws {@link core.errOutOfRange}
     */
    set(i, val) {
        const a = this.a_;
        if (i < 0 || i >= this.size_) {
            throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
        }
        a[(this.offset_ + i) % a.length] = val;
    }
    /**
     * inserts val at the back of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    pushBack(val) {
        const a = this.a_;
        const size = this.size_;
        if (size == a.length) {
            return false;
        }
        a[(this.offset_ + size) % a.length] = val;
        this.size_++;
        return true;
    }
    /**
     * inserts val at the front of queue
     * @returns Returns true if successful, if queue is full do nothing and return false
     */
    pushFront(val) {
        const a = this.a_;
        const size = this.size_;
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
    }
    /**
     * If the queue is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popFront(callback) {
        var _a;
        const size = this.size_;
        if (size == 0) {
            return values_1.noResult;
        }
        const a = this.a_;
        const val = a[this.offset_++];
        if (this.offset_ == a.length) {
            this.offset_ = 0;
        }
        this.size_--;
        callback = (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
        if (callback) {
            callback(val);
        }
        return {
            value: val,
        };
    }
    /**
     * If the queue is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    popBack(callback) {
        const size = this.size_;
        if (size == 0) {
            return values_1.noResult;
        }
        const a = this.a_;
        const val = a[(this.offset_ + size - 1) % a.length];
        this.size_--;
        if (callback) {
            callback(val);
        }
        return {
            value: val,
        };
    }
    /**
     * clear the queue
     * @param callback call the callback on the removed element
     */
    clear(callback) {
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
        if (callback) {
            for (const v of this.a_) {
                callback(v);
            }
        }
        this.a_.splice(0);
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse) {
        const a = this.a_;
        const length = a.length;
        const size = this.size_;
        const offset = this.offset_;
        if (reverse) {
            let i = size - 1;
            return {
                next() {
                    if (i >= 0) {
                        return {
                            value: a[(offset + (i--)) % length],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            let i = 0;
            return {
                next() {
                    if (i < size) {
                        return {
                            value: a[(offset + (i++)) % length],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    }
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    clone(callback) {
        var _a;
        const l = new Queue(this.a_.length, this.opts_);
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.clone;
        if (callback) {
            l.pushList(this, callback);
        }
        else {
            l.pushList(this);
        }
        return l;
    }
    /**
     * push a copy of another container of queue.
     */
    pushList(vals, callback) {
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.clone;
        if (callback) {
            for (const v of vals) {
                this.pushBack(callback(v));
            }
        }
        else {
            for (const v of vals) {
                this.pushBack(v);
            }
        }
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map