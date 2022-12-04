import { ReadChannel } from "./core/channel";
import { Exception } from "./core/exception";
/**
 * errCanceled is the error returned by context.err() when the context is canceled.
 */
export declare const errCanceled: Exception;
declare class DeadlineExceeded extends Exception {
    constructor();
    timeout(): boolean;
    temporary(): boolean;
}
export declare type Constructor<T> = new (...args: any[]) => T;
/**
 * errDeadlineExceeded is the error returned by context.err() when the context's deadline passes.
 */
export declare const errDeadlineExceeded: DeadlineExceeded;
/**
 * A Context carries a deadline, a cancellation signal, and other values across API boundaries.
 */
export interface Context {
    /**
     * returns the time when work done on behalf of this context should be canceled. returns undefined when no deadline is set. Successive calls to Deadline return the same results.
     *
     */
    readonly deadline: Date | undefined;
    /**
     * returns a channel that's closed when work done on behalf of this context should be canceled. Successive calls to Done return the same value.
     */
    readonly done: ReadChannel<void>;
    /**
     * If done is not yet closed,err is undefined. If done is closed, err is a non-nil error explaining why
     */
    readonly err: Exception | undefined;
    /**
     * If done is not yet closed, isClosed is false. If done is closed, isClosed is true
     */
    readonly isClosed: boolean;
    /**
     * return a Promise wait done closed
     */
    wait(): Promise<void> | undefined;
    /**
     * Promise returns true after waiting for the number of milliseconds specified by ms, if done before then Promise returns false immediately
     */
    sleep(ms: number): Promise<boolean>;
    /**
     * get() returns the value associated with this context for key or {done:true} if no value is associated with key. Successive calls to get() with  the same key returns the same result.
     */
    get<T>(key: Constructor<T>): IteratorResult<any>;
    /**
     * returns a copy of parent in which the value associated with key is val.
     */
    withValue<T>(key: Constructor<T>, val: any): Context;
    /**
     * returns a copy of this with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
     */
    withCancel(): CancelContext;
    /**
     * returns withDeadline(now + millisecond).
     */
    withTimeout(ms: number): CancelContext;
    /**
     * returns a copy of the this context with the deadline adjusted  to be no later than d. If the this's deadline is already earlier than d, withDeadline(d) is semantically equivalent to this. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the this context's Done channel is closed, whichever happens first.
     */
    withDeadline(d: Date): CancelContext;
}
export interface CancelContext extends Context {
    /**
     * Canceling this context releases resources associated with it, so code should call cancel as soon as the operations running in this Context complete.
     */
    cancel(reason?: any): void;
}
/**
 * returns a non-nil, empty Context.
 *
 * @remarks
 * It is never canceled, has no values, and has no deadline. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming
 */
export declare function background(): Context;
/**
 * TODO returns a non-nil, empty Context.
 *
 * @remarks
 * Code should use context.TODO when it's unclear which Context to use or it is not yet available (because the  surrounding function has not yet been extended to accept a Context parameter).
 */
export declare function todo(): Context;
/**
 * returns a copy of parent in which the value associated with key is val.
 */
export declare function withValue<T>(parent: Context, key: Constructor<T>, val: any): Context;
/**
 * returns a copy of parent with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
 */
export declare function withCancel<T>(parent: Context): CancelContext;
/**
 * returns a copy of the parent context with the deadline adjusted  to be no later than d. If the parent's deadline is already earlier than d, withDeadline(parent, d) is semantically equivalent to parent. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the parent context's Done channel is closed, whichever happens first.
 */
export declare function withDeadline(parent: Context, d: Date): CancelContext;
/**
 * returns withDeadline(parent, now + millisecond).
 */
export declare function withTimeout(parent: Context, ms: number): CancelContext;
export {};
