import { Exception } from "../exception";
/**
 * A Locker represents an object that can be locked and unlocked.
 */
export interface Locker {
    tryLock(): boolean;
    lock(): Promise<Locker> | undefined;
    unlock(): void;
}
export declare class MutexException extends Exception {
}
/**
 * a mutual exclusion lock.
 */
export declare class Mutex implements Locker {
    private c_;
    /**
     * try locks.
     * @return if successful locked return true, else return false
     */
    tryLock(): boolean;
    /**
     * locks
     *
     * @remarks
     * if the lock no used, lock and return undefined.
     * If the lock is already in use, return a Promise wait for mutex is available.
     */
    lock(): Promise<Locker> | undefined;
    private _lock;
    /**
     * unlocks
     *
     * @remarks
     * if is not locked on entry to Unlock, throw {@link MutexException}
     *
     * @throws {@link MutexException}
     */
    unlock(): void;
}
