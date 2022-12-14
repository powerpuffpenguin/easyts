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
import { Exception } from "../exception";
/**
 * A WaitGroup waits for a collection of async process to finish.
 *
 * @remarks
 * The main process calls Add to set the number of async process to wait for. Then each of the async process runs and calls done when finished. At the same time, wait can be used to block until all async process have finished.
 *
 * @sealed
 */
export class WaitGroup {
    constructor() {
        /**
         * Record how many async awaits are in progress
         */
        this.counter_ = 0;
    }
    get counter() {
        return this.counter_;
    }
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait() {
        if (this.counter_ == 0) {
            return;
        }
        let c = this.c_;
        if (c) {
            return c.promise;
        }
        c = new Completer();
        this.c_ = c;
        return c.promise;
    }
    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws Exception.
     * @param delta WaitGroup.counter += delta
     *
     * @throws Exception
     */
    add(delta) {
        if (delta === 0) {
            return;
        }
        let v = Math.floor(delta);
        if (!Number.isSafeInteger(v)) {
            throw new Exception(`delta must be a integer: ${delta}`);
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
            throw new Exception(`negative WaitGroup counter: ${v}`);
        }
        else if (!isFinite(v)) {
            throw new Exception(`invalid WaitGroup counter: ${v}`);
        }
        else {
            this.counter_ = v;
        }
    }
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws Exception
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
    _do(result, oncompleted) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield result;
            }
            finally {
                this.add(-1);
                if (oncompleted) {
                    oncompleted();
                }
            }
        });
    }
}
//# sourceMappingURL=waitgroup.js.map