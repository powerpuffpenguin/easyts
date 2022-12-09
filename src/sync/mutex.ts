import { Completer } from "../async";
import { Exception } from "../exception";

/**
 * A Locker represents an object that can be locked and unlocked.
 */
export interface Locker {
    tryLock(): boolean
    lock(): Promise<Locker> | undefined
    unlock(): void
}

export class MutexException extends Exception { }
/**
 * a mutual exclusion lock.
 */
export class Mutex implements Locker {
    private c_: Completer<void> | undefined
    /**
     * try locks.
     * @return if successful locked return true, else return false
     */
    tryLock(): boolean {
        if (!this.c_) {
            this.c_ = new Completer<void>()
            return true
        }
        return false
    }
    /**
     * locks
     * 
     * @remarks
     * if the lock no used, lock and return undefined.
     * If the lock is already in use, return a Promise wait for mutex is available.
     */
    lock(): Promise<Locker> | undefined {
        if (this.tryLock()) {
            return
        }
        return this._lock()
    }
    private async _lock(): Promise<Locker> {
        let c = this.c_
        while (c) {
            await c.promise
            c = this.c_
        }
        this.c_ = new Completer<void>()
        return this
    }
    /**
     * unlocks
     * 
     * @remarks
     * if is not locked on entry to Unlock, throw {@link MutexException}
     * 
     * @throws {@link MutexException}
     */
    unlock(): void {
        const c = this.c_
        if (c) {
            this.c_ = undefined
            c.resolve()
        } else {
            throw new MutexException('unlock of unlocked mutex')
        }
    }
}