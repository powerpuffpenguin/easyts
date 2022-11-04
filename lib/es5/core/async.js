"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
var Completer = /** @class */ (function () {
    function Completer() {
        var _this = this;
        this.promise_ = new Promise(function (resolve, reject) {
            _this.resolve_ = resolve;
            _this.reject_ = reject;
        });
    }
    Object.defineProperty(Completer.prototype, "promise", {
        get: function () {
            return this.promise_;
        },
        enumerable: false,
        configurable: true
    });
    Completer.prototype.resolve = function (value) {
        if (this.resolve_) {
            this.resolve_(value);
        }
    };
    Completer.prototype.reject = function (reason) {
        if (this.reject_) {
            this.reject_(reason);
        }
    };
    return Completer;
}());
exports.Completer = Completer;
//# sourceMappingURL=async.js.map