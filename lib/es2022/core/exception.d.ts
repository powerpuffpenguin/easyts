export declare enum CauseCode {
    Uknow = 0,
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    Aborted = 1,
    /**
     * An internal system error has occurred, this system may not function properly, but it does not affect other systems, but it is recommended to exit the program
     */
    Internal = 2,
    /**
     * The requested resource was not found
     */
    NotFound = 10,
    /**
     * The requested resource already exists
     */
    AlreadyExists = 11,
    /**
     * An invalid parameter was passed in
     */
    InvalidArgument = 50,
    /**
     * The parameter type passed in is not allowed
     */
    InvalidType = 51,
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    OutOfRange = 52,
    /**
     * The requested feature is not implemented in the current version
     */
    Unimplemented = 100,
    /**
     * Missing required authorization
     */
    PermissionDenied = 101
}
/**
 * Various error causes predefined for the system
 *
 * @remarks
 * js is difficult to handle the exceptions obtained by catch because you cannot correctly identify the exceptions, so you cannot handle different exceptions correctly.
 *
 * Using instanceof to identify is inaccurate. For example, the libraries a and b you use, a throws a class Exception of library x v1.0.0, and b throws a class Exception of library x v1.0.1. At this time, v1.0.0 and The class Exception of v1.0.1 is two different classes, you must identify and handle them with different versions of instanceof
 *
 * Therefore, it is relatively correct and simple to use number code to identify exceptions in consideration of third-party libraries
 */
export declare class Cause {
    readonly message?: string | undefined;
    /**
     * code as the only indicator that the program can accurately identify the error
     * @remarks
     * Values <1000 This system uses third-party libraries and other values should be used.
     *
     * Third-party libraries should try to avoid code duplication. You can choose the code starting value according to fixed rules, for example, use the following function to calculate
     * ```
     * function getCode(pkgname: string) {
     *     const max = Math.floor(Number.MAX_SAFE_INTEGER / 10000)
     *     let code = 0
     *     for (const v of new TextEncoder().encode(pkgname)) {
     *         code = (code + v) % max
     *     }
     *     console.log((code == 0 ? 1 : code) * 1000)
     * }
     * ```
     */
    readonly code: number;
    /**
     *
     * @param code Error code, as the only indicator that the program can accurately identify the error
     * @param message A descriptive string for human viewing
     */
    constructor(code: number, message?: string | undefined);
    toString(): string;
    static getCode(v: any): number | undefined;
    /**
     * unknown error
     */
    static Uknow: Cause;
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    static Aborted: Cause;
    /**
     * The parameter type passed in is not allowed
     */
    static InvalidType: Cause;
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    static OutOfRange: Cause;
    /**
     * The requested resource was not found
     */
    static NotFound: Cause;
    /**
     * The requested resource already exists
     */
    static AlreadyExists: Cause;
    /**
     * An invalid parameter was passed in
     */
    static InvalidArgument: Cause;
    /**
     * The requested feature is not implemented in the current version
     */
    static Unimplemented: Cause;
    /**
     * Missing required authorization
     */
    static PermissionDenied: Cause;
}
/**
 * Base class for exceptions thrown by this library
 */
export declare class Exception extends Error {
    static __classid__: number;
    static __classname__: string;
    get classid(): number;
    get classname(): string;
    /**
     *
     * @param message Exception description information
     */
    constructor(message?: string, opts?: ErrorOptions);
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error(): string;
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    as<T extends Exception>(target: ExceptionConstructor<T>): T | undefined;
    is(target: any): boolean;
    /**
     * Returns the wrapped exception if the current exception wraps another exception, otherwise returns undefined
     * @virtual
     */
    unwrap(): undefined | Exception;
    /**
     * wrap the exception e into a new exception
     */
    static wrap(e: Exception, msg: string): Exception;
    timeout(): boolean;
    temporary(): boolean;
}
export declare type ExceptionConstructor<T extends Exception> = new (...args: any[]) => T;
export declare const errOutOfRange: Exception;
export declare function asError<T extends Exception>(e: any, error: ExceptionConstructor<T>): T | undefined;
export declare function isError<T extends Exception>(e: any, error: ExceptionConstructor<T>): boolean;
