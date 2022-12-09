"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncOnce = exports.Once = void 0;
const async_1 = require("../async");
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
class Once {
    ok_ = false;
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f) {
        if (this.ok_) {
            return false;
        }
        this.ok_ = true;
        f();
        return true;
    }
}
exports.Once = Once;
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
class AsyncOnce {
    ok_ = false;
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f) {
        if (this.ok_) {
            return false;
        }
        return this._do(f);
    }
    done_;
    async _do(f) {
        let done = this.done_;
        if (done) {
            await done.promise;
            return false;
        }
        done = new async_1.Completer();
        this.done_ = done;
        try {
            await f();
            this.ok_ = true;
            done.resolve();
        }
        catch (e) {
            this.ok_ = true;
            done.resolve();
            throw e;
        }
        return true;
    }
}
exports.AsyncOnce = AsyncOnce;
//# sourceMappingURL=once.js.map