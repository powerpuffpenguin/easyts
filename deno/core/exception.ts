/**
 * Base class for exceptions thrown by this library
 */
export class Exception extends Error {
    /**
     * 
     * @param message Exception description information
     */
    constructor(message: string) {
        super(message)
    }
    /**
     * 
     * @returns Returns the string description of the exception
     * @virtual
     */
    error(): string {
        return this.message
    }
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    as<T extends Exception>(target: ExceptionConstructor<T>): T | undefined {
        if (this instanceof target) {
            return this
        }
        let err = this.unwrap()
        while (err) {
            if (err instanceof target) {
                return err
            }
            err = err.unwrap()
        }
        return
    }
    is(target: any): boolean {
        if (this === target) {
            return true
        }
        let err = this.unwrap()
        while (err) {
            if (err === target) {
                return true
            }
            err = err.unwrap()
        }
        return false
    }
    /**
     * Returns the wrapped exception if the current exception wraps another exception, otherwise returns undefined
     * @virtual
     */
    unwrap(): undefined | Exception {
        return
    }
    /**
     * wrap the exception e into a new exception
     */
    static wrap(e: Exception, msg: string): Exception {
        return new Wrap(e, msg)
    }
    timeout(): boolean {
        return false
    }
    temporary(): boolean {
        return false
    }
}
export type ExceptionConstructor<T extends Exception> = new (...args: any[]) => T
class Wrap extends Exception {
    constructor(private readonly e: Exception, msg: string) {
        super(msg)
    }
    unwrap(): undefined | Exception {
        return this.e
    }
}

export const errOutOfRange = new Exception('out of range')