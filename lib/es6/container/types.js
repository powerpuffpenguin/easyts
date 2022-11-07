"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basic = exports.ContainerException = void 0;
const exception_1 = require("../core/exception");
const types_1 = require("../core/types");
/**
 * Exceptions thrown by container operations
 */
class ContainerException extends exception_1.Exception {
}
exports.ContainerException = ContainerException;
/**
 * The base class of the container implements some common methods for the container
 */
class Basic {
    constructor(opts) {
        this.opts_ = opts;
    }
    /**
     * Returns the current amount of data in the container
     *
     * @virtual
     */
    get length() {
        throw new ContainerException('function length not implemented');
    }
    /**
     * Returns the current capacity of the container
     *
     * @virtual
     */
    get capacity() {
        throw new ContainerException('function capacity not implemented');
    }
    /**
     * Returns true if there is no data in the container
     *
     * @virtual
     */
    get isEmpty() {
        return this.length == 0;
    }
    /**
     * Returns true if there is data in the container
     *
     * @virtual
     */
    get isNotEmpty() {
        return this.length != 0;
    }
    /**
     * Returns true if the container has reached the container limit
     *
     * @virtual
     */
    get isFull() {
        return this.length == this.capacity;
    }
    /**
     * Returns true if the container has not reached the container limit
     *
     * @virtual
     */
    get isNotFull() {
        return this.length < this.capacity;
    }
    /**
     * Returns a js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     *
     * @virtual
     *
     */
    iterator(reverse) {
        throw new ContainerException('function iterator not implemented');
    }
    /**
     * Returns true if the data depth of the two containers is consistent
     *
     * @param o
     *
     * @virtual
     */
    compareTo(o, callback) {
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare;
        let l = this.iterator(true);
        let r = o.iterator(true);
        while (true) {
            const v0 = l.next();
            const v1 = r.next();
            if (v0.done) {
                if (!v1.done) {
                    return -1;
                }
                break;
            }
            else if (v1.done) {
                return 1;
            }
            const v = (0, types_1.compare)(v0.value, v1.value, callback);
            if (v != 0) {
                return v;
            }
        }
        return 0;
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
            *[Symbol.iterator]() {
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
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare;
        const it = reverse ? this.reverse : this;
        for (const v of it) {
            if ((0, types_1.compare)(data, v, callback) == 0) {
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
exports.Basic = Basic;
//# sourceMappingURL=types.js.map