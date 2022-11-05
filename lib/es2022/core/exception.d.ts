/**
 * Base class for exceptions thrown by this library
 */
export declare class Exception {
    readonly message: string;
    /**
     *
     * @param message Exception description information
     */
    constructor(message: string);
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error(): string;
}
