import { ValueCallback } from './core/types';
import { ReadChannel } from './core/channel';
import { Exception } from './core/exception';
export declare const errTicker: Exception;
export declare const Millisecond = 1;
export declare const Second: number;
export declare const Minute: number;
export declare const Hour: number;
export declare const Day: number;
export declare function sleep(ms: number): Promise<void>;
/**
 * Timer that will send  the current time on its channel after at least duration millisecond.
 */
export declare class Timer {
    private readonly callback?;
    private c_;
    private t_;
    constructor(ms: number);
    private _start;
    private _send;
    /**
     * Stop prevents the Timer from firing.
     * @remarks
     * Stop does not close the channel, to prevent a read from the channel succeeding  incorrectly.
     *
     * To ensure the channel is empty after a call to Stop, check the  return value and drain the channel.
     * For example, assuming the program has not received from t.C already:
     * ```
     * if (!t.Stop()) {
     *      t.c.tryRead()
     * }
     * ```
     *
     * @returns It returns true if the call stops the timer, false if the timer has already expired or been stopped.
     */
    stop(): boolean;
    /**
     * When the Timer expires, the current time will be sent on c
     */
    get c(): ReadChannel<Date>;
    /**
     * Reset changes the timer to expire after duration millisecond.
     * @returns returns true if the timer had been active, false if the timer had  expired or been stopped.
     */
    reset(ms: number): boolean;
}
/**
 * waits for the duration to elapse and then sends the current time  on the returned channel.
 */
export declare function after(ms: number): ReadChannel<Date>;
/**
 * waits for the duration to elapse and then calls callback
 * @param callback It returns a Timer that can be used to cancel the call using its Stop method.
 */
export declare function afterFunc(ms: number, callback: ValueCallback<Date>): Timer;
/**
 * A Ticker containing a channel that will send the current time on the channel after each tick. The period of the  ticks is specified by the duration argument. The ticker will adjust the time interval or drop ticks to make up for slow receivers. The duration d must be greater than zero; if not, NewTicker will  throw exception
 */
export declare class Ticker {
    private readonly callback?;
    private c_;
    private t_;
    /**
     *
     * @throws {@link errTicker}
     */
    constructor(ms: number);
    private _start;
    private _send;
    /**
     * The channel on which the ticks are delivered.
     */
    get c(): ReadChannel<Date>;
    /**
     * Stop turns off a ticker. After Stop, no more ticks will be sent.
     */
    stop(): void;
    /**
     * Reset stops a ticker and resets its period to the specified duration.
     */
    reset(ms: number): void;
}
/**
 * Tick is a convenience wrapper for new Ticker providing access to the ticking  channel only. While Tick is useful for clients that have no need to shut down  the Ticker, be aware that without a way to shut it down the underlying  Ticker cannot be recovered by the garbage collector; it "leaks". Unlike NewTicker, Tick will return undefined if ms <= 0.
 * @returns if ms <=0 return undefined
 */
export declare function tick(ms: number): ReadChannel<Date> | undefined;
/**
 * The callback is called whenever the duration elapses
 * @returns if ms <=0 return undefined
 */
export declare function tickFunc(ms: number, callback: ValueCallback<Date>): Ticker | undefined;
