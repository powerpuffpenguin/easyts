import { Exception } from './exception';
export class DeferException extends Exception {
    /**
     *
     * @param has Set to true if the executed main function throws an exception
     * @param e The exception thrown by the main function
     * @param errs Exception thrown by defer function
     */
    constructor(has, e, errs) {
        super('DeferException');
        this.has = has;
        this.e = e;
        this.errs = errs;
    }
    /**
     *
     * @internal
     */
    static make(has, e, errs) {
        return new DeferException(has, e, errs);
    }
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     * @override
     */
    as(target) {
        if (this instanceof target) {
            return this;
        }
        for (const e of this.errs) {
            if (e instanceof Exception) {
                const found = e.as(target);
                if (found) {
                    return found;
                }
            }
        }
        return;
    }
    /**
     *
     * @virtual
     * @override
     */
    is(target) {
        if (this === target) {
            return true;
        }
        for (const e of this.errs) {
            if (e instanceof Exception) {
                if (e.is(target)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     *
     * @returns Returns the string description of the exception
     * @override
     */
    error() {
        const errs = this.errs;
        if (errs.length == 0) {
            return this.message;
        }
        return errs.join(';');
    }
}
/**
 * mock golang defer
 *
 * @remarks
 * defer can register a series of functions. These functions will be automatically executed in the order of first-in, last-out when defer is destroyed. Usually, you can use defer in a function scope to automatically release resources. For example, after a function opens the database, you can 'close the database' register in defer, which ensures that the database will definitely be released when the function ends
 *
 * @example
 * ```
 *  Defer.async(async (d) => {
 *     const db = await openDB() // open resource
 *     // close db
 *     d.defer(async () => await db.close())
 *     const f = await openFile('date.log') // open resource
 *     // close file
 *     d.defer(async () => await f.close())
 *
 *     // some logic code logic
 *     const text = await f.readAll()
 *     const result = await db.set('log', text)
 *
 *     return result // After the function returns, defer will call the registered cleanup function according to the first in, last out
 * })
 * ```
 */
export class Defer {
    constructor() {
        /**
         * defer funcs
         */
        this.fs_ = new Array();
    }
    /**
     * Execute synchronous process, defer will not wait for any Promise
     */
    static sync(f) {
        const d = new Defer();
        let result;
        try {
            result = f(d);
        }
        catch (e) {
            const de = d._syncDone(true, e);
            if (de) {
                throw de;
            }
            else {
                throw e;
            }
        }
        d._syncDone(false);
        return result;
    }
    _syncDone(has, e) {
        const fs = this.fs_;
        const errs = new Array();
        for (let i = fs.length - 1; i >= 0; i--) {
            const f = fs[i];
            if (f.ok) {
                try {
                    f.f(...f.args);
                }
                catch (e) {
                    errs.push(e);
                }
            }
        }
        if (errs.length != 0) {
            if (has) {
                return DeferException.make(has, e, errs);
            }
            throw DeferException.make(false, undefined, errs);
        }
    }
    /**
     * Execute an asynchronous process, defer will wait for each Promise to complete before executing the next function
     */
    static async async(f) {
        const d = new Defer();
        let result;
        try {
            result = await f(d);
        }
        catch (e) {
            const de = await d._asyncDone(true, e);
            if (de) {
                throw de;
            }
            else {
                throw e;
            }
        }
        await d._asyncDone(false);
        return result;
    }
    async _asyncDone(has, e) {
        const fs = this.fs_;
        const errs = new Array();
        for (let i = fs.length - 1; i >= 0; i--) {
            const f = fs[i];
            if (f.ok) {
                try {
                    await f.f(...f.args);
                }
                catch (e) {
                    errs.push(e);
                }
            }
        }
        if (errs.length != 0) {
            if (has) {
                return DeferException.make(has, e, errs);
            }
            throw DeferException.make(false, undefined, errs);
        }
    }
    /**
     *
     * @param f
     */
    defer(f, ...args) {
        const c = new Func(f, args);
        this.fs_.push(c);
        return c;
    }
}
class Func {
    constructor(f, args) {
        this.f = f;
        this.args = args;
        this.ok = true;
    }
    cancel() {
        this.ok = false;
    }
}
//# sourceMappingURL=defer.js.map