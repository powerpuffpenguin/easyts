var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Completer } from '../async';
import { MutexException } from './mutex';
/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
export class RWMutex {
    constructor() {
        this.w_ = false;
        this.r_ = 0;
    }
    tryLock() {
        if (this.c_) {
            return false;
        }
        this.w_ = true;
        this.c_ = new Completer();
        return true;
    }
    lock() {
        if (this.tryLock()) {
            return;
        }
        return this._lock();
    }
    _lock() {
        return __awaiter(this, void 0, void 0, function* () {
            let c;
            while (true) {
                c = this.c_;
                if (c) {
                    yield c.promise;
                    continue;
                }
                this.w_ = true;
                this.c_ = new Completer();
                break;
            }
            return this;
        });
    }
    unlock() {
        if (!this.w_) {
            throw new MutexException('unlock of unlocked mutex');
        }
        this.w_ = false;
        const c = this.c_;
        this.c_ = undefined;
        c.resolve();
    }
    tryReadLock() {
        if (this.r_ != 0) {
            this.r_++;
            return true;
        }
        else if (this.w_) {
            return false;
        }
        this.r_ = 1;
        this.c_ = new Completer();
        return true;
    }
    readLock() {
        if (this.tryReadLock()) {
            return;
        }
        return this._readLock();
    }
    _readLock() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (this.w_) {
                    yield this.c_.promise;
                    continue;
                }
                if (this.c_) {
                    this.r_++;
                }
                else {
                    this.r_ = 1;
                    this.c_ = new Completer();
                }
                break;
            }
            return this;
        });
    }
    readUnlock() {
        switch (this.r_) {
            case 0:
                throw new MutexException('readUnlock of unrlocked rwmutex');
            case 1:
                this.r_ = 0;
                const c = this.c_;
                this.c_ = undefined;
                c.resolve();
                break;
            default:
                this.r_--;
                break;
        }
    }
}
//# sourceMappingURL=rwmutex.js.map