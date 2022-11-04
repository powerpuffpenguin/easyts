"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
var Exception = /** @class */ (function () {
    function Exception(message) {
        this.message = message;
    }
    Exception.prototype.error = function () {
        return this.message;
    };
    return Exception;
}());
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map