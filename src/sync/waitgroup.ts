import { resolvePromise } from "../core/values";
import { Completer } from '../core/async';
import { Exception } from "../core";

class WaitGroupException extends Exception {
    constructor(msg: string) {
        super(msg)
    }
}
/**
 * A WaitGroup waits for a collection of async process to finish.
 * 
 * @remarks
 * The main process calls Add to set the number of async process to wait for. Then each of the async process runs and calls done when finished. At the same time, wait can be used to block until all async process have finished.
 * 
 * @sealed
 */
export class WaitGroup {
    /**
     * Record how many async awaits are in progress
     */
    private counter_ = 0
    /**
     * Signals are used to notify waiting for a function to return
     */
    private c_: Completer<void> | undefined
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait(): Promise<void> | undefined {
        if (this.counter_ == 0) {
            return resolvePromise
        }
        let c = this.c_
        if (c) {
            return c.promise
        }
        c = new Completer<void>()
        this.c_ = c
        return c.promise
    }

    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws WaitException.
     * @param delta WaitGroup.counter += delta
     * 
     * @throws {@link WaitException}
     */
    add(delta: number) {
        if (delta === 0) {
            return
        }
        let v = Math.floor(delta)
        if (!isFinite(v) || v != delta) {
            throw new WaitGroupException(`delta must be a integer: ${delta}`)
        }
        v += this.counter_
        if (v === 0) {
            this.counter_ = v
            const c = this.c_
            if (c) {
                this.c_ = undefined
                c.resolve()
            }
        } else if (v < 0) {
            throw new WaitGroupException(`negative WaitGroup counter: ${v}`)
        } else if (!isFinite(v)) {
            throw new WaitGroupException(`invalid WaitGroup counter: ${v}`)
        } else {
            this.counter_ = v
        }
    }
    /**
     * Done decrements the WaitGroup counter by one.
     */
    done() {
        this.add(-1)
    }
}