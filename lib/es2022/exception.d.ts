/**
 * Base class for exceptions thrown by this library
 */
export declare class Exception extends Error {
    constructor(message?: string, opts?: ErrorOptions);
    /**
     * If true, the error is caused by exceeding the time limit
     */
    timeout?: boolean;
    /**
     * If true, this is a temporary error and the operation can be retried later
     */
    temporary?: boolean;
}
