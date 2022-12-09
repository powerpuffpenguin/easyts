import { Completer } from '../async.ts';
import { MutexException, Locker } from './mutex.ts';

// export const errRWMutexRUnlock = new Exception('runlock of unrlocked rwmutex')

export interface RWLocker extends Locker {
    tryReadLock(): boolean
    readLock(): Promise<RWLocker> | undefined
    readUnlock(): void
}
/**
 * a reader/writer mutual exclusion lock.
 * 
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
export class RWMutex implements RWLocker {
    private c_: Completer<void> | undefined
    private w_ = false
    private r_ = 0
    constructor() { }
    tryLock(): boolean {
        if (this.c_) {
            return false
        }
        this.w_ = true
        this.c_ = new Completer<void>()
        return true
    }
    lock(): undefined | Promise<Locker> {
        if (this.tryLock()) {
            return
        }
        return this._lock()
    }
    async _lock(): Promise<Locker> {
        let c: Completer<void> | undefined
        while (true) {
            c = this.c_
            if (c) {
                await c.promise
                continue
            }
            this.w_ = true
            this.c_ = new Completer<void>()
            break
        }
        return this
    }
    unlock() {
        if (!this.w_) {
            throw new MutexException('unlock of unlocked mutex')
        }
        this.w_ = false
        const c = this.c_
        this.c_ = undefined
        c!.resolve()
    }

    tryReadLock(): boolean {
        if (this.r_ != 0) {
            this.r_++
            return true
        } else if (this.w_) {
            return false
        }
        this.r_ = 1
        this.c_ = new Completer<void>()
        return true
    }
    readLock(): undefined | Promise<RWLocker> {
        if (this.tryReadLock()) {
            return
        }
        return this._readLock()
    }
    async _readLock(): Promise<RWLocker> {
        while (true) {
            if (this.w_) {
                await this.c_!.promise
                continue
            }
            if (this.c_) {
                this.r_++
            } else {
                this.r_ = 1
                this.c_ = new Completer<void>()
            }
            break
        }
        return this
    }
    readUnlock() {
        switch (this.r_) {
            case 0:
                throw new MutexException('readUnlock of unrlocked rwmutex')
            case 1:
                this.r_ = 0
                const c = this.c_
                this.c_ = undefined
                c!.resolve()
                break
            default:
                this.r_--
                break
        }
    }
}