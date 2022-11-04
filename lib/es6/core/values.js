"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neverPromise = exports.noResult = void 0;
class _NoResult {
    constructor() {
        this.done = true;
        this.value = undefined;
    }
}
exports.noResult = new _NoResult();
exports.neverPromise = new Promise(() => { });
//# sourceMappingURL=values.js.map