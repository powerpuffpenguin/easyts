/**
 * Base class for exceptions thrown by this library
 */
export class Exception extends Error {
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
}
/**
 * exception with error code
 */
export class CodeException extends Exception {
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
//# sourceMappingURL=exception.js.map