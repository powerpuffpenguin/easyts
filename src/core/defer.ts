// import { Exception, Cause } from './exception';
// export enum DeferCause {
//     Error = 210,
// }
// const cause = new Cause(DeferCause.Error, 'throw on defer')
// export class DeferException extends Exception {
//     static is(e: any): e is DeferException {
//         return Exception.getCode(e) === DeferCause.Error
//     }
//     /**
//      * 
//      * @internal 
//      */
//     static make(has: boolean, e: any, errs: Array<any>): DeferException {
//         return new DeferException(has, e, errs)
//     }
//     /**
//      * 
//      * @param has Set to true if the executed main function throws an exception
//      * @param e The exception thrown by the main function
//      * @param errs Exception thrown by defer function
//      */
//     private constructor(public has: boolean, public readonly e: any, public readonly errs: Array<any>) {
//         super('The main function or defer function encountered an exception', cause)
//     }
// }
// /**
//  * mock golang defer
//  * 
//  * @remarks
//  * defer can register a series of functions. These functions will be automatically executed in the order of first-in, last-out when defer is destroyed. Usually, you can use defer in a function scope to automatically release resources. For example, after a function opens the database, you can 'close the database' register in defer, which ensures that the database will definitely be released when the function ends
//  * 
//  * @example
//  * ```
//  *  Defer.async(async (d) => {
//  *     const db = await openDB() // open resource
//  *     // close db
//  *     d.defer(async () => await db.close())
//  *     const f = await openFile('date.log') // open resource
//  *     // close file
//  *     d.defer(async () => await f.close())
//  * 
//  *     // some logic code logic
//  *     const text = await f.readAll()
//  *     const result = await db.set('log', text)
//  * 
//  *     return result // After the function returns, defer will call the registered cleanup function according to the first in, last out
//  * })
//  * ```
//  */
// export class Defer {
//     /**
//      * defer funcs
//      */
//     private fs_ = new Array<Func>()
//     private constructor() { }
//     /**
//      * Execute synchronous process, defer will not wait for any Promise
//      */
//     static sync<T>(f: (defer: Defer) => T): T {
//         const d = new Defer()
//         let result: T
//         try {
//             result = f(d)

//         } catch (e) {
//             const de = d._syncDone(true, e)
//             if (de) {
//                 throw de
//             } else {
//                 throw e
//             }
//         }
//         d._syncDone(false)
//         return result
//     }
//     private _syncDone(has: boolean, e?: any): undefined | DeferException {
//         const fs = this.fs_
//         const errs = new Array<any>()
//         for (let i = fs.length - 1; i >= 0; i--) {
//             const f = fs[i]
//             if (f.ok) {
//                 try {
//                     f.f(...f.args)
//                 } catch (e) {
//                     errs.push(e)
//                 }
//             }
//         }
//         if (errs.length != 0) {
//             if (has) {
//                 return DeferException.make(has, e, errs)
//             }
//             throw DeferException.make(false, undefined, errs)
//         }
//     }
//     /**
//      * Execute an asynchronous process, defer will wait for each Promise to complete before executing the next function
//      */
//     static async async<T>(f: (defer: Defer) => T | Promise<T>): Promise<T> {
//         const d = new Defer()
//         let result: T
//         try {
//             result = await f(d)
//         } catch (e) {
//             const de = await d._asyncDone(true, e)
//             if (de) {
//                 throw de
//             } else {
//                 throw e
//             }
//         }
//         await d._asyncDone(false)
//         return result
//     }
//     private async _asyncDone(has: boolean, e?: any): Promise<undefined | DeferException> {
//         const fs = this.fs_
//         const errs = new Array<any>()
//         for (let i = fs.length - 1; i >= 0; i--) {
//             const f = fs[i]
//             if (f.ok) {
//                 try {
//                     await f.f(...f.args)
//                 } catch (e) {
//                     errs.push(e)
//                 }
//             }
//         }
//         if (errs.length != 0) {
//             if (has) {
//                 return DeferException.make(has, e, errs)
//             }
//             throw DeferException.make(false, undefined, errs)
//         }
//     }
//     defer(f: () => any | Promise<any>): Cancel;
//     defer<T1>(f: (v1: T1) => any | Promise<any>, v1: T1): Cancel;
//     defer<T1, T2>(f: (v1: T1, v2: T2) => any | Promise<any>, v1: T1, v2: T2): Cancel;
//     defer<T1, T2, T3>(f: (v1: T1, v2: T2, v3: T3) => any | Promise<any>, v1: T1, v2: T2, v3: T3): Cancel;
//     defer<T1, T2, T3, T4>(f: (v1: T1, v2: T2, v3: T3, v4: T4) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4): Cancel;
//     defer<T1, T2, T3, T4, T5>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): Cancel;
//     defer<T1, T2, T3, T4, T5, T6>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18, v19: T19) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18, v19: T19): Cancel;
//     defer<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T20>(f: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18, v19: T19, v20: T20) => any | Promise<any>, v1: T1, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9, v10: T10, v11: T11, v12: T12, v13: T13, v14: T14, v15: T15, v16: T16, v17: T17, v18: T18, v19: T19, v20: T20): Cancel;
//     /**
//      * 
//      * @param f 
//      */
//     defer(f: (...args: Array<any>) => any | Promise<any>, ...args: Array<any>): Cancel {
//         const c = new Func(f, args)
//         this.fs_.push(c)
//         return c
//     }
// }
// export interface Cancel {
//     cancel(): void
// }
// class Func implements Cancel {
//     ok = true
//     constructor(
//         public readonly f: (...args: Array<any>) => void,
//         public readonly args: Array<any>,
//     ) { }
//     cancel(): void {
//         this.ok = false
//     }
// }
