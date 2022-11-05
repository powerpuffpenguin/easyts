"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neverPromise = exports.noResult = void 0;
class _NoResult {
    done = true;
    value = undefined;
}
/**
 * Explicitly means no value
 */
exports.noResult = new _NoResult();
/**
 * An Promise that will never finish
 */
exports.neverPromise = new Promise(() => { });
//# sourceMappingURL=values.js.map