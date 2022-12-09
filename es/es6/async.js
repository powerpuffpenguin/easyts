var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { notImplement } from "./internal/decorator";
/**
 * Create a Promise with a completion marker
 *
 * @remarks
 * Completer is inspired by dart, it can be used to return the same piece of data for the same asynchronous request. For example, you have a database singleton that only returns the same connection when the database is actually requested.
 *
 * @example
 * Suppose we have a connect function that creates a connection to the database and its signature looks like this `function connectDB():Promise<DB>`.
 * We can use the Completer wrapper to create only one connection
 * ```
* class Helper {
 *     private constructor() { }
 *     private static db_?: Completer<DB>
 *     static async db(): Promise<DB> {
 *         const db = Helper.db_
 *         if (db) {
 *             // connecting, return the promise of the connection
 *             return db.promise
 *         }
 *         // no connection, create a new connection
 *         const completer = new Completer<DB>()
 *         Helper.db_ = completer // locked
 *         try {
 *             const val = await connectDB()
 *             completer.resolve(val) // complete success
 *         } catch (e) {
 *             Helper.db_ = undefined // unlocked to allow subsequent calls to retry the operation
 *
 *             completer.reject(e) // complete error
 *         }
 *         return completer.promise
 *     }
 * }
 * ```
 */
export class Completer {
    constructor() {
        this.c_ = false;
        this.promise_ = new Promise((resolve, reject) => {
            this.resolve_ = resolve;
            this.reject_ = reject;
        });
    }
    /**
     * Returns whether the Promise has completed
     */
    get isCompleted() {
        return this.c_;
    }
    /**
     * Returns the created Promise
     */
    get promise() {
        return this.promise_;
    }
    /**
     * Complete success, Promise.resolve(value)
     * @param value
     */
    resolve(value) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.resolve_) {
            this.resolve_(value);
        }
    }
    /**
     * Complete error, Promise.reject(reason)
     * @param reason
     */
    reject(reason) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.reject_) {
            this.reject_(reason);
        }
    }
}
/**
 * an asynchronous asset
 */
export class Asset {
    constructor() {
        this.ok_ = false;
    }
    static make(callback) {
        return new _Asset(callback);
    }
    get asset() {
        if (this.ok_) {
            return this.asset_;
        }
        return (() => __awaiter(this, void 0, void 0, function* () {
            let done = this.done_;
            if (done) {
                return done.promise;
            }
            done = new Completer();
            try {
                const val = yield this._load();
                this.ok_ = true;
                this.asset_ = val;
                done.resolve(val);
            }
            catch (e) {
                this.done_ = undefined;
                done.reject(e);
            }
            return done.promise;
        }))();
    }
    _load() {
        throw new EvalError(notImplement(this.constructor.name, 'protected _load(): Promise<T>'));
    }
}
class _Asset extends Asset {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    _load() {
        const callback = this.callback;
        return callback();
    }
}
//# sourceMappingURL=async.js.map