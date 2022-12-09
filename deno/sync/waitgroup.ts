import { VoidCallback } from '../types.ts';
import { Completer } from '../async.ts';
import { Exception } from '../exception.ts';


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
    get counter(): number {
        return this.counter_
    }
    /**
     * Signals are used to notify waiting for a function to return
     */
    private c_: Completer<undefined> | undefined
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait(): Promise<undefined> | undefined {
        if (this.counter_ == 0) {
            return
        }
        let c = this.c_
        if (c) {
            return c.promise
        }
        c = new Completer<undefined>()
        this.c_ = c
        return c.promise
    }

    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws Exception.
     * @param delta WaitGroup.counter += delta
     * 
     * @throws {@link Exception}
     */
    add(delta: number): void {
        if (delta === 0) {
            return
        }
        let v = Math.floor(delta)
        if (!Number.isSafeInteger(v)) {
            throw new Exception(`delta must be a integer: ${delta}`)
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
            throw new Exception(`negative WaitGroup counter: ${v}`)
        } else if (!isFinite(v)) {
            throw new Exception(`invalid WaitGroup counter: ${v}`)
        } else {
            this.counter_ = v
        }
    }
    /**
     * Done decrements the WaitGroup counter by one.
     * 
     * @throws {@link Exception}
     */
    done() {
        this.add(-1)
    }
    /**
     * Execute function f after counter++, and execute counter-- after function f is done
     * @param f function to execute
     * @param oncompleted function to execute when f is done
     * @returns If a promise is returned, the function f is completed after the promise is executed, otherwise the function f is already completed
     */
    do(f: () => any, oncompleted?: VoidCallback): void {
        this.add(1)
        let result: any
        try {
            result = f()
        } finally {
            if (result === undefined || result === null) {
                this.add(-1)
                if (oncompleted) {
                    oncompleted()
                }
            } else {
                this._do(result)
            }
        }
    }
    private async _do(result: any, oncompleted?: VoidCallback) {
        try {
            await result
        } finally {
            this.add(-1)
            if (oncompleted) {
                oncompleted()
            }
        }
    }
}