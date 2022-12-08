"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todo = exports.background = exports.errDeadlineExceeded = exports.DeadlineExceeded = exports.CanceleException = void 0;
const values_1 = require("../values");
const channel_1 = require("../channel");
const exception_1 = require("../exception");
class CanceleException extends exception_1.Exception {
    constructor(message, opts) {
        super(message ?? 'context canceled', opts);
        this.canceled = true;
    }
}
exports.CanceleException = CanceleException;
class DeadlineExceeded extends exception_1.Exception {
    constructor(message, opts) {
        super(message ?? 'context deadline exceeded', opts);
        this.timeout = true;
        this.temporary = true;
    }
}
exports.DeadlineExceeded = DeadlineExceeded;
/**
 * errDeadlineExceeded is the error returned by context.err() when the context's deadline passes.
 */
exports.errDeadlineExceeded = new DeadlineExceeded();
class EmptyCtx {
    static background = new EmptyCtx();
    static todo = new EmptyCtx();
    constructor() { }
    get deadline() {
        return undefined;
    }
    get done() {
        return channel_1.Chan.never;
    }
    get err() {
        return undefined;
    }
    get(key) {
        return values_1.noResult;
    }
    toString() {
        if (this == EmptyCtx.background) {
            return "context.background";
        }
        else if (this == EmptyCtx.todo) {
            return "context.todo";
        }
        return 'unknown empty Context';
    }
    withValue(key, val) {
        return withValue(this, key, val);
    }
    withCancel() {
        return withCancel(this);
    }
    withTimeout(ms) {
        return withTimeout(this, ms);
    }
    withDeadline(d) {
        return withDeadline(this, d);
    }
    get isClosed() {
        return this.err !== undefined;
    }
    wait() {
        return values_1.neverPromise;
    }
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, ms);
        });
    }
}
/**
 * returns a non-nil, empty Context.
 *
 * @remarks
 * It is never canceled, has no values, and has no deadline. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming
 */
function background() {
    return EmptyCtx.background;
}
exports.background = background;
/**
 * TODO returns a non-nil, empty Context.
 *
 * @remarks
 * Code should use context.TODO when it's unclear which Context to use or it is not yet available (because the  surrounding function has not yet been extended to accept a Context parameter).
 */
