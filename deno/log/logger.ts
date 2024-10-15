
export interface OutputOptions {
    /**
     * prefix label
     */
    prefix: string
    /**
     * println current datetime
     */
    time: boolean
}
export interface Output {
    log(opts: OutputOptions, vals: Array<any>): void
}
export function pad(v: number, len: number): string {
    return v.toString().padStart(len, '0')
}
export const defaultOutput = {
    log(opts: OutputOptions, vals: Array<any>): void {
        let prefix = ''
        if (opts.prefix != '') {
            prefix = `[${opts.prefix}]`
        }
        if (opts.time) {
            const d = new Date()
            const str = `[${d.getFullYear()}/${pad(d.getMonth() + 1, 2)}/${pad(d.getDate(), 2)} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}]`
            if (prefix == '') {
                prefix = str
            } else {
                prefix = prefix + " " + str
            }
        }

        if (prefix === '') {
            console.log(...vals)
        } else {
            console.log(prefix, ...vals)
        }
    },
}
export interface LoggerOptionsInit {
    /**
     * Log output target
     */
    output?: Output,

    /**
     * Whether to enable logging
     */
    enable?: boolean
    /**
     * prefix label
     */
    prefix?: string
    /**
     * println current datetime
     */
    time?: boolean
}
export interface LoggerOptions extends OutputOptions {
    /**
     * Log output target
     */
    output: Output
    /**
     * Whether to enable logging
     */
    enable: boolean
}

export class Logger {
    public readonly opts: LoggerOptions

    constructor(opts?: LoggerOptionsInit) {
        const {
            output = defaultOutput,
            enable = true,
            prefix = '',
            time = true,
        } = opts ?? {}

        this.opts = {
            output: output,
            enable: enable,
            prefix: prefix,
            time: time,
        }
    }
    log(...vals: Array<any>): void {
        const opts = this.opts
        if (opts.enable) {
            opts.output.log(opts, vals)
        }
    }
}
export const defaultLogger = new Logger({
    prefix: 'easyts'
})