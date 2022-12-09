import { Exception } from "../exception";
import { compare } from "../types";
import { classForEach, ClassForEach } from "../internal/decorator";
/**
 * The base class of the container implements some common methods for the container
 */
export class Basic extends ClassForEach {
    constructor(opts) {
        super();
        this.opts_ = opts;
        classForEach(Basic);
    }
    /**
     * Returns the current capacity of the container
     *
     * @virtual
     */
    get capacity() {
        throw new Exception('function capacity not implemented');
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
        throw new Exception('function iterator not implemented');
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
            const v = compare(v0.value, v1.value, callback);
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
            [Symbol.iterator]() {
                return i;
            }
        };
    }
}
//# sourceMappingURL=types.js.map