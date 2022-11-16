var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            try {
                f.f(...f.args);
            }
            catch (e) {
                errs.push(e);
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
    static async(f) {
        return __awaiter(this, void 0, void 0, function* () {
            const d = new Defer();
            let result;
            try {
                result = yield f(d);
            }
            catch (e) {
                const de = yield d._asyncDone(true, e);
                if (de) {
                    throw de;
                }
                else {
                    throw e;
                }
            }
            yield d._asyncDone(false);
            return result;
        });
    }
    _asyncDone(has, e) {
        return __awaiter(this, void 0, void 0, function* () {
            const fs = this.fs_;
            const errs = new Array();
            for (let i = fs.length - 1; i >= 0; i--) {
                const f = fs[i];
                try {
                    yield f.f(...f.args);
                }
                catch (e) {
                    errs.push(e);
                }
            }
            if (errs.length != 0) {
                if (has) {
                    return DeferException.make(has, e, errs);
                }
                throw DeferException.make(false, undefined, errs);
            }
        });
    }
    /**
     *
     * @param f
     */
    defer(f, ...args) {
        this.fs_.push({
            f: f,
            args: args,
        });
    }
}
// function generateDefer(count: number) {
//     for (let i = 0; i <= count; i++) {
//         if (i == 0) {
//             console.log('defer(f: () => any | Promise<any>): void;')
//             continue
//         }
//         let str = `defer<`
//         let strs = []
//         for (let j = 1; j <= i; j++) {
//             strs.push(`T${j}`)
//         }
//         str += `${strs.join(', ')}>(f: (`
//         strs = []
//         for (let j = 1; j <= i; j++) {
//             strs.push(`v${j}: T${j}`)
//         }
//         str += `${strs.join(', ')}) => `
//         strs = ['any | Promise<any>']
//         for (let j = 1; j <= i; j++) {
//             strs.push(`v${j}: T${j}`)
//         }
//         str += `${strs.join(', ')}): void;`
//         console.log(str)
//     }
// }
//# sourceMappingURL=defer.js.map