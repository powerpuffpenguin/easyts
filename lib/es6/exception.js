"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeException = exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
class Exception extends Error {
    constructor(message, opts) {
        super(message, opts);
        if ((opts === null || opts === void 0 ? void 0 : opts.cause) !== undefined) {
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
}
exports.Exception = Exception;
/**
 * exception with error code
 */
class CodeException extends Error {
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