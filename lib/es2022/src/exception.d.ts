/**
 * Base class for exceptions thrown by this library
 */
export declare class Exception extends Error {
    constructor(message?: string, opts?: ErrorOptions);
    /**
     * error code
     */
    ec?: number;
    /**
     * If true, the error is caused by exceeding the time limit
     */
    timeout?: boolean;
    /**
     * If true, this is a temporary error and the operation can be retried later
     */
    temporary?: boolean;
    /**
     * Is it triggered by context default cancellation
     */
    canceled?: boolean;
}
/**
 * exception with error code
 */
export declare class CodeException extends Exception {
    /**
     *
     * @param ec error code
     * @param message
     * @param opts
     */
    constructor(ec: number, message?: string, opts?: ErrorOptions);
}
