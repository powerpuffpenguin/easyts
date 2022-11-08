/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
export declare class RWMutex {
    private w_;
    private r_;
    constructor();
    tryLock(): boolean;
    lock(): undefined | Promise<void>;
    _lock(): Promise<void>;
}
