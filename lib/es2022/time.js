"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickFunc = exports.tick = exports.Ticker = exports.afterFunc = exports.after = exports.Timer = exports.sleep = exports.Day = exports.Hour = exports.Minute = exports.Second = exports.Millisecond = exports.errTicker = void 0;
const channel_1 = require("./core/channel");
const exception_1 = require("./core/exception");
exports.errTicker = new exception_1.Exception('non-positive interval for NewTicker');
exports.Millisecond = 1;
exports.Second = 1000 * exports.Millisecond;
exports.Minute = 60 * exports.Second;
exports.Hour = 60 * exports.Minute;
exports.Day = 24 * exports.Hour;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
exports.sleep = sleep;
/**
 * Timer that will send  the current time on its channel after at least duration millisecond.
 */
class Timer {
    callback;
    c_;
    t_;
    /**
     * @internal
     */
    constructor(ms, callback) {
        this.callback = callback;
        if (!callback) {
            this.c_ = new channel_1.Chan(1);
        }
        this._start(ms);
    }
    _start(ms) {
        if (ms < 0) {
            this._send(new Date());
        }
        else {
            this.t_ = setTimeout(() => {
                this.t_ = undefined;
                this._send(new Date());
            }, ms);
        }
    }
    _send(val) {
        const callback = this.callback;
        if (callback) {
            callback(val);
        }
        else {
            const c = this.c_;
            if (c.tryWrite(val)) {
                return;
            }
            c.tryRead();
            c.tryWrite(val);
        }
    }
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
    stop() {
        const t = this.t_;
        if (t === undefined) {
            return false;
        }
        // case State.wait
        this.t_ = undefined;
        clearTimeout(t);
        return true;
    }
    /**
     * When the Timer expires, the current time will be sent on c
     */
    get c() {
        return this.c_ ?? channel_1.Chan.never;
    }
    /**
     * Reset changes the timer to expire after duration millisecond.
     * @returns returns true if the timer had been active, false if the timer had  expired or been stopped.
     */
    reset(ms) {
        const t = this.t_;
        if (t) {
            this.t_ = undefined;
            clearTimeout(t);
            this._start(ms);
            return true;
        }
        this._start(ms);
        return false;
    }
}
exports.Timer = Timer;
/**
 * waits for the duration to elapse and then sends the current time  on the returned channel.
 */
function after(ms) {
    const c = new channel_1.Chan();
    if (ms <= 0) {
        c.write(new Date());
    }
    else {
        setTimeout(() => {
            c.write(new Date());
        }, ms);
    }
    return c;
}
exports.after = after;
/**
 * waits for the duration to elapse and then calls callback
 * @param callback It returns a Timer that can be used to cancel the call using its Stop method.
 */
function afterFunc(ms, callback) {
    return new Timer(ms, callback);
}
exports.afterFunc = afterFunc;
/**
 * A Ticker containing a channel that will send the current time on the channel after each tick. The period of the  ticks is specified by the duration argument. The ticker will adjust the time interval or drop ticks to make up for slow receivers. The duration d must be greater than zero; if not, NewTicker will  throw exception
 */
class Ticker {
    callback;
    c_;
    t_;
    /**
     * @internal
     * @throws {@link errTicker}
     */
    constructor(ms, callback) {
        this.callback = callback;
        if (ms <= 0) {
            throw exports.errTicker;
        }
        if (!callback) {
            this.c_ = new channel_1.Chan(1);
        }
        this._start(ms);
    }
    _start(ms) {
        this.t_ = setInterval(() => {
            this._send(new Date());
        }, ms);
    }
    _send(val) {
        const callback = this.callback;
        if (callback) {
            callback(val);
        }
        else {
            const c = this.c_;
            if (c.tryWrite(val)) {
                return;
            }
            c.tryRead();
            c.tryWrite(val);
        }
    }
    /**
     * The channel on which the ticks are delivered.
     */
    get c() {
        return this.c_ ?? channel_1.Chan.never;
    }
    /**
     * Stop turns off a ticker. After Stop, no more ticks will be sent.
     */
    stop() {
        const t = this.t_;
        if (t === undefined) {
            return;
        }
        this.t_ = undefined;
        clearInterval(t);
    }
    /**
     * Reset stops a ticker and resets its period to the specified duration.
     */
    reset(ms) {
        if (ms <= 0) {
            throw exports.errTicker;
        }
        this.stop();
        this._start(ms);
    }
}
exports.Ticker = Ticker;
/**
 * Tick is a convenience wrapper for new Ticker providing access to the ticking  channel only. While Tick is useful for clients that have no need to shut down  the Ticker, be aware that without a way to shut it down the underlying  Ticker cannot be recovered by the garbage collector; it "leaks". Unlike NewTicker, Tick will return undefined if ms <= 0.
 * @returns if ms <=0 return undefined
 */
function tick(ms) {
    if (ms <= 0) {
        return undefined;
    }
    const c = new channel_1.Chan(1);
    setInterval(() => {
        const v = new Date();
        if (c.tryWrite(v)) {
            return;
        }
        c.tryRead();
        c.tryWrite(v);
    }, ms);
    return c;
}
exports.tick = tick;
/**
 * The callback is called whenever the duration elapses
 * @returns if ms <=0 return undefined
 */
function tickFunc(ms, callback) {
    if (ms <= 0) {
        return undefined;
    }
    return new Ticker(ms, callback);
}
exports.tickFunc = tickFunc;
//# sourceMappingURL=time.js.map