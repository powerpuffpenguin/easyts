"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Log = exports.LogLevel = void 0;
var logger_1 = require("./logger");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["any"] = 0] = "any";
    LogLevel[LogLevel["trace"] = 1] = "trace";
    LogLevel[LogLevel["debug"] = 2] = "debug";
    LogLevel[LogLevel["info"] = 3] = "info";
    LogLevel[LogLevel["warn"] = 4] = "warn";
    LogLevel[LogLevel["error"] = 5] = "error";
    LogLevel[LogLevel["fail"] = 6] = "fail";
    LogLevel[LogLevel["none"] = 100] = "none";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Log = /** @class */ (function () {
    function Log(opts) {
        var _a;
        this.opts_ = {
            level: (_a = opts === null || opts === void 0 ? void 0 : opts.level) !== null && _a !== void 0 ? _a : LogLevel.none,
            trace: opts === null || opts === void 0 ? void 0 : opts.trace,
            debug: opts === null || opts === void 0 ? void 0 : opts.debug,
            info: opts === null || opts === void 0 ? void 0 : opts.info,
            warn: opts === null || opts === void 0 ? void 0 : opts.warn,
            error: opts === null || opts === void 0 ? void 0 : opts.error,
            fail: opts === null || opts === void 0 ? void 0 : opts.fail,
        };
    }
    Object.defineProperty(Log.prototype, "level", {
        get: function () {
            return this.opts_.level;
        },
        set: function (lv) {
            if (Number.isSafeInteger(lv) && LogLevel.any <= lv && lv <= LogLevel.none) {
                this.opts_.level = lv;
                return;
            }
            throw Error("unknow level ".concat(lv));
        },
        enumerable: false,
        configurable: true
    });
    Log.prototype.getLogger = function (lv) {
        if (Number.isSafeInteger(lv)) {
            switch (lv) {
                case LogLevel.trace:
                    return this.opts_.trace;
                case LogLevel.debug:
                    return this.opts_.debug;
                case LogLevel.info:
                    return this.opts_.info;
                case LogLevel.warn:
                    return this.opts_.warn;
                case LogLevel.error:
                    return this.opts_.error;
                case LogLevel.fail:
                    return this.opts_.fail;
            }
        }
        throw Error("unknow level ".concat(lv));
    };
    Log.prototype.setLogger = function (lv, logger) {
        if (Number.isSafeInteger(lv)) {
            switch (lv) {
                case LogLevel.trace:
                    this.opts_.trace = logger;
                    return;
                case LogLevel.debug:
                    this.opts_.debug = logger;
                    return;
                case LogLevel.info:
                    this.opts_.info = logger;
                    return;
                case LogLevel.warn:
                    this.opts_.warn = logger;
                    return;
                case LogLevel.error:
                    this.opts_.error = logger;
                    return;
                case LogLevel.fail:
                    this.opts_.fail = logger;
                    return;
            }
        }
        throw Error("unknow level ".concat(lv));
    };
    Log.prototype.trace = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.trace) {
            (_a = opts.trace) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    Log.prototype.debug = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.debug) {
            (_a = opts.debug) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    Log.prototype.info = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.info) {
            (_a = opts.info) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    Log.prototype.warn = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.warn) {
            (_a = opts.warn) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    Log.prototype.error = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.error) {
            (_a = opts.error) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    Log.prototype.fail = function () {
        var _a;
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts_;
        if (opts.level <= LogLevel.fail) {
            (_a = opts.fail) === null || _a === void 0 ? void 0 : _a.log.apply(_a, __spreadArray([], __read(vals), false));
        }
    };
    return Log;
}());
exports.Log = Log;
exports.log = new Log({
    level: LogLevel.debug,
    trace: new logger_1.Logger({
        prefix: 'trace',
    }),
    debug: new logger_1.Logger({
        prefix: 'debug',
    }),
    info: new logger_1.Logger({
        prefix: 'info',
    }),
    warn: new logger_1.Logger({
        prefix: 'warn',
    }),
    error: new logger_1.Logger({
        prefix: 'error',
    }),
    fail: new logger_1.Logger({
        prefix: 'fail',
    }),
});
//# sourceMappingURL=log.js.map