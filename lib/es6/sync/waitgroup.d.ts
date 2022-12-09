import { VoidCallback } from '../types';
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
    get counter(): number;
    /**
     * Signals are used to notify waiting for a function to return
     */
    private c_;
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    wait(): Promise<undefined> | undefined;
    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws Exception.
     * @param delta WaitGroup.counter += delta
     *
     * @throws {@link Exception}
     */
    add(delta: number): void;
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws {@link Exception}
     */
    done(): void;
    /**
     * Execute function f after counter++, and execute counter-- after function f is done
     * @param f function to execute
     * @param oncompleted function to execute when f is done
     * @returns If a promise is returned, the function f is completed after the promise is executed, otherwise the function f is already completed
     */
    do(f: () => any, oncompleted?: VoidCallback): void;
    private _do;
}
