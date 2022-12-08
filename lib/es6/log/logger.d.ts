export interface OutputOptions {
    /**
     * prefix label
     */
    prefix: string;
    /**
     * println current datetime
     */
    time: boolean;
}
export interface Output {
    log(opts: OutputOptions, vals: Array<any>): void;
}
export declare function pad(v: number, len: number): string;
export declare const defaultOutput: {
    log(opts: OutputOptions, vals: Array<any>): void;
};
export interface LoggerOptionsInit {
    /**
     * Log output target
     */
    output?: Output;
    /**
     * Whether to enable logging
     */
    enable?: boolean;
    /**
     * prefix label
     */
    prefix?: string;
    /**
     * println current datetime
     */
    time?: boolean;
}
export interface LoggerOptions extends OutputOptions {
    /**
     * Log output target
     */
    output: Output;
    /**
     * Whether to enable logging
     */
    enable: boolean;
}
export declare class Logger {
    readonly opts: LoggerOptions;
    constructor(opts?: LoggerOptionsInit);
    log(...vals: Array<any>): void;
}
export declare const defaultLogger: Logger;
