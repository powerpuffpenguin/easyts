import { Exception, ExceptionConstructor } from './exception';
export class DeferException extends Exception {
    /**
     * 
     * @internal 
     */
    static make(has: boolean, e: any, errs: Array<any>): DeferException {
        return new DeferException(has, e, errs)
    }
    /**
     * 
     * @param has Set to true if the executed main function throws an exception
     * @param e The exception thrown by the main function
     * @param errs Exception thrown by defer function
     */
    constructor(public has: boolean, public readonly e: any, public readonly errs: Array<any>) {
        super('DeferException')
    }
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     * @override
     */
    as<T extends Exception>(target: ExceptionConstructor<T>): T | undefined {
        if (this instanceof target) {
            return this
        }
        for (const e of this.errs) {
            if (e instanceof Exception) {
                const found = e.as(target)
                if (found) {
                    return found
                }
            }
        }
        return
    }
    /**
     * 
     * @virtual
     * @override
     */
    is(target: any): boolean {
        if (this === target) {
            return true
        }
        for (const e of this.errs) {
            if (e instanceof Exception) {
                if (e.is(target)) {
                    return true
                }
            }
        }
        return false
    }
    /**
     * 
     * @returns Returns the string description of the exception
     * @override
     */
    error(): string {
        const errs = this.errs
        if (errs.length == 0) {
            return this.message
        }
        return errs.join(';')
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
    private fs_ = new Array<any>()
    private constructor() { }
    /**
     * Execute synchronous process, defer will not wait for any Promise
     */
    static sync<T>(f: (defer: Defer) => T): T {
        const d = new Defer()
        let result: T
        try {
            result = f(d)

        } catch (e) {
            const de = d._syncDone(true, e)
            if (de) {
                throw de
            } else {
                throw e
            }
        }
        d._syncDone(false)
        return result
    }
    private _syncDone(has: boolean, e?: any): undefined | DeferException {
        const fs = this.fs_
        const errs = new Array<any>()
        for (let i = fs.length - 1; i >= 0; i--) {
            const f = fs[i]
            try {
                f()
            } catch (e) {
                errs.push(e)
            }
        }
        if (errs.length != 0) {
            if (has) {
                return DeferException.make(has, e, errs)
            }
            throw DeferException.make(false, undefined, errs)
        }
    }
    /**
     * Execute an asynchronous process, defer will wait for each Promise to complete before executing the next function
     */
    static async async<T>(f: (defer: Defer) => T | Promise<T>): Promise<T> {
        const d = new Defer()
        let result: T
        try {
            result = await f(d)
        } catch (e) {
            const de = await d._asyncDone(true, e)
            if (de) {
                throw de
            } else {
                throw e
            }
        }
        await d._asyncDone(false)
        return result
    }
    private async _asyncDone(has: boolean, e?: any): Promise<undefined | DeferException> {
        const fs = this.fs_
        const errs = new Array<any>()
        for (let i = fs.length - 1; i >= 0; i--) {
            const f = fs[i]
            try {
                await f()
            } catch (e) {
                errs.push(e)
            }
        }
        if (errs.length != 0) {
            if (has) {
                return DeferException.make(has, e, errs)
            }
            throw DeferException.make(false, undefined, errs)
        }
    }
    /**
     * 
     * @param f 
     */
    defer(f: () => any | Promise<any>) {
        this.fs_.push(f)
    }
}