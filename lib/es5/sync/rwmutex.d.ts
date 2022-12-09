import { Locker } from './mutex';
export interface RWLocker extends Locker {
    tryReadLock(): boolean;
    readLock(): Promise<RWLocker> | undefined;
    readUnlock(): void;
}
/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
export declare class RWMutex implements RWLocker {
    private c_;
    private w_;
    private r_;
    constructor();
    tryLock(): boolean;
    lock(): undefined | Promise<Locker>;
    _lock(): Promise<Locker>;
    unlock(): void;
    tryReadLock(): boolean;
    readLock(): undefined | Promise<RWLocker>;
    _readLock(): Promise<RWLocker>;
    readUnlock(): void;
}
