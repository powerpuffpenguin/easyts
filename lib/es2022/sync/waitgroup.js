"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitGroup = exports.WaitGroupException = void 0;
const async_1 = require("../core/async");
const exception_1 = require("../core/exception");
class WaitGroupException extends exception_1.Exception {
    constructor(msg) {
        super(msg);
    }
}
exports.WaitGroupException = WaitGroupException;
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
     * If the counter goes negative, Add throws WaitException.
     * @param delta WaitGroup.counter += delta
     *
     * @throws {@link WaitException}
     */
    add(delta) {
        if (delta === 0) {
            return;
        }
        let v = Math.floor(delta);
        if (!isFinite(v) || v != delta) {
            throw new WaitGroupException(`delta must be a integer: ${delta}`);
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
            throw new WaitGroupException(`negative WaitGroup counter: ${v}`);
        }
        else if (!isFinite(v)) {
            throw new WaitGroupException(`invalid WaitGroup counter: ${v}`);
        }
        else {
            this.counter_ = v;
        }
    }
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws {@link WaitException}
     */
    done() {
        this.add(-1);
    }
}
exports.WaitGroup = WaitGroup;
//# sourceMappingURL=waitgroup.js.map