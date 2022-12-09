import { neverPromise, noResult } from "../values";
import { Chan, ReadChannel, selectChan } from "../channel";
import { Exception } from "../exception";
import { Constructor } from "../types";


export class CanceleException extends Exception {
    constructor(message?: string, opts?: ErrorOptions) {
        super(message ?? 'context canceled', opts)
        this.canceled = true
    }
}
export class DeadlineExceeded extends Exception {
    constructor(message?: string, opts?: ErrorOptions) {
        super(message ?? 'context deadline exceeded', opts)
        this.timeout = true
        this.temporary = true
    }
}

export type CancelFunc = (reason?: any) => void

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
     * get() returns the value associated with this context for key or undefined if no value is associated with key. Successive calls to get() with  the same key returns the same result.
     */
    get<T>(key: Constructor<any>): T | undefined
    /**
     * get() returns the [value,true] associated with this context for key or [undefined, false] if no value is associated with key. Successive calls to get() with  the same key returns the same result.
     */
    getRaw<T>(key: Constructor<any>): [undefined, false] | [T, true]
    /**
    * returns a copy of parent in which the value associated with key is val.
    */
    withValue<T>(key: Constructor<T>, val: any): Context
    /**
     * returns a copy of this with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
     */
    withCancel(): CancelContext
    /**
    * returns a copy of this with a new Done channel. The returned context's Done channel is closed when the returned copy cancel function is called or when the parent context's Done channel is closed, whichever happens first.
    */
    withCancel(cancelFunc: true): [CancelContext, CancelFunc]
    /**
     * returns withDeadline(now + millisecond).
     */
    withTimeout(ms: number): CancelContext
    /**
     * returns withDeadline(now + millisecond).
     */
    withTimeout(ms: number, cancelFunc: true): [CancelContext, CancelFunc]
    /**
     * returns a copy of the this context with the deadline adjusted  to be no later than d. If the this's deadline is already earlier than d, withDeadline(d) is semantically equivalent to this. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the this context's Done channel is closed, whichever happens first.
     */
    withDeadline(d: Date): CancelContext
    /**
    * returns a copy of the this context with the deadline adjusted  to be no later than d. If the this's deadline is already earlier than d, withDeadline(d) is semantically equivalent to this. The returned context's Done channel is closed when the deadline expires, when the returned cancel function is called, or when the this context's Done channel is closed, whichever happens first.
    */
    withDeadline(d: Date, cancelFunc: true): [CancelContext, CancelFunc]
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
    get(_: Constructor<any>) {
        return undefined
    }
    getRaw(key: Constructor<any>): [undefined, false] {
        return [undefined, false]
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
    withCancel(): CancelContext;
    withCancel(cancelFunc: true): [CancelContext, CancelFunc];
    withCancel(cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withCancel(this, cancelFunc)
    }
    withTimeout(ms: number): CancelContext;
    withTimeout(ms: number, cancelFunc: true): [CancelContext, CancelFunc];
    withTimeout(ms: number, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withTimeout(this, ms, cancelFunc)
    }
    withDeadline(d: Date): CancelContext;
    withDeadline(d: Date, cancelFunc: true): [CancelContext, CancelFunc];
    withDeadline(d: Date, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withDeadline(this, d, cancelFunc)
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
function withValue<T>(parent: Context, key: Constructor<T>, val: any): Context {
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
    get<T>(key: Constructor<any>): T | undefined {
        if (this.key === key) {
            return this.val
        }
        const val = value<T>(this.parent, key)
        return val[0]
    }
    getRaw<T>(key: Constructor<any>): [undefined, false] | [T, true] {
        if (this.key === key) {
            return [this.val, true]
        }
        return value<T>(this.parent, key)
    }
    toString(): string {
        return `${this.parent}.WithValue(type ${this.key.name}, val ${this.val})`
    }
    withValue<T>(key: Constructor<T>, val: any): Context {
        return withValue(this, key, val)
    }
    withCancel(): CancelContext;
    withCancel(cancelFunc: true): [CancelContext, CancelFunc];
    withCancel(cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withCancel(this, cancelFunc)
    }
    withTimeout(ms: number): CancelContext;
    withTimeout(ms: number, cancelFunc: true): [CancelContext, CancelFunc];
    withTimeout(ms: number, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withTimeout(this, ms, cancelFunc)
    }
    withDeadline(d: Date): CancelContext;
    withDeadline(d: Date, cancelFunc: true): [CancelContext, CancelFunc];
    withDeadline(d: Date, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withDeadline(this, d, cancelFunc)
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

function withCancel<T>(parent: Context, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
    const ctx = new CancelCtx(parent)
    propagateCancel(parent, ctx)
    if (cancelFunc) {
        return [ctx, (reason) => ctx.cancel(reason)]
    }
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
        this._cancel(true, reason ?? new CanceleException())
    }
    get err(): Exception | undefined {
        return this.err_
    }
    get<T>(key: Constructor<any>, exists?: true): T | undefined {
        if (cancelCtxKey === key) {
            return exists ? [this as any, true] : this as any
        }
        const val = value<T>(this.parent, key)
        return val[0]
    }
    getRaw<T>(key: Constructor<any>): [undefined, false] | [T, true] {
        if (cancelCtxKey === key) {
            return [this as any, true]
        }
        const val = value<T>(this.parent, key)
        return val
    }
    toString(): string {
        return `${this.parent}.WithCancel`
    }
    withValue<T>(key: Constructor<T>, val: any): Context {
        return withValue(this, key, val)
    }
    withCancel(): CancelContext;
    withCancel(cancelFunc: true): [CancelContext, CancelFunc];
    withCancel(cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withCancel(this, cancelFunc)
    }
    withTimeout(ms: number): CancelContext;
    withTimeout(ms: number, cancelFunc: true): [CancelContext, CancelFunc];
    withTimeout(ms: number, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withTimeout(this, ms, cancelFunc)
    }
    withDeadline(d: Date): CancelContext;
    withDeadline(d: Date, cancelFunc: true): [CancelContext, CancelFunc];
    withDeadline(d: Date, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
        return withDeadline(this, d, cancelFunc)
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
function value<T>(c: Context, key: Constructor<any>): [undefined, false] | [T, true] {
    while (true) {
        if (c instanceof ValueCtx) {
            if (c.key === key) {
                return [c.val, true]
            }
            c = c.parent
        } else if (c instanceof CancelCtx) { // TimerCtx 
            if (cancelCtxKey === key) {
                return [c as T, true]
            }
            c = c.parent
        } else if (c instanceof EmptyCtx) {
            return [undefined, false]
        } else {
            return c.getRaw<T>(key)
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
    const [p, ok] = parent.getRaw<CancelCtx>(cancelCtxKey)
    if (!ok) {
        return
    }
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

function withDeadline(parent: Context, d: Date, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
    const cur = parent.deadline
    if (cur && cur.getTime() < d.getTime()) {
        return withCancel(parent, cancelFunc)
    }
    const c = new TimerCtx(parent, d)
    propagateCancel(parent, c)
    const dur = d.getTime() - Date.now()
    if (dur <= 0) {
        c._cancel(true, new DeadlineExceeded()) // deadline has already passed
    } else {
        c._serve(dur)
    }
    if (cancelFunc) {
        return [c, (resaon) => c.cancel(resaon)]
    }
    return c
}

function withTimeout(parent: Context, ms: number, cancelFunc?: true): CancelContext | [CancelContext, CancelFunc] {
    return withDeadline(parent, new Date(Date.now() + ms), cancelFunc)
}
class TimerCtx extends CancelCtx implements CancelContext {
    private t_: undefined | number
    constructor(parent: Context, private readonly deadline_: Date) {
        super(parent)
    }
    _serve(ms: number) {
        this.t_ = setTimeout(() => {
            this._cancel(true, new DeadlineExceeded())
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
        this._cancel(true, reason ?? new CanceleException())
    }
    toString(): string {
        return `${this.parent}.WithDeadline(${this.deadline_} [${this.deadline_.getTime() - Date.now()}ms])`
    }
}