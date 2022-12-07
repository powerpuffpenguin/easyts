"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
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
var Completer = /** @class */ (function () {
    function Completer() {
        var _this = this;
        this.c_ = false;
        this.promise_ = new Promise(function (resolve, reject) {
            _this.resolve_ = resolve;
            _this.reject_ = reject;
        });
    }
    Object.defineProperty(Completer.prototype, "isCompleted", {
        /**
         * Returns whether the Promise has completed
         */
        get: function () {
            return this.c_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Completer.prototype, "promise", {
        /**
         * Returns the created Promise
         */
        get: function () {
            return this.promise_;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Complete success, Promise.resolve(value)
     * @param value
     */
    Completer.prototype.resolve = function (value) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.resolve_) {
            this.resolve_(value);
        }
    };
    /**
     * Complete error, Promise.reject(reason)
     * @param reason
     */
    Completer.prototype.reject = function (reason) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.reject_) {
            this.reject_(reason);
        }
    };
    return Completer;
}());
exports.Completer = Completer;
//# sourceMappingURL=completer.js.map