/**
 * Base class for exceptions thrown by this library
 */
export class Exception extends Error {
    constructor(message?: string, opts?: ErrorOptions) {
        super(message, opts)
        if (opts?.cause !== undefined) {
            this.cause = opts.cause
        }

        // restore prototype chain   
        const proto = new.target.prototype
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, proto)
        }
        else {
            (this as any).__proto__ = proto
        }
        this.name = new.target.name
    }
    /**
     * If true, the error is caused by exceeding the time limit
     */
    timeout?: boolean
    /**
     * If true, this is a temporary error and the operation can be retried later
     */
    temporary?: boolean
}
