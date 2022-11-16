"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nopCallback = exports.neverPromise = exports.noResult = void 0;
class _NoResult {
    constructor() {
        this.done = true;
        this.value = undefined;
    }
}
/**
 * Explicitly means no value
 */
exports.noResult = new _NoResult();
/**
 * An Promise that will never finish
 */
exports.neverPromise = new Promise(() => { });
/**
 * This function does nothing and can usually be used as the default handler for something
 */
function nopCallback() { }
exports.nopCallback = nopCallback;
//# sourceMappingURL=values.js.map