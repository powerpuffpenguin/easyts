/**
 * Base class for exceptions thrown by this library
 */
export declare class Exception {
    readonly native: Error;
    /**
     *
     * @param message Exception description information
     */
    constructor(message: string);
    get message(): string;
    get stack(): string | undefined;
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error(): string;
    toString(): string;
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
