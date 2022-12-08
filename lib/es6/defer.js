"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defer = void 0;
const logger_1 = require("./log/logger");
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
class Defer {
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
            d._syncDone();
            throw e;
        }
        d._syncDone();
        return result;
    }
    _syncDone() {
        const fs = this.fs_;
        for (let i = fs.length - 1; i >= 0; i--) {
            const f = fs[i];
            if (f.ok) {
                try {
                    f.f(...f.args);
                }
                catch (e) {
                    logger_1.defaultLogger.log('defer.sync', e);
                }
            }
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
                yield d._asyncDone();
                throw e;
            }
            yield d._asyncDone();
            return result;
        });
    }
    _asyncDone() {
        return __awaiter(this, void 0, void 0, function* () {
            const fs = this.fs_;
            for (let i = fs.length - 1; i >= 0; i--) {
                const f = fs[i];
                if (f.ok) {
                    try {
                        yield f.f(...f.args);
                    }
                    catch (e) {
                        logger_1.defaultLogger.log('defer.async', e);
                    }
                }
            }
        });
    }
    defer(f, ...args) {
        const c = new Func(f, args);
        this.fs_.push(c);
        return c;
    }
}
exports.Defer = Defer;
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