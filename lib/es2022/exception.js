"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
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
     * If true, the error is caused by exceeding the time limit
     */
    timeout;
    /**
     * If true, this is a temporary error and the operation can be retried later
     */
    temporary;
}
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map