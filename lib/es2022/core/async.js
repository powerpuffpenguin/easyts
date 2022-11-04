"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
class Completer {
    promise_;
    resolve_;
    reject_;
    constructor() {
        this.promise_ = new Promise((resolve, reject) => {
            this.resolve_ = resolve;
            this.reject_ = reject;
        });
    }
    get promise() {
        return this.promise_;
    }
    resolve(value) {
        if (this.resolve_) {
            this.resolve_(value);
        }
    }
    reject(reason) {
        if (this.reject_) {
            this.reject_(reason);
        }
    }
}
exports.Completer = Completer;
//# sourceMappingURL=async.js.map