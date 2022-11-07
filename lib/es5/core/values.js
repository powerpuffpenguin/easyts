"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neverPromise = exports.noResult = void 0;
var _NoResult = /** @class */ (function () {
    function _NoResult() {
        this.done = true;
        this.value = undefined;
    }
    return _NoResult;
}());
/**
 * Explicitly means no value
 */
exports.noResult = new _NoResult();
/**
 * An Promise that will never finish
 */
exports.neverPromise = new Promise(function () { });
//# sourceMappingURL=values.js.map