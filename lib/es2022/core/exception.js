"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errOutOfRange = exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
class Exception extends Error {
    /**
     *
     * @param message Exception description information
     */
    constructor(message) {
        super(message);
        // restore prototype chain   
        const proto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, proto);
        }
        else {
            this.__proto__ = proto;
        }
    }
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error() {
        return this.message;
    }
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    as(target) {
        if (this instanceof target) {
            return this;
        }
        let err = this.unwrap();
        while (err) {
            if (err instanceof target) {
                return err;
            }
            err = err.unwrap();
        }
        return;
    }
    is(target) {
        if (this === target) {
            return true;
        }
        let err = this.unwrap();
        while (err) {
            if (err === target) {
                return true;
            }
            err = err.unwrap();
        }
        return false;
    }
    /**
     * Returns the wrapped exception if the current exception wraps another exception, otherwise returns undefined
     * @virtual
     */
    unwrap() {
        return;
    }
    /**
     * wrap the exception e into a new exception
     */
    static wrap(e, msg) {
        return new Wrap(e, msg);
    }
    timeout() {
        return false;
    }
    temporary() {
        return false;
    }
}
exports.Exception = Exception;
class Wrap extends Exception {
    e;
    constructor(e, msg) {
        super(msg);
        this.e = e;
    }
    unwrap() {
        return this.e;
    }
}
exports.errOutOfRange = new Exception('out of range');
//# sourceMappingURL=exception.js.map