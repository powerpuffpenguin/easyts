"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endIterator = exports.errNoData = exports.errIteratorInvalid = exports.errBadAdd = exports.ContainerException = void 0;
const exception_1 = require("../core/exception");
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
/**
 * iterator is invalid
 */
exports.errIteratorInvalid = new ContainerException('Iterator is invalid');
/**
* iterator is invalid, usually because the container is empty
*/
exports.errNoData = new ContainerException('no data found');
class _EndIterator {
    set(_) {
        throw exports.errIteratorInvalid;
    }
    get() {
        throw exports.errIteratorInvalid;
    }
    ok = false;
    next() {
        return this;
    }
    prev() {
        return this;
    }
    *[Symbol.iterator]() {
        console.log(4);
    }
}
/**
 * an invalid iterator to indicate the end of the iteration
 */
exports.endIterator = new _EndIterator();
console.log(1);
for (const iterator of exports.endIterator) {
    console.log(2);
}
console.log(3);
//# sourceMappingURL=types.js.map