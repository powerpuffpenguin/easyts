/**
 * Base class for exceptions thrown by this library
 */
export class Exception {
    /**
     * 
     * @param message Exception description information
     */
    constructor(public readonly message: string) { }
    /**
     * 
     * @returns Returns the string description of the exception
     * @virtual
     */
    error(): string {
        return this.message
    }
}