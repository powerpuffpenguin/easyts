import { Exception } from "../core/exception";
export declare class WaitGroupException extends Exception {
    constructor(msg: string);
}
/**
 * A WaitGroup waits for a collection of async process to finish.
 *
 * @remarks
 * The main process calls Add to set the number of async process to wait for. Then each of the async process runs and calls done when finished. At the same time, wait can be used to block until all async process have finished.
 *
 * @sealed
 */
export declare class WaitGroup {
    /**
     * Record how many async awaits are in progress
     */
    private counter_;
    /**
     * Signals are used to notify waiting for a function to return
     */
    private c_;
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait(): Promise<void> | undefined;
    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws WaitException.
     * @param delta WaitGroup.counter += delta
     *
     * @throws {@link WaitException}
     */
    add(delta: number): void;
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws {@link WaitException}
     */
    done(): void;
}
