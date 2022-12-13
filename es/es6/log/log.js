import { Logger } from "./logger";
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["any"] = 0] = "any";
    LogLevel[LogLevel["trace"] = 1] = "trace";
    LogLevel[LogLevel["debug"] = 2] = "debug";
    LogLevel[LogLevel["info"] = 3] = "info";
    LogLevel[LogLevel["warn"] = 4] = "warn";
    LogLevel[LogLevel["error"] = 5] = "error";
    LogLevel[LogLevel["fail"] = 6] = "fail";
    LogLevel[LogLevel["none"] = 100] = "none";
})(LogLevel || (LogLevel = {}));
export class Log {
    constructor(opts) {
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
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.trace) {
            (_a = opts.trace) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
    debug(...vals) {
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.debug) {
            (_a = opts.debug) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
    info(...vals) {
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.info) {
            (_a = opts.info) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
    warn(...vals) {
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.warn) {
            (_a = opts.warn) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
    error(...vals) {
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.error) {
            (_a = opts.error) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
    fail(...vals) {
        var _a;
        const opts = this.opts_;
        if (opts.level <= LogLevel.fail) {
            (_a = opts.fail) === null || _a === void 0 ? void 0 : _a.log(...vals);
        }
    }
}
export const log = new Log({
    level: LogLevel.debug,
    trace: new Logger({
        prefix: 'trace',
    }),
    debug: new Logger({
        prefix: 'debug',
    }),
    info: new Logger({
        prefix: 'info',
    }),
    warn: new Logger({
        prefix: 'warn',
    }),
    error: new Logger({
        prefix: 'error',
    }),
    fail: new Logger({
        prefix: 'fail',
    }),
});
//# sourceMappingURL=log.js.map