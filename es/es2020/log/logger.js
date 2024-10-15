export function pad(v, len) {
    return v.toString().padStart(len, '0');
}
export const defaultOutput = {
    log(opts, vals) {
        let prefix = '';
        if (opts.prefix != '') {
            prefix = `[${opts.prefix}]`;
        }
        if (opts.time) {
            const d = new Date();
            const str = `[${d.getFullYear()}/${pad(d.getMonth() + 1, 2)}/${pad(d.getDate(), 2)} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}]`;
            if (prefix == '') {
                prefix = str;
            }
            else {
                prefix = prefix + " " + str;
            }
        }
        if (prefix === '') {
            console.log(...vals);
        }
        else {
            console.log(prefix, ...vals);
        }
    },
};
export class Logger {
    constructor(opts) {
        const { output = defaultOutput, enable = true, prefix = '', time = true, } = opts ?? {};
        this.opts = {
            output: output,
            enable: enable,
            prefix: prefix,
            time: time,
        };
    }
    log(...vals) {
        const opts = this.opts;
        if (opts.enable) {
            opts.output.log(opts, vals);
        }
    }
}
export const defaultLogger = new Logger({
    prefix: 'easyts'
});
//# sourceMappingURL=logger.js.map