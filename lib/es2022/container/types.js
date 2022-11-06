"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basic = exports.errEmpty = exports.errBadAdd = exports.ContainerException = void 0;
const exception_1 = require("../core/exception");
const types_1 = require("../core/types");
/**
 * Exceptions thrown by container operations
 */
class ContainerException extends exception_1.Exception {
}
exports.ContainerException = ContainerException;
/**
 * The container has reached the capacity limit and cannot add new data
 */
exports.errBadAdd = new ContainerException('The container has reached the capacity limit and cannot add new data');
exports.errEmpty = new ContainerException('The container is empty');
/**
 * Containers should all be derived from this class, so that some algorithms can recognize containers and optimize for them
 */
class Basic {
    /**
     * Returns the current amount of data in the container
     * @virtual
     */
    get length() {
        throw new ContainerException('function length not implemented');
    }
    /**
     * Returns a js iterator
     * @param reverse The iterator returned if true will traverse the container in reverse order
     * @virtual
     *
     */
    iterator(reverse) {
        throw new ContainerException('function iterator not implemented');
    }
    /**
     * Returns true if the data depth of the two containers is consistent
     * @param o
     */
    compareTo(o, callback) {
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
     * Returns an object that implements a js Iterable
     * @sealedl
     */
    get iterable() {
        const i = this.iterator();
        return {
            [Symbol.iterator]() {
                return i;
            }
        };
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
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    forEach(callback, reverse) {
        const it = reverse ? this.reverse : this.iterable;
        for (const v of it) {
            callback(v);
        }
    }
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     */
    find(callback, reverse) {
        const it = reverse ? this.reverse : this.iterable;
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
        const it = reverse ? this.reverse : this.iterable;
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
        const it = reverse ? this.reverse : this.iterable;
        for (const v of it) {
            if ((0, types_1.compare)(data, v, callback) == 0) {
                return true;
            }
        }
        return false;
    }
}
exports.Basic = Basic;
//# sourceMappingURL=types.js.map