import { Exception } from "../core/exception";
export declare class MutexException extends Exception {
    constructor(msg: string);
}
export interface Locker {
    tryLock(): boolean;
    lock(): Promise<void> | undefined;
    unlock(): void;
}
export declare const errMutexUnlock: MutexException;
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
    lock(): Promise<void> | undefined;
    private _lock;
    /**
     * unlocks
     *
     * @remarks
     * if is not locked on entry to Unlock, throw {@link errMutexUnlock}
     *
     * @throws {@link errMutexUnlock}
     */
    unlock(): void;
}
