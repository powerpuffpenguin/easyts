import { Mutex } from "./mutex";
import { WaitGroup } from "./waitgroup";

/**
 * a reader/writer mutual exclusion lock.
 * 
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
export class RWMutex {
    private w_ = new Mutex()
    private r_ = new WaitGroup()
    constructor() {

    }
    tryLock(): boolean {
        const r = this.r_
        if (r.counter != 0) {
            return false
        }
        const w = this.w_
        if (w.tryLock()) {
            return true
        }
        return false
    }
    lock(): undefined | Promise<void> {
        if (this.tryLock()) {
            return
        }
        return this._lock()
    }
    async _lock() {

    }
}