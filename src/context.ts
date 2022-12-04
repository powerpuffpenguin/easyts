import { noResult, neverPromise } from "./core/values";
import { Chan, ReadChannel, selectChan } from "./core/channel";
import { Exception } from "./core/exception";
/**
 * errCanceled is the error returned by context.err() when the context is canceled.
 */
export const errCanceled = new Exception('context canceled')

class DeadlineExceeded extends Exception {
    constructor() { super('context deadline exceeded') }
    timeout(): boolean { return true }
    temporary(): boolean { return true }
}
export type Constructor<T> = new (...args: any[]) => T

/**
 * errDeadlineExceeded is the error returned by context.err() when the context's deadline passes.
 */
export const errDeadlineExceeded = new DeadlineExceeded()
/**
 * A Context carries a deadline, a cancellation signal, and other values across API boundaries.
 */
export interface Context {
    /**
     * returns the time when work done on behalf of this context should be canceled. returns undefined when no deadline is set. Successive calls to Deadline return the same results.
     * 
     */
    readonly deadline: Date | undefined
    /**
     * returns a channel that's closed when work done on behalf of this context should be canceled. Successive calls to Done return the same value.
     */
    readonly done: ReadChannel<void>
    /**
     * If done is not yet closed,err is undefined. If done is closed, err is a non-nil error explaining why
     */
    readonly err: Exception | undefined
    /**
     * If done is not yet closed, isClosed is false. If done is closed, isClosed is true
     */
    readonly isClosed: boolean
    /**
     * return a Promise wait done closed
     */
    wait(): Promise<void> | undefined

    /**
     * Promise returns true after waiting for the number of milliseconds specified by ms, if done before then Promise returns false immediately
     */
    sleep(ms: number): Promise<boolean>
    /**
     * get() returns the value associated with this context for key or {done:true} if no value is associated with key. Successive calls to get() with  the same key returns the same result.
     */
    get<T>(key: Constructor<T>): IteratorResult<any>
    /**
     * returns a copy of parent in which the value associated with key is val.
     */
    withValue<T>(key: Constructor<T>, val: any): Context
    /**
     * returns a copy of this with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
     */
    withCancel(): CancelContext
    /**
     * returns withDeadline(now + millisecond).
     */
    withTimeout(ms: number): CancelContext
    /**
     * returns a copy of the this context with the deadline adjusted  to be no later than d. If the this's deadline is already earlier than d, withDeadline(d) is semantically equivalent to this. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the this context's Done channel is closed, whichever happens first.
     */
    withDeadline(d: Date): CancelContext

}

export interface CancelContext extends Context {
    /**
     * Canceling this context releases resources associated with it, so code should call cancel as soon as the operations running in this Context complete.
     */
    cancel(reason?: any): void
}
class EmptyCtx implements Context {
    static background = new EmptyCtx()
    static todo = new EmptyCtx()
    private constructor() { }
    get deadline(): Date | undefined {
        return undefined
    }
    get done(): ReadChannel<void> {
        return Chan.never
    }
    get err(): Exception | undefined {
        return undefined
    }
    get<T>(key: Constructor<T>): IteratorResult<any> {
        return noResult
    }
    toString(): string {
        if (this == EmptyCtx.background) {
            return "context.background"
        } else if (this == EmptyCtx.todo) {
            return "context.todo"
        }
        return 'unknown empty Context'
    }
    withValue<T>(key: Constructor<T>, val: any): Context {
        return withValue(this, key, val)
    }
    withCancel(): CancelContext {
        return withCancel(this)
    }
    withTimeout(ms: number): CancelContext {
        return withTimeout(this, ms)
    }
    withDeadline(d: Date): CancelContext {
        return withDeadline(this, d)
    }
    get isClosed(): boolean {
        return this.err !== undefined
    }
    wait(): Promise<void> {
        return neverPromise
    }
    sleep(ms: number): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, ms)
        })
    }
}
/**
 * returns a non-nil, empty Context.
 * 
 * @remarks
 * It is never canceled, has no values, and has no deadline. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming
 */
