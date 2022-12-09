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
export declare class Completer<T> {
    private promise_;
    private resolve_;
    private reject_;
    private c_;
    /**
     * Returns whether the Promise has completed
     */
    get isCompleted(): boolean;
    constructor();
    /**
     * Returns the created Promise
     */
    get promise(): Promise<T>;
    /**
     * Complete success, Promise.resolve(value)
     * @param value
     */
    resolve(value?: T | PromiseLike<T>): void;
    /**
     * Complete error, Promise.reject(reason)
     * @param reason
     */
    reject(reason?: any): void;
}
export declare type AssetLoadCallback<T> = () => Promise<T>;
/**
 * an asynchronous asset
 */
export declare class Asset<T> {
    static make<T>(callback: AssetLoadCallback<T>): Asset<T>;
    private ok_;
    private asset_?;
    private done_?;
    get asset(): T | Promise<T>;
    protected _load(): Promise<T>;
}
