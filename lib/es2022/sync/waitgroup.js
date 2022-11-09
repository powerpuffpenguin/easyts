"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitGroup = void 0;
const async_1 = require("../core/async");
const exception_1 = require("../core/exception");
/**
 * A WaitGroup waits for a collection of async process to finish.
 *
 * @remarks
 * The main process calls Add to set the number of async process to wait for. Then each of the async process runs and calls done when finished. At the same time, wait can be used to block until all async process have finished.
 *
 * @sealed
 */
class WaitGroup {
    /**
     * Record how many async awaits are in progress
     */
    counter_ = 0;
    get counter() {
        return this.counter_;
    }
    /**
     * Signals are used to notify waiting for a function to return
     */
    c_;
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait() {
        if (this.counter_ == 0) {
            return undefined;
        }
        let c = this.c_;
        if (c) {
            return c.promise;
        }
        c = new async_1.Completer();
        this.c_ = c;
        return c.promise;
    }
    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws WaitGroupException.
     * @param delta WaitGroup.counter += delta
     *
     * @throws {@link WaitGroupException}
     */
    add(delta) {
        if (delta === 0) {
            return;
        }
        let v = Math.floor(delta);
        if (!isFinite(v) || v != delta) {
            throw new exception_1.Exception(`delta must be a integer: ${delta}`);
        }
        v += this.counter_;
        if (v === 0) {
            this.counter_ = v;
            const c = this.c_;
            if (c) {
                this.c_ = undefined;
                c.resolve();
            }
        }
        else if (v < 0) {
            throw new exception_1.Exception(`negative WaitGroup counter: ${v}`);
        }
        else if (!isFinite(v)) {
            throw new exception_1.Exception(`invalid WaitGroup counter: ${v}`);
        }
        else {
            this.counter_ = v;
        }
    }
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws {@link WaitGroupException}
     */
    done() {
        this.add(-1);
    }
    /**
     * Execute function f after counter++, and execute counter-- after function f is done
     * @param f function to execute
     * @param oncompleted function to execute when f is done
     * @returns If a promise is returned, the function f is completed after the promise is executed, otherwise the function f is already completed
     */
    do(f, oncompleted) {
        this.add(1);
        let result;
        try {
            result = f();
        }
        finally {
            if (result === undefined || result === null) {
                this.add(-1);
                if (oncompleted) {
                    oncompleted();
                }
            }
            else {
                this._do(result);
            }
        }
    }
    async _do(result, oncompleted) {
        try {
            await result;
        }
        finally {
            this.add(-1);
            if (oncompleted) {
                oncompleted();
            }
        }
    }
}
exports.WaitGroup = WaitGroup;
//# sourceMappingURL=waitgroup.js.map