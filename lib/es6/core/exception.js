"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
class Exception {
    constructor(message) {
        this.message = message;
    }
    error() {
        return this.message;
    }
}
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map