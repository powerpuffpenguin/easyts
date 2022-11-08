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
    constructor() {
        this.w_ = new mutex_1.Mutex();
        this.r_ = new waitgroup_1.WaitGroup();
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
    _lock() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.RWMutex = RWMutex;
//# sourceMappingURL=rwmutex.js.map