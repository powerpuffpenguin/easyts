"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = exports.errMutexUnlock = exports.MutexException = void 0;
const async_1 = require("../core/async");
const exception_1 = require("../core/exception");
class MutexException extends exception_1.Exception {
    constructor(msg) {
        super(msg);
    }
}
exports.MutexException = MutexException;
exports.errMutexUnlock = new MutexException('unlock of unlocked mutex');
/**
 * a mutual exclusion lock.
 */
class Mutex {
    c_;
    /**
     * try locks.
     * @return if successful locked return true, else return false
     */
    tryLock() {
        if (!this.c_) {
            this.c_ = new async_1.Completer();
            return true;
        }
        return false;
    }
    /**
     * locks
     *
     * @remarks
     * if the lock no used, lock and return undefined.
     * If the lock is already in use, return a Promise wait for mutex is available.
     */
    lock() {
        if (this.tryLock()) {
            return;
        }
        return this._lock();
    }
    async _lock() {
        let c = this.c_;
        while (c) {
            await c.promise;
            c = this.c_;
        }
        this.c_ = new async_1.Completer();
    }
    /**
     * unlocks
     *
     * @remarks
     * if is not locked on entry to Unlock, throw {@link errMutexUnlock}
     *
     * @throws {@link errMutexUnlock}
     */
    unlock() {
        const c = this.c_;
        if (c) {
            this.c_ = undefined;
            c.resolve();
        }
        else {
            throw exports.errMutexUnlock;
        }
    }
}
exports.Mutex = Mutex;
//# sourceMappingURL=mutex.js.map