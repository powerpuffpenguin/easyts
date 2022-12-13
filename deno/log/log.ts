import { Logger } from './logger.ts'

export enum LogLevel {
    any,
    trace,
    debug,
    info,
    warn,
    error,
    fail,
    none = 100,
}
export interface LogOptionsInit {
    level?: LogLevel

    trace?: Logger
    debug?: Logger
    info?: Logger
    warn?: Logger
    error?: Logger
    fail?: Logger
}
export interface LogOptions {
    level: LogLevel

    trace?: Logger
    debug?: Logger
    info?: Logger
    warn?: Logger
    error?: Logger
    fail?: Logger
}
export class Log {
    protected opts_: LogOptions
    constructor(opts?: LogOptionsInit) {
        this.opts_ = {
            level: opts?.level ?? LogLevel.none,
            trace: opts?.trace,
            debug: opts?.debug,
            info: opts?.info,
            warn: opts?.warn,
            error: opts?.error,
            fail: opts?.fail,
        }
    }
    get level() {
        return this.opts_.level
    }
    set level(lv: LogLevel) {
        if (Number.isSafeInteger(lv) && LogLevel.any <= lv && lv <= LogLevel.none) {
            this.opts_.level = lv
            return
        }
        throw Error(`unknow level ${lv}`)
    }
    getLogger(lv: LogLevel): Logger | undefined {
        if (Number.isSafeInteger(lv)) {
            switch (lv) {
                case LogLevel.trace:
                    return this.opts_.trace
                case LogLevel.debug:
                    return this.opts_.debug
                case LogLevel.info:
                    return this.opts_.info
                case LogLevel.warn:
                    return this.opts_.warn
                case LogLevel.error:
                    return this.opts_.error
                case LogLevel.fail:
                    return this.opts_.fail
            }
        }
        throw Error(`unknow level ${lv}`)
    }
    setLogger(lv: LogLevel, logger?: Logger) {
        if (Number.isSafeInteger(lv)) {
            switch (lv) {
                case LogLevel.trace:
                    this.opts_.trace = logger
                    return
                case LogLevel.debug:
                    this.opts_.debug = logger
                    return
                case LogLevel.info:
                    this.opts_.info = logger
                    return
                case LogLevel.warn:
                    this.opts_.warn = logger
                    return
                case LogLevel.error:
                    this.opts_.error = logger
                    return
                case LogLevel.fail:
                    this.opts_.fail = logger
                    return
            }
        }
        throw Error(`unknow level ${lv}`)
    }

    trace(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.trace) {
            opts.trace?.log(...vals)
        }
    }
    debug(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.debug) {
            opts.debug?.log(...vals)
        }
    }
    info(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.info) {
            opts.info?.log(...vals)
        }
    }
    warn(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.warn) {
            opts.warn?.log(...vals)
        }
    }
    error(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.error) {
            opts.error?.log(...vals)
        }
    }
    fail(...vals: Array<any>) {
        const opts = this.opts_
        if (opts.level <= LogLevel.fail) {
            opts.fail?.log(...vals)
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
})