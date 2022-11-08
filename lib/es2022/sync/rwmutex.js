"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWMutex = void 0;
const mutex_1 = require("./mutex");
const waitgroup_1 = require("./waitgroup");
/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
class RWMutex {
    w_ = new mutex_1.Mutex();
    r_ = new waitgroup_1.WaitGroup();
    constructor() {
    }
    tryLock() {
        const r = this.r_;
        if (r.counter != 0) {
            return false;
        }
        const w = this.w_;
        if (w.tryLock()) {
            return true;
        }
        return false;
    }
    lock() {
        if (this.tryLock()) {
            return;
        }
        return this._lock();
    }
    async _lock() {
    }
}
exports.RWMutex = RWMutex;
//# sourceMappingURL=rwmutex.js.map