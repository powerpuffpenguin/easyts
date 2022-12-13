"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyObject = exports.nopCallback = exports.neverPromise = exports.noResult = void 0;
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
/**
 * This function does nothing and can usually be used as the default handler for something
 */
function nopCallback() { }
exports.nopCallback = nopCallback;
exports.emptyObject = {};
//# sourceMappingURL=values.js.map