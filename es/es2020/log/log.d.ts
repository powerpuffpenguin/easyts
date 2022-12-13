import { Logger } from "./logger";
export declare enum LogLevel {
    any = 0,
    trace = 1,
    debug = 2,
    info = 3,
    warn = 4,
    error = 5,
    fail = 6,
    none = 100
}
export interface LogOptionsInit {
    level?: LogLevel;
    trace?: Logger;
    debug?: Logger;
    info?: Logger;
    warn?: Logger;
    error?: Logger;
    fail?: Logger;
}
export interface LogOptions {
    level: LogLevel;
    trace?: Logger;
    debug?: Logger;
    info?: Logger;
    warn?: Logger;
    error?: Logger;
    fail?: Logger;
}
export declare class Log {
    protected opts_: LogOptions;
    constructor(opts?: LogOptionsInit);
    get level(): LogLevel;
    set level(lv: LogLevel);
    getLogger(lv: LogLevel): Logger | undefined;
    setLogger(lv: LogLevel, logger?: Logger): void;
    trace(...vals: Array<any>): void;
    debug(...vals: Array<any>): void;
    info(...vals: Array<any>): void;
    warn(...vals: Array<any>): void;
    error(...vals: Array<any>): void;
    fail(...vals: Array<any>): void;
}
export declare const log: Log;
