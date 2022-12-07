"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = exports.asError = exports.errOutOfRange = exports.Exception = exports.Cause = exports.CauseCode = void 0;
const identity_1 = require("./internal/identity");
const classid_1 = require("./classid");
var CauseCode;
(function (CauseCode) {
    CauseCode[CauseCode["Uknow"] = 0] = "Uknow";
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    CauseCode[CauseCode["Aborted"] = 1] = "Aborted";
    /**
     * An internal system error has occurred, this system may not function properly, but it does not affect other systems, but it is recommended to exit the program
     */
    CauseCode[CauseCode["Internal"] = 2] = "Internal";
    /**
     * The requested resource was not found
     */
    CauseCode[CauseCode["NotFound"] = 10] = "NotFound";
    /**
     * The requested resource already exists
     */
    CauseCode[CauseCode["AlreadyExists"] = 11] = "AlreadyExists";
    /**
     * An invalid parameter was passed in
     */
    CauseCode[CauseCode["InvalidArgument"] = 50] = "InvalidArgument";
    /**
     * The parameter type passed in is not allowed
     */
    CauseCode[CauseCode["InvalidType"] = 51] = "InvalidType";
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    CauseCode[CauseCode["OutOfRange"] = 52] = "OutOfRange";
    /**
     * The requested feature is not implemented in the current version
     */
    CauseCode[CauseCode["Unimplemented"] = 100] = "Unimplemented";
    /**
     * Missing required authorization
     */
    CauseCode[CauseCode["PermissionDenied"] = 101] = "PermissionDenied";
})(CauseCode = exports.CauseCode || (exports.CauseCode = {}));
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
class Cause {
    message;
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
    code;
    /**
     *
     * @param code Error code, as the only indicator that the program can accurately identify the error
     * @param message A descriptive string for human viewing
     */
    constructor(code, message) {
        this.message = message;
        this.code = code;
    }
    toString() {
        return JSON.stringify({
            code: this.code,
            message: this.message,
        });
    }
    static getCode(v) {
        if (typeof v === "object") {
            const code = v['code'];
            if (Number.isSafeInteger(code)) {
                return code;
            }
        }
        return;
    }
    /**
     * unknown error
     */
    static Uknow = new Cause(CauseCode.Uknow, 'unknow');
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    static Aborted = new Cause(CauseCode.Aborted, 'aborted');
    /**
     * The parameter type passed in is not allowed
     */
    static InvalidType = new Cause(CauseCode.InvalidType, 'invalid type');
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    static OutOfRange = new Cause(CauseCode.OutOfRange, 'out of range');
    /**
     * The requested resource was not found
     */
    static NotFound = new Cause(CauseCode.NotFound, 'not found');
    /**
     * The requested resource already exists
     */
    static AlreadyExists = new Cause(CauseCode.AlreadyExists, 'already exists');
    /**
     * An invalid parameter was passed in
     */
    static InvalidArgument = new Cause(CauseCode.InvalidArgument, 'out of range');
    /**
     * The requested feature is not implemented in the current version
     */
    static Unimplemented = new Cause(CauseCode.Unimplemented, 'unimplemented');
    /**
     * Missing required authorization
     */
    static PermissionDenied = new Cause(CauseCode.PermissionDenied, 'permission denied');
}
exports.Cause = Cause;
/**
 * Base class for exceptions thrown by this library
 */
class Exception extends Error {
    /**
     * @internal
     */
    __uuid__ = classid_1.UUID;
    static __classid__ = identity_1.IdentityException.id;
    static __classname__ = identity_1.IdentityException.name;
    get classid() {
        return identity_1.IdentityException.id;
    }
    get classname() {
        return identity_1.IdentityException.name;
    }
    /**
     *
     * @param message Exception description information
     */
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
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error() {
        return this.message;
    }
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    as(target) {
        if (this instanceof target) {
            return this;
        }
        let err = this.unwrap();
        while (err) {
            if (err instanceof target) {
                return err;
            }
            err = err.unwrap();
        }
        return;
    }
    is(target) {
        if (this === target) {
            return true;
        }
        let err = this.unwrap();
        while (err) {
            if (err === target) {
                return true;
            }
            err = err.unwrap();
        }
        return false;
    }
    /**
     * Returns the wrapped exception if the current exception wraps another exception, otherwise returns undefined
     * @virtual
     */
    unwrap() {
        return;
    }
    /**
     * wrap the exception e into a new exception
     */
    static wrap(e, msg) {
        return new Wrap(e, msg);
    }
    timeout() {
        return false;
    }
    temporary() {
        return false;
    }
}
exports.Exception = Exception;
class Wrap extends Exception {
    e;
    constructor(e, msg) {
        super(msg);
        this.e = e;
    }
    unwrap() {
        return this.e;
    }
}
exports.errOutOfRange = new Exception('out of range');
function asError(e, error) {
    const is = error.isError;
    if (typeof is === "function") {
        while (e instanceof Error) {
            if (is(e)) {
                return e;
            }
            const unwrap = e.unwrap;
            if (typeof unwrap === "function") {
                e = unwrap(e);
            }
        }
    }
}
exports.asError = asError;
function isError(e, error) {
    const is = error.isError;
    if (typeof is === "function") {
        while (e instanceof Error) {
            if (is(e)) {
                return true;
            }
            const unwrap = e.unwrap;
            if (typeof unwrap === "function") {
                e = unwrap(e);
            }
        }
    }
    return false;
}
exports.isError = isError;
//# sourceMappingURL=exception.js.map