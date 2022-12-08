import { ValueCallback } from '../types';
import { Chan, ReadChannel } from '../channel';
import { Exception } from '../exception';

// export const errTicker = new Exception('non-positive interval for NewTicker')

export class TimeException extends Exception { }

export const Millisecond = 1
export const Second = 1000 * Millisecond
export const Minute = 60 * Second
export const Hour = 60 * Minute
export const Day = 24 * Hour

export function sleep(ms: number): Promise<void> {
    return ms <= 0 ? Promise.resolve() :
        new Promise((resolve) => { setTimeout(resolve, ms) })
}



// /**
//  * Timer that will send  the current time on its channel after at least duration millisecond.
//  */
// export class Timer {
//     private c_: Chan<Date> | undefined
//     private t_: number | undefined
//     constructor(ms: number);
//     /**
//      * @internal
//      */
//     constructor(ms: number, private readonly callback?: ValueCallback<Date>) {
//         if (!callback) {
//             this.c_ = new Chan<Date>(1)
//         }
//         this._start(ms)
//     }
//     private _start(ms: number) {
//         if (ms < 0) {
//             this._send(new Date())
//         } else {
//             this.t_ = setTimeout(() => {
//                 this.t_ = undefined
//                 this._send(new Date())
//             }, ms)
//         }
//     }
//     private _send(val: Date) {
//         const callback = this.callback
//         if (callback) {
//             callback(val)
//         } else {
//             const c = this.c_!
//             if (c.tryWrite(val)) {
//                 return
//             }
//             c.tryRead()
//             c.tryWrite(val)
//         }
//     }
//     /**
//      * Stop prevents the Timer from firing.
//      * @remarks
//      * Stop does not close the channel, to prevent a read from the channel succeeding  incorrectly.
//      * 
//      * To ensure the channel is empty after a call to Stop, check the  return value and drain the channel.
//      * For example, assuming the program has not received from t.C already:
//      * ```
//      * if (!t.Stop()) {
//      *      t.c.tryRead()
//      * }
//      * ```
//      * 
//      * @returns It returns true if the call stops the timer, false if the timer has already expired or been stopped.
//      */
//     stop(): boolean {
//         const t = this.t_
//         if (t === undefined) {
//             return false
//         }
//         // case State.wait
//         this.t_ = undefined
//         clearTimeout(t)
//         return true
//     }
//     /**
//      * When the Timer expires, the current time will be sent on c
//      */
//     get c(): ReadChannel<Date> {
//         return this.c_ ?? Chan.never
//     }
//     /**
//      * Reset changes the timer to expire after duration millisecond.
//      * @returns returns true if the timer had been active, false if the timer had  expired or been stopped.
//      */
//     reset(ms: number): boolean {
//         const t = this.t_
//         if (t) {
//             this.t_ = undefined
//             clearTimeout(t)
//             this._start(ms)
//             return true
//         }
//         this._start(ms)
//         return false
//     }
// }
// /**
//  * waits for the duration to elapse and then sends the current time  on the returned channel.
//  */
// export function after(ms: number): ReadChannel<Date> {
//     const c = new Chan<Date>()
//     if (ms <= 0) {
//         c.write(new Date())
//     } else {
//         setTimeout(() => {
//             c.write(new Date())
//         }, ms)
//     }
//     return c
// }
// /**
//  * waits for the duration to elapse and then calls callback
//  * @param callback It returns a Timer that can be used to cancel the call using its Stop method.
//  */
// export function afterFunc(ms: number, callback: ValueCallback<Date>): Timer {
//     return new (Timer as any)(ms, callback)
// }
// /**
//  * A Ticker containing a channel that will send the current time on the channel after each tick. The period of the  ticks is specified by the duration argument. The ticker will adjust the time interval or drop ticks to make up for slow receivers. The duration d must be greater than zero; if not, NewTicker will  throw exception
//  */
// export class Ticker {
//     private c_: Chan<Date> | undefined
//     private t_: number | undefined
//     /**
//      * 
//      * @throws {@link errTicker} 
//      */
//     constructor(ms: number);
//     /**
//      * @internal
//      * @throws {@link errTicker} 
//      */
//     constructor(ms: number, private readonly callback?: ValueCallback<Date>) {
//         if (ms <= 0) {
//             throw errTicker
//         }
//         if (!callback) {
//             this.c_ = new Chan<Date>(1)
//         }
//         this._start(ms)
//     }
//     private _start(ms: number) {
//         this.t_ = setInterval(() => {
//             this._send(new Date())
//         }, ms)
//     }
//     private _send(val: Date) {
//         const callback = this.callback
//         if (callback) {
//             callback(val)
//         } else {
//             const c = this.c_!
//             if (c.tryWrite(val)) {
//                 return
//             }
//             c.tryRead()
//             c.tryWrite(val)
//         }
//     }
//     /**
//      * The channel on which the ticks are delivered.
//      */
//     get c(): ReadChannel<Date> {
//         return this.c_ ?? Chan.never
//     }
//     /**
//      * Stop turns off a ticker. After Stop, no more ticks will be sent.
//      */
//     stop(): void {
//         const t = this.t_
//         if (t === undefined) {
//             return
//         }
//         this.t_ = undefined
//         clearInterval(t)
//     }
//     /**
//      * Reset stops a ticker and resets its period to the specified duration.
//      */
//     reset(ms: number): void {
//         if (ms <= 0) {
//             throw errTicker
//         }
//         this.stop()
//         this._start(ms)
//     }
// }
// /**
//  * Tick is a convenience wrapper for new Ticker providing access to the ticking  channel only. While Tick is useful for clients that have no need to shut down  the Ticker, be aware that without a way to shut it down the underlying  Ticker cannot be recovered by the garbage collector; it "leaks". Unlike NewTicker, Tick will return undefined if ms <= 0.
//  * @returns if ms <=0 return undefined
//  */
// export function tick(ms: number): ReadChannel<Date> | undefined {
//     if (ms <= 0) {
//         return undefined
//     }
//     const c = new Chan<Date>(1)
//     setInterval(() => {
//         const v = new Date()
//         if (c.tryWrite(v)) {
//             return
//         }
//         c.tryRead()
//         c.tryWrite(v)
//     }, ms)
//     return c
// }
// /**
//  * The callback is called whenever the duration elapses
//  * @returns if ms <=0 return undefined
//  */
// export function tickFunc(ms: number, callback: ValueCallback<Date>): Ticker | undefined {
//     if (ms <= 0) {
//         return undefined
//     }
//     return new (Ticker as any)(ms, callback)
// }