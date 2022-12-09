var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Completer } from "../async";
import { Exception } from "../exception";
export class MutexException extends Exception {
}
/**
 * a mutual exclusion lock.
 */
export class Mutex {
    /**
     * try locks.
     * @return if successful locked return true, else return false
     */
    tryLock() {
        if (!this.c_) {
            this.c_ = new Completer();
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
    _lock() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = this.c_;
            while (c) {
                yield c.promise;
                c = this.c_;
            }
            this.c_ = new Completer();
            return this;
        });
    }
    /**
     * unlocks
     *
     * @remarks
     * if is not locked on entry to Unlock, throw {@link MutexException}
     *
     * @throws {@link MutexException}
     */
    unlock() {
        const c = this.c_;
        if (c) {
            this.c_ = undefined;
            c.resolve();
        }
        else {
            throw new MutexException('unlock of unlocked mutex');
        }
    }
}
//# sourceMappingURL=mutex.js.map