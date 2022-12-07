import { IdentityException, IdentityType } from "./internal/identity";
export const UUID = '591e8619-07d8-4d0d-89ac-b1b9a265afa3';

export enum CauseCode {
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
    PermissionDenied = 101,
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
export class Cause {
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
    readonly code: number
    /**
     * 
     * @param code Error code, as the only indicator that the program can accurately identify the error
     * @param message A descriptive string for human viewing
     */
    constructor(code: number, public readonly message?: string) {
        this.code = code
    }

    toString(): string {
        return JSON.stringify({
            code: this.code,
            message: this.message,
        })
    }
    static getCode(v: any): number | undefined {
        if (typeof v === "object") {
            const code = v['code']
            if (Number.isSafeInteger(code)) {
                return code
            }
        }
        return
    }
    /**
     * unknown error
     */
    static Uknow = new Cause(CauseCode.Uknow, 'unknow')
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    static Aborted = new Cause(CauseCode.Aborted, 'aborted')

    /**
     * The parameter type passed in is not allowed
     */
    static InvalidType = new Cause(CauseCode.InvalidType, 'invalid type')
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    static OutOfRange = new Cause(CauseCode.OutOfRange, 'out of range')

    /**
     * The requested resource was not found
     */
    static NotFound = new Cause(CauseCode.NotFound, 'not found')

    /**
     * The requested resource already exists
     */
    static AlreadyExists = new Cause(CauseCode.AlreadyExists, 'already exists')

    /**
     * An invalid parameter was passed in
     */
    static InvalidArgument = new Cause(CauseCode.InvalidArgument, 'out of range')

    /**
     * The requested feature is not implemented in the current version
     */
    static Unimplemented = new Cause(CauseCode.Unimplemented, 'unimplemented')

    /**
     * Missing required authorization
     */
    static PermissionDenied = new Cause(CauseCode.PermissionDenied, 'permission denied')
}

/**
 * Base class for exceptions thrown by this library
 */
export class Exception extends Error {
    /**
     * @internal
     */
    protected readonly __uuid__ = UUID
    /**
     * @internal
     */
    static __classid__ = IdentityException.id
    /**
    * @internal
    */
    static __classname__ = IdentityException.name

    private __classid_: IdentityType
    get classid() {
        return this.__classid_
    }
    private __classname_: string
    get classname() {
        return this.__classname_
    }
    /**
     * 
     * @param message Exception description information
     */
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

        this.__classid_ = new.target.__classid__
        this.__classname_ = new.target.__classname__
        this.name = new.target.name
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

    //     /**
    //  * If true, the error is caused by exceeding the time limit
    //  */
    //      timeout?: boolean
    //      /**
    //       * If true, this is a temporary error and the operation can be retried later
    //       */
    //      temporary?: boolean
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


export type Constructor<T extends Exception> = new (...args: any[]) => T

export function isError<T extends Exception>(v: any, t: Constructor<T>): v is T {
    const target = (t as any).__classid__
    const ty = typeof target
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return false
    }

    if (typeof v !== "object") {
        return false
    }
    const o: any = v
    if (o.__uuid__ !== UUID) {
        return false
    }
    return o.classid === target
}

export function asError<T extends Exception>(v: any, t: Constructor<T>): T | undefined {
    const target = (t as any).__classid__
    const ty = typeof target
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return
    }
    while (typeof v === "object") {
        const o: any = v
        if (o.__uuid__ !== UUID) {
            return
        }
        if (o.__classid_ === target) {
            return o
        }

        if (typeof o.unwrap === "function") {
            v = o.unwrap()
        } else {
            break
        }
    }
}