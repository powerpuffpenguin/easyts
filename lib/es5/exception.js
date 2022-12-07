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
exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
var Exception = /** @class */ (function (_super) {
    __extends(Exception, _super);
    function Exception(message, opts) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message, opts) || this;
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
        _this.name = _newTarget.name;
        return _this;
    }
    return Exception;
}(Error));
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map