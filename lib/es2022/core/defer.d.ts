import { Exception, ExceptionConstructor } from './exception';
export declare class DeferException extends Exception {
    has: boolean;
    readonly e: any;
    readonly errs: Array<any>;
    /**
     *
     * @param has Set to true if the executed main function throws an exception
     * @param e The exception thrown by the main function
     * @param errs Exception thrown by defer function
     */
    constructor(has: boolean, e: any, errs: Array<any>);
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     */
    as<T extends Exception>(target: ExceptionConstructor<T>): T | undefined;
    /**
     *
     * @returns Returns the string description of the exception
     * @override
     */
    error(): string;
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
export declare class Defer {
    private fs_;
    private constructor();
    /**
     * Execute synchronous process, defer will not wait for any Promise
     */
    static sync<T>(f: (defer: Defer) => T): T;
    private _syncDone;
    /**
     * Execute an asynchronous process, defer will wait for each Promise to complete before executing the next function
     */
    static async<T>(f: (defer: Defer) => T | Promise<T>): Promise<T>;
    private _asyncDone;
    /**
     *
     * @param f
     */
    defer(f: () => any | Promise<any>): void;
}