export function background(): Context {
    return EmptyCtx.background
}
/**
 * TODO returns a non-nil, empty Context. 
 * 
 * @remarks 
 * Code should use context.TODO when it's unclear which Context to use or it is not yet available (because the  surrounding function has not yet been extended to accept a Context parameter).
 */
export function todo(): Context {
    return EmptyCtx.todo
}
/**
 * returns a copy of parent in which the value associated with key is val.
 */
export function withValue<T>(parent: Context, key: Constructor<T>, val: any): Context {
    return new ValueCtx(parent, key, val)
}
class ValueCtx implements Context {
    constructor(public readonly parent: Context,
        public readonly key: Constructor<any>,
        public readonly val: any) {
    }
    get deadline(): Date | undefined {
        return this.parent.deadline
    }
    get done(): ReadChannel<void> {
        return this.parent.done
    }
    get err(): Exception | undefined {
        return this.parent.err
    }
    get<T>(key: Constructor<T>): IteratorResult<any> {
        if (this.key === key) {
            return {
                value: this.val,
            }
        }
        return value(this.parent, key)
    }
    toString(): string {
        return `${this.parent}.WithValue(type ${this.key.name}, val ${this.val})`
    }
    withValue<T>(key: Constructor<T>, val: any): Context {
        return withValue(this, key, val)
    }
    withCancel(): CancelContext {
        return withCancel(this)
    }
    withTimeout(ms: number): CancelContext {
        return withTimeout(this, ms)
    }
    withDeadline(d: Date): CancelContext {
        return withDeadline(this, d)
    }
    get isClosed(): boolean {
        return this.err !== undefined
    }
    wait(): Promise<void> | undefined {
        return this.parent.wait()
    }
    sleep(ms: number): Promise<boolean> {
        const wait = this.wait()
        if (wait === undefined) {
            return Promise.resolve(false)
        }

        return new Promise((resolve) => {
            let t = setTimeout(() => {
                resolve(true)
            }, ms)
            wait.then(() => {
                clearTimeout(t)
                resolve(false)
            })
        })
    }
}
/**
 * returns a copy of parent with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
 */
