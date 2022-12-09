"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = exports.Logger = exports.defaultOutput = exports.pad = void 0;
function pad(v, len) {
    return v.toString().padStart(len, '0');
}
exports.pad = pad;
exports.defaultOutput = {
    log(opts, vals) {
        let prefix = '';
        if (opts.prefix != '') {
            prefix = `[${opts.prefix}]`;
        }
        if (opts.time) {
            const d = new Date();
            const str = `[${d.getFullYear()}/${pad(d.getMonth(), 2)}/${pad(d.getDay(), 2)} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}]`;
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
class Logger {
    constructor(opts) {
        const { output = exports.defaultOutput, enable = true, prefix = '', time = true, } = opts !== null && opts !== void 0 ? opts : {};
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
exports.Logger = Logger;
exports.defaultLogger = new Logger({
    prefix: 'easyts'
});
//# sourceMappingURL=logger.js.map