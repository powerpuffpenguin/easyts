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
exports.errOutOfRange = exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
var Exception = /** @class */ (function () {
    /**
     *
     * @param message Exception description information
     */
    function Exception(message) {
        this.native = new Error(message);
    }
    Object.defineProperty(Exception.prototype, "message", {
        get: function () {
            return this.native.message;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Exception.prototype, "stack", {
        get: function () {
            return this.native.stack;
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
    Exception.prototype.toString = function () {
        return this.native.toString();
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
    return Exception;
}());
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
//# sourceMappingURL=exception.js.map