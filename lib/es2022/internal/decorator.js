"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classForEach = exports.ClassForEach = exports.notImplement = void 0;
const types_1 = require("../types");
function notImplement(c, f) {
    return `class "${c}" not implemented function "${f}"`;
}
exports.notImplement = notImplement;
class ClassForEach {
    /**
     * @virtual
     */
    iterator(reverse) {
        throw new EvalError(notImplement(this.constructor.name, "iterator(reverse?: boolean): Iterator<T>"));
    }
    /**
     * @virtual
     */
    get length() {
        throw new EvalError(notImplement(this.constructor.name, "get length(): number"));
    }
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    forEach(callback, reverse) {
        throw new EvalError(notImplement(this.constructor.name, "forEach(callback: ValueCallback<T>, reverse?: boolean): void"));
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
        throw new EvalError(notImplement(this.constructor.name, "find(callback: ValidCallback<T>, reverse?: boolean): boolean"));
    }
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    has(data, reverse, callback) {
        throw new EvalError(notImplement(this.constructor.name, "has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean"));
    }
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    map(callback, reverse) {
        throw new EvalError(notImplement(this.constructor.name, "map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>"));
    }
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     */
    join(separator, callback, reverse) {
        throw new EvalError(notImplement(this.constructor.name, "join<TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string"));
    }
}
exports.ClassForEach = ClassForEach;
function classForEach(c) {
    c.prototype.forEach = function (callback, reverse) {
        const self = this;
        if (self.length < 1) {
            return;
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse); } };
        for (const v of vals) {
            callback(v);
        }
    };
    c.prototype.find = function (callback, reverse) {
        const self = this;
        if (self.length < 1) {
            return false;
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse); } };
        for (const v of vals) {
            if (callback(v)) {
                return true;
            }
        }
        return false;
    };
    c.prototype.has = function (data, reverse, callback) {
        const self = this;
        if (self.length < 1) {
            return false;
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse); } };
        for (const v of vals) {
            if ((0, types_1.compare)(data, v, callback) == 0) {
                return true;
            }
        }
        return false;
    };
    c.prototype.map = function (callback, reverse) {
        const self = this;
        if (self.length < 1) {
            return [];
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse); } };
        const result = new Array(self.length);
        let i = 0;
        for (const v of vals) {
            result[i++] = callback(v);
        }
        return result;
    };
    c.prototype.join = function (separator, callback, reverse) {
        const c = callback ?? ((v) => `${v}`);
        return this.map(c, reverse).join(separator);
    };
}
exports.classForEach = classForEach;
//# sourceMappingURL=decorator.js.map