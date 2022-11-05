"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
var Exception = /** @class */ (function () {
    /**
     *
     * @param message Exception description information
     */
    function Exception(message) {
        this.message = message;
    }
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    Exception.prototype.error = function () {
        return this.message;
    };
    return Exception;
}());
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map