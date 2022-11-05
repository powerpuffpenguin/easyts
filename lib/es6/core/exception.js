"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
/**
 * Base class for exceptions thrown by this library
 */
class Exception {
    /**
     *
     * @param message Exception description information
     */
    constructor(message) {
        this.message = message;
    }
    /**
     *
     * @returns Returns the string description of the exception
     * @virtual
     */
    error() {
        return this.message;
    }
}
exports.Exception = Exception;
//# sourceMappingURL=exception.js.map