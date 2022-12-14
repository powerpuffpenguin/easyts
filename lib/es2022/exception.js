"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeException = exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
class Exception extends Error {
    constructor(message, opts) {
        super(message, opts);
        if (opts?.cause !== undefined) {
            this.cause = opts.cause;
        }
        // restore prototype chain   
        const proto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, proto);
        }
        else {
            this.__proto__ = proto;
        }
        this.name = new.target.name;
    }
    /**
     * error code
     */
    ec;
    /**
     * If true, the error is caused by exceeding the time limit
     */
    timeout;
    /**
     * If true, this is a temporary error and the operation can be retried later
     */
    temporary;
    /**
     * Is it triggered by context default cancellation
     */
    canceled;
}
exports.Exception = Exception;
/**
 * exception with error code
 */
class CodeException extends Exception {
    /**
     *
     * @param ec error code
     * @param message
     * @param opts
     */
    constructor(ec, message, opts) {
        super(message, opts);
        this.ec = ec;
    }
}
exports.CodeException = CodeException;
//# sourceMappingURL=exception.js.map