export function withCancel<T>(parent: Context): CancelContext {
    const ctx = new CancelCtx(parent)
    propagateCancel(parent, ctx)
    return ctx
}
class cancelCtxKey { }
interface canceler {
    _cancel(removeFromParent: boolean, err: Exception): void
    readonly done: ReadChannel<any>
}
class CancelCtx implements CancelContext {
    done_: Chan<any> | undefined
    err_?: Exception
    children_: Set<canceler> | undefined
    constructor(public readonly parent: Context) { }
    get deadline(): Date | undefined {
        return this.parent.deadline
    }
    get done(): ReadChannel<void> {
        let d = this.done_
        if (!d) {
            d = new Chan<void>()
            this.done_ = d
        }
        return d
    }
    _cancel(removeFromParent: boolean, err: Exception): void {
        if (this.err_) {
            return // already canceled
        }
        this.err_ = err
        const d = this.done_
        if (d) {
            d.close()
        } else {
            this.done_ = Chan.closed
        }
        const children = this.children_
        if (children) {
            for (const child of children) {
                child._cancel(false, err)
            }
        }
        this.children_ = undefined

        if (removeFromParent) {
            removeChild(this.parent, this)
        }
    }
    cancel(reason?: any): void {
        this._cancel(true, reason ?? errCanceled)
    }
    get err(): Exception | undefined {
        return this.err_
    }
    get<T>(key: Constructor<T>): IteratorResult<any> {
        if (cancelCtxKey === key) {
            return {
                value: this,
            }
        }
        return value(this.parent, key)
    }
    toString(): string {
        return `${this.parent}.WithCancel`
    }
    withValue<T>(key: Constructor<T>, val: any): Context {
        return withValue(this, key, val)
    }
    withCancel(): CancelContext {
        return withCancel(this)
    }
    withTimeout(ms: number): CancelContext {
        return withTimeout(this, ms)
    }
    withDeadline(d: Date): CancelContext {
        return withDeadline(this, d)
    }
    get isClosed(): boolean {
        return this.err !== undefined
    }
    wait(): Promise<void> | undefined {
        return this.done.wait()
    }
    sleep(ms: number): Promise<boolean> {
        const wait = this.wait()
        if (wait === undefined) {
            return Promise.resolve(false)
        }

        return new Promise((resolve) => {
            let t = setTimeout(() => {
                resolve(true)
            }, ms)
            wait.then(() => {
                clearTimeout(t)
                resolve(false)
            })
        })
    }
}
function value<T>(c: Context, key: Constructor<T>): IteratorResult<any> {
    while (true) {
        if (c instanceof ValueCtx) {
            if (c.key === key) {
                return {
                    value: c.val,
                }
            }
            c = c.parent
        } else if (c instanceof CancelCtx) { // TimerCtx 
            if (cancelCtxKey === key) {
                return {
                    value: c,
                }
            }
            c = c.parent
        } else if (c instanceof EmptyCtx) {
            return noResult
        } else {
            return c.get(key)
        }
    }
}
function propagateCancel(parent: Context, child: canceler): void {
    const done = parent.done
    if (done == Chan.never) {
        return // parent is never canceled
    }
    if (done.isClosed) {
        // parent is already canceled
        child._cancel(false, parent.err!)
        return
    }
    const p = parentCancelCtx(parent)
    if (p) {
        if (p.err_ !== undefined) {
            child._cancel(false, p.err_!)
        } else {
            if (!p.children_) {
                p.children_ = new Set<canceler>()
            }
            p.children_.add(child)
        }
    } else {
        const rp = parent.done.readCase()
        const rc = child.done.readCase();
        (async () => {
            switch (await selectChan(rp, rc)) {
                case rp:
                    child._cancel(false, parent.err!)
                    break
                case rc:
                    break
            }
        })()
    }
}
function parentCancelCtx(parent: Context): CancelCtx | undefined {
    const done = parent.done
    if (done == Chan.never || done.isClosed) {
        return
    }
    const found = parent.get(cancelCtxKey)
    if (found.done) {
        return
    }
    const p = found.value as CancelCtx
    if (done !== p.done_) {
        return
    }
    return p
}
function removeChild(parent: Context, child: canceler) {
    const p = parentCancelCtx(parent)
    if (!p) {
        return
    }
    p.children_?.delete(child)
}
/**
 * returns a copy of the parent context with the deadline adjusted  to be no later than d. If the parent's deadline is already earlier than d, withDeadline(parent, d) is semantically equivalent to parent. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the parent context's Done channel is closed, whichever happens first.
 */
export function withDeadline(parent: Context, d: Date): CancelContext {
    const cur = parent.deadline
    if (cur && cur.getTime() < d.getTime()) {
        return withCancel(parent)
    }
    const c = new TimerCtx(parent, d)
    propagateCancel(parent, c)
    const dur = d.getTime() - Date.now()
    if (dur <= 0) {
        c._cancel(true, errDeadlineExceeded) // deadline has already passed
        return c
    }
    c._serve(dur)
    return c
}
/**
 * returns withDeadline(parent, now + millisecond).
 */
export function withTimeout(parent: Context, ms: number): CancelContext {
    return withDeadline(parent, new Date(Date.now() + ms))
}
class TimerCtx extends CancelCtx implements CancelContext {
    private t_: undefined | number
    constructor(parent: Context, private readonly deadline_: Date) {
        super(parent)
    }
    _serve(ms: number) {
        this.t_ = setTimeout(() => {
            this._cancel(true, errDeadlineExceeded)
        }, ms)
    }
    get deadline(): Date | undefined {
        return this.deadline_
    }
    _cancel(removeFromParent: boolean, err: Exception) {
        super._cancel(false, err)
        if (removeFromParent) {
            // Remove this timerCtx from its parent cancelCtx's children.
            removeChild(this.parent, this)
        }

        const t = this.t_
        if (t !== undefined) {
            this.t_ = undefined
            clearTimeout(t)
        }
    }
    cancel(reason: any): void {
        this._cancel(true, reason ?? errCanceled)
    }
    toString(): string {
        return `${this.parent}.WithDeadline(${this.deadline_} [${this.deadline_.getTime() - Date.now()}ms])`
    }
}
