import { VoidCallback, AsyncVoidCallback } from "../types";
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
export declare class Once {
    private ok_;
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f: VoidCallback): boolean;
}
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
export declare class AsyncOnce {
    private ok_;
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f: AsyncVoidCallback): false | Promise<boolean>;
    private done_?;
    private _do;
}
