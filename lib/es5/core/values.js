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
exports.noResult = new _NoResult();
exports.neverPromise = new Promise(function () { });
//# sourceMappingURL=values.js.map