function todo() {
    return EmptyCtx.todo;
}
exports.todo = todo;
function withValue(parent, key, val) {
    return new ValueCtx(parent, key, val);
}
class ValueCtx {
    parent;
    key;
    val;
    constructor(parent, key, val) {
        this.parent = parent;
        this.key = key;
        this.val = val;
    }
    get deadline() {
        return this.parent.deadline;
    }
    get done() {
        return this.parent.done;
    }
    get err() {
        return this.parent.err;
    }
    get(key) {
        if (this.key === key) {
            return {
                value: this.val,
            };
        }
        return value(this.parent, key);
    }
    toString() {
        return `${this.parent}.WithValue(type ${this.key.name}, val ${this.val})`;
    }
    withValue(key, val) {
        return withValue(this, key, val);
    }
    withCancel() {
        return withCancel(this);
    }
    withTimeout(ms) {
        return withTimeout(this, ms);
    }
    withDeadline(d) {
        return withDeadline(this, d);
    }
    get isClosed() {
        return this.err !== undefined;
    }
    wait() {
        return this.parent.wait();
    }
    sleep(ms) {
        const wait = this.wait();
        if (wait === undefined) {
            return Promise.resolve(false);
        }
        return new Promise((resolve) => {
            let t = setTimeout(() => {
                resolve(true);
            }, ms);
            wait.then(() => {
                clearTimeout(t);
                resolve(false);
            });
        });
    }
}
function withCancel(parent) {
    const ctx = new CancelCtx(parent);
    propagateCancel(parent, ctx);
    return ctx;
}
class cancelCtxKey {
}
class CancelCtx {
    parent;
    done_;
    err_;
    children_;
    constructor(parent) {
        this.parent = parent;
    }
    get deadline() {
        return this.parent.deadline;
    }
    get done() {
        let d = this.done_;
        if (!d) {
            d = new channel_1.Chan();
            this.done_ = d;
        }
        return d;
    }
    _cancel(removeFromParent, err) {
        if (this.err_) {
            return; // already canceled
        }
        this.err_ = err;
        const d = this.done_;
        if (d) {
            d.close();
        }
        else {
            this.done_ = channel_1.Chan.closed;
        }
        const children = this.children_;
        if (children) {
            for (const child of children) {
                child._cancel(false, err);
            }
        }
        this.children_ = undefined;
        if (removeFromParent) {
            removeChild(this.parent, this);
        }
    }
    cancel(reason) {
        this._cancel(true, reason ?? new CanceleException());
    }
    get err() {
        return this.err_;
    }
    get(key) {
        if (cancelCtxKey === key) {
            return {
                value: this,
            };
        }
        return value(this.parent, key);
    }
    toString() {
        return `${this.parent}.WithCancel`;
    }
    withValue(key, val) {
        return withValue(this, key, val);
    }
    withCancel() {
        return withCancel(this);
    }
    withTimeout(ms) {
        return withTimeout(this, ms);
    }
    withDeadline(d) {
        return withDeadline(this, d);
    }
    get isClosed() {
        return this.err !== undefined;
    }
    wait() {
        return this.done.wait();
    }
    sleep(ms) {
        const wait = this.wait();
        if (wait === undefined) {
            return Promise.resolve(false);
        }
        return new Promise((resolve) => {
            let t = setTimeout(() => {
                resolve(true);
            }, ms);
            wait.then(() => {
                clearTimeout(t);
                resolve(false);
            });
        });
    }
}
function value(c, key) {
    while (true) {
        if (c instanceof ValueCtx) {
            if (c.key === key) {
                return {
                    value: c.val,
                };
            }
            c = c.parent;
        }
        else if (c instanceof CancelCtx) { // TimerCtx 
            if (cancelCtxKey === key) {
                return {
                    value: c,
                };
            }
            c = c.parent;
        }
        else if (c instanceof EmptyCtx) {
            return values_1.noResult;
        }
        else {
            return c.get(key);
        }
    }
}
function propagateCancel(parent, child) {
    const done = parent.done;
    if (done == channel_1.Chan.never) {
        return; // parent is never canceled
    }
    if (done.isClosed) {
        // parent is already canceled
        child._cancel(false, parent.err);
        return;
    }
    const p = parentCancelCtx(parent);
    if (p) {
        if (p.err_ !== undefined) {
            child._cancel(false, p.err_);
        }
        else {
            if (!p.children_) {
                p.children_ = new Set();
            }
            p.children_.add(child);
        }
    }
    else {
        const rp = parent.done.readCase();
        const rc = child.done.readCase();
        (async () => {
            switch (await (0, channel_1.selectChan)(rp, rc)) {
                case rp:
                    child._cancel(false, parent.err);
                    break;
                case rc:
                    break;
            }
        })();
    }
}
function parentCancelCtx(parent) {
    const done = parent.done;
    if (done == channel_1.Chan.never || done.isClosed) {
        return;
    }
    const found = parent.get(cancelCtxKey);
    if (found.done) {
        return;
    }
    const p = found.value;
    if (done !== p.done_) {
        return;
    }
    return p;
}
function removeChild(parent, child) {
    const p = parentCancelCtx(parent);
    if (!p) {
        return;
    }
    p.children_?.delete(child);
}
function withDeadline(parent, d) {
    const cur = parent.deadline;
    if (cur && cur.getTime() < d.getTime()) {
        return withCancel(parent);
    }
    const c = new TimerCtx(parent, d);
    propagateCancel(parent, c);
    const dur = d.getTime() - Date.now();
    if (dur <= 0) {
        c._cancel(true, exports.errDeadlineExceeded); // deadline has already passed
        return c;
    }
    c._serve(dur);
    return c;
}
function withTimeout(parent, ms) {
    return withDeadline(parent, new Date(Date.now() + ms));
}
class TimerCtx extends CancelCtx {
    deadline_;
    t_;
    constructor(parent, deadline_) {
        super(parent);
        this.deadline_ = deadline_;
    }
    _serve(ms) {
        this.t_ = setTimeout(() => {
            this._cancel(true, exports.errDeadlineExceeded);
        }, ms);
    }
    get deadline() {
        return this.deadline_;
    }
    _cancel(removeFromParent, err) {
        super._cancel(false, err);
        if (removeFromParent) {
            // Remove this timerCtx from its parent cancelCtx's children.
            removeChild(this.parent, this);
        }
        const t = this.t_;
        if (t !== undefined) {
            this.t_ = undefined;
            clearTimeout(t);
        }
    }
    cancel(reason) {
        this._cancel(true, reason ?? new CanceleException());
    }
    toString() {
        return `${this.parent}.WithDeadline(${this.deadline_} [${this.deadline_.getTime() - Date.now()}ms])`;
    }
}
//# sourceMappingURL=context.js.map