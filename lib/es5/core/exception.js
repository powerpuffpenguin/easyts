"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.asError = exports.isError = exports.errOutOfRange = exports.Exception = exports.Cause = exports.CauseCode = exports.UUID = void 0;
var identity_1 = require("./internal/identity");
exports.UUID = '591e8619-07d8-4d0d-89ac-b1b9a265afa3';
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
var Cause = /** @class */ (function () {
    /**
     *
     * @param code Error code, as the only indicator that the program can accurately identify the error
     * @param message A descriptive string for human viewing
     */
    function Cause(code, message) {
        this.message = message;
        this.code = code;
    }
    Cause.prototype.toString = function () {
        return JSON.stringify({
            code: this.code,
            message: this.message,
        });
    };
    Cause.getCode = function (v) {
        if (typeof v === "object") {
            var code = v['code'];
            if (Number.isSafeInteger(code)) {
                return code;
            }
        }
        return;
    };
    /**
     * unknown error
     */
    Cause.Uknow = new Cause(CauseCode.Uknow, 'unknow');
    /**
     * An irreparable error has occurred, the program should exit immediately
     */
    Cause.Aborted = new Cause(CauseCode.Aborted, 'aborted');
    /**
     * The parameter type passed in is not allowed
     */
    Cause.InvalidType = new Cause(CauseCode.InvalidType, 'invalid type');
    /**
     * The requested range is out of bounds, e.g. array index < 0 or >=length
     */
    Cause.OutOfRange = new Cause(CauseCode.OutOfRange, 'out of range');
    /**
     * The requested resource was not found
     */
    Cause.NotFound = new Cause(CauseCode.NotFound, 'not found');
    /**
     * The requested resource already exists
     */
    Cause.AlreadyExists = new Cause(CauseCode.AlreadyExists, 'already exists');
    /**
     * An invalid parameter was passed in
     */
    Cause.InvalidArgument = new Cause(CauseCode.InvalidArgument, 'out of range');
    /**
     * The requested feature is not implemented in the current version
     */
    Cause.Unimplemented = new Cause(CauseCode.Unimplemented, 'unimplemented');
    /**
     * Missing required authorization
     */
    Cause.PermissionDenied = new Cause(CauseCode.PermissionDenied, 'permission denied');
    return Cause;
}());
exports.Cause = Cause;
/**
 * Base class for exceptions thrown by this library
 */
var Exception = /** @class */ (function (_super) {
    __extends(Exception, _super);
    /**
     *
     * @param message Exception description information
     */
    function Exception(message, opts) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message, opts) || this;
        /**
         * @internal
         */
        _this.__uuid__ = exports.UUID;
        if ((opts === null || opts === void 0 ? void 0 : opts.cause) !== undefined) {
            _this.cause = opts.cause;
        }
        // restore prototype chain   
        var proto = _newTarget.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(_this, proto);
        }
        else {
            _this.__proto__ = proto;
        }
        _this.__classid_ = _newTarget.__classid__;
        _this.__classname_ = _newTarget.__classname__;
        _this.name = _newTarget.name;
        return _this;
    }
    Object.defineProperty(Exception.prototype, "classid", {
        get: function () {
            return this.__classid_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Exception.prototype, "classname", {
        get: function () {
            return this.__classname_;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    Exception.prototype.error = function () {
        return this.message;
    };
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    Exception.prototype.as = function (target) {
        if (this instanceof target) {
            return this;
        }
        var err = this.unwrap();
        while (err) {
            if (err instanceof target) {
                return err;
            }
            err = err.unwrap();
        }
        return;
    };
    Exception.prototype.is = function (target) {
        if (this === target) {
            return true;
        }
        var err = this.unwrap();
        while (err) {
            if (err === target) {
                return true;
            }
            err = err.unwrap();
        }
        return false;
    };
    /**
     * Returns the wrapped exception if the current exception wraps another exception, otherwise returns undefined
     * @virtual
     */
    Exception.prototype.unwrap = function () {
        return;
    };
    /**
     * wrap the exception e into a new exception
     */
    Exception.wrap = function (e, msg) {
        return new Wrap(e, msg);
    };
    Exception.prototype.timeout = function () {
        return false;
    };
    Exception.prototype.temporary = function () {
        return false;
    };
    /**
     * @internal
     */
    Exception.__classid__ = identity_1.IdentityException.id;
    /**
    * @internal
    */
    Exception.__classname__ = identity_1.IdentityException.name;
    return Exception;
}(Error));
exports.Exception = Exception;
var Wrap = /** @class */ (function (_super) {
    __extends(Wrap, _super);
    function Wrap(e, msg) {
        var _this = _super.call(this, msg) || this;
        _this.e = e;
        return _this;
    }
    Wrap.prototype.unwrap = function () {
        return this.e;
    };
    return Wrap;
}(Exception));
exports.errOutOfRange = new Exception('out of range');
function isError(v, t) {
    var target = t.__classid__;
    var ty = typeof target;
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return false;
    }
    if (typeof v !== "object") {
        return false;
    }
    var o = v;
    if (o.__uuid__ !== exports.UUID) {
        return false;
    }
    return o.classid === target;
}
exports.isError = isError;
function asError(v, t) {
    var target = t.__classid__;
    var ty = typeof target;
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return;
    }
    while (typeof v === "object") {
        var o = v;
        if (o.__uuid__ !== exports.UUID) {
            return;
        }
        if (o.__classid_ === target) {
            return o;
        }
        if (typeof o.unwrap === "function") {
            v = o.unwrap();
        }
        else {
            break;
        }
    }
}
exports.asError = asError;
//# sourceMappingURL=exception.js.map