"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Log = exports.LogLevel = void 0;
const logger_1 = require("./logger");
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
class Log {
    opts_;
    constructor(opts) {
        this.opts_ = {
            level: opts?.level ?? LogLevel.none,
            trace: opts?.trace,
            debug: opts?.debug,
            info: opts?.info,
            warn: opts?.warn,
            error: opts?.error,
            fail: opts?.fail,
        };
    }
    get level() {
        return this.opts_.level;
    }
    set level(lv) {
        if (Number.isSafeInteger(lv) && LogLevel.any <= lv && lv <= LogLevel.none) {
            this.opts_.level = lv;
            return;
        }
        throw Error(`unknow level ${lv}`);
    }
    getLogger(lv) {
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
        throw Error(`unknow level ${lv}`);
    }
    setLogger(lv, logger) {
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
        throw Error(`unknow level ${lv}`);
    }
    trace(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.trace) {
            opts.trace?.log(...vals);
        }
    }
    debug(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.debug) {
            opts.debug?.log(...vals);
        }
    }
    info(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.info) {
            opts.info?.log(...vals);
        }
    }
    warn(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.warn) {
            opts.warn?.log(...vals);
        }
    }
    error(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.error) {
            opts.error?.log(...vals);
        }
    }
    fail(...vals) {
        const opts = this.opts_;
        if (opts.level <= LogLevel.fail) {
            opts.fail?.log(...vals);
        }
    }
}
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