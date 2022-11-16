"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWMutex = exports.errRWMutexRUnlock = void 0;
const completer_1 = require("../core/completer");
const mutex_1 = require("./mutex");
const exception_1 = require("../core/exception");
exports.errRWMutexRUnlock = new exception_1.Exception('runlock of unrlocked rwmutex');
/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
class RWMutex {
    constructor() {
        this.w_ = false;
        this.r_ = 0;
    }
    tryLock() {
        if (this.c_) {
            return false;
        }
        this.w_ = true;
        this.c_ = new completer_1.Completer();
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
                this.c_ = new completer_1.Completer();
                break;
            }
            return this;
        });
    }
    unlock() {
        if (!this.w_) {
            throw mutex_1.errMutexUnlock;
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
        this.c_ = new completer_1.Completer();
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
                    this.c_ = new completer_1.Completer();
                }
                break;
            }
            return this;
        });
    }
    readUnlock() {
        switch (this.r_) {
            case 0:
                throw exports.errRWMutexRUnlock;
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
exports.RWMutex = RWMutex;
//# sourceMappingURL=rwmutex.js.map