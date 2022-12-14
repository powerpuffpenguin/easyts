"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickFunc = exports.tick = exports.Ticker = exports.afterFunc = exports.after = exports.Timer = exports.sleep = exports.Day = exports.Hour = exports.Minute = exports.Second = exports.Millisecond = exports.TimeException = void 0;
var channel_1 = require("../channel");
var exception_1 = require("../exception");
// export const errTicker = new Exception('non-positive interval for NewTicker')
var TimeException = /** @class */ (function (_super) {
    __extends(TimeException, _super);
    function TimeException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TimeException;
}(exception_1.Exception));
exports.TimeException = TimeException;
exports.Millisecond = 1;
exports.Second = 1000 * exports.Millisecond;
exports.Minute = 60 * exports.Second;
exports.Hour = 60 * exports.Minute;
exports.Day = 24 * exports.Hour;
function sleep(ms) {
    return ms <= 0 ? Promise.resolve() :
        new Promise(function (resolve) { setTimeout(resolve, ms); });
}
exports.sleep = sleep;
/**
 * Timer that will send  the current time on its channel after at least duration millisecond.
 */
var Timer = /** @class */ (function () {
    /**
     * @internal
     */
    function Timer(ms, callback) {
        this.callback = callback;
        if (!callback) {
            this.c_ = new channel_1.Chan(1);
        }
        this._start(ms);
    }
    Timer.prototype._start = function (ms) {
        var _this = this;
        if (ms < 0) {
            this._send(new Date());
        }
        else {
            this.t_ = setTimeout(function () {
                _this.t_ = undefined;
                _this._send(new Date());
            }, ms);
        }
    };
    Timer.prototype._send = function (val) {
        var callback = this.callback;
        if (callback) {
            callback(val);
        }
        else {
            var c = this.c_;
            if (c.tryWrite(val)) {
                return;
            }
            c.tryRead();
            c.tryWrite(val);
        }
    };
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
    Timer.prototype.stop = function () {
        var t = this.t_;
        if (t === undefined) {
            return false;
        }
        // case State.wait
        this.t_ = undefined;
        clearTimeout(t);
        return true;
    };
    Object.defineProperty(Timer.prototype, "c", {
        /**
         * When the Timer expires, the current time will be sent on c
         */
        get: function () {
            var _a;
            return (_a = this.c_) !== null && _a !== void 0 ? _a : channel_1.Chan.never;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Reset changes the timer to expire after duration millisecond.
     * @returns returns true if the timer had been active, false if the timer had  expired or been stopped.
     */
    Timer.prototype.reset = function (ms) {
        var t = this.t_;
        if (t) {
            this.t_ = undefined;
            clearTimeout(t);
            this._start(ms);
            return true;
        }
        this._start(ms);
        return false;
    };
    return Timer;
}());
exports.Timer = Timer;
/**
 * waits for the duration to elapse and then sends the current time  on the returned channel.
 */
function after(ms) {
    var c = new channel_1.Chan();
    if (ms <= 0) {
        c.write(new Date());
    }
    else {
        setTimeout(function () {
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
var Ticker = /** @class */ (function () {
    /**
     * @internal
     * @throws {@link TimeException}
     */
    function Ticker(ms, callback) {
        this.callback = callback;
        if (!Number.isSafeInteger(ms) || ms < 1) {
            throw new TimeException('non-positive interval for new Ticker');
        }
        if (!callback) {
            this.c_ = new channel_1.Chan(1);
        }
        this._start(ms);
    }
    Ticker.prototype._start = function (ms) {
        var _this = this;
        this.t_ = setInterval(function () {
            _this._send(new Date());
        }, ms);
    };
    Ticker.prototype._send = function (val) {
        var callback = this.callback;
        if (callback) {
            callback(val);
        }
        else {
            var c = this.c_;
            if (c.tryWrite(val)) {
                return;
            }
            c.tryRead();
            c.tryWrite(val);
        }
    };
    Object.defineProperty(Ticker.prototype, "c", {
        /**
         * The channel on which the ticks are delivered.
         */
        get: function () {
            var _a;
            return (_a = this.c_) !== null && _a !== void 0 ? _a : channel_1.Chan.never;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stop turns off a ticker. After Stop, no more ticks will be sent.
     */
    Ticker.prototype.stop = function () {
        var t = this.t_;
        if (t === undefined) {
            return;
        }
        this.t_ = undefined;
        clearInterval(t);
    };
    /**
     * Reset stops a ticker and resets its period to the specified duration.
     * @throws {@link TimeException} if ms <= 0
     */
    Ticker.prototype.reset = function (ms) {
        if (!Number.isSafeInteger(ms) || ms < 1) {
            throw new TimeException('non-positive interval for Ticker.reset');
        }
        this.stop();
        this._start(ms);
    };
    return Ticker;
}());
exports.Ticker = Ticker;
/**
 * Tick is a convenience wrapper for new Ticker providing access to the ticking  channel only. While Tick is useful for clients that have no need to shut down  the Ticker, be aware that without a way to shut it down the underlying  Ticker cannot be recovered by the garbage collector; it "leaks". Unlike NewTicker
 * @throws {@link TimeException} if ms <= 0
 */
function tick(ms) {
    if (!Number.isSafeInteger(ms) || ms < 1) {
        throw new TimeException('non-positive interval for tick');
    }
    var c = new channel_1.Chan(1);
    setInterval(function () {
        var v = new Date();
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
 * @throws {@link TimeException} if ms <= 0
 */
function tickFunc(ms, callback) {
    if (!Number.isSafeInteger(ms) || ms < 1) {
        throw new TimeException('non-positive interval for tick');
    }
    return new Ticker(ms, callback);
}
exports.tickFunc = tickFunc;
//# sourceMappingURL=time.js.map