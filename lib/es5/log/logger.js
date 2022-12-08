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
exports.defaultLogger = exports.Logger = exports.defaultOutput = exports.pad = void 0;
function pad(v, len) {
    return v.toString().padStart(len, '0');
}
exports.pad = pad;
exports.defaultOutput = {
    log: function (opts, vals) {
        var prefix = '';
        if (opts.prefix != '') {
            prefix = "[".concat(opts.prefix, "]");
        }
        if (opts.time) {
            var d = new Date();
            var str = "[".concat(d.getFullYear(), "/").concat(pad(d.getMonth(), 2), "/").concat(pad(d.getDay(), 2), " ").concat(pad(d.getHours(), 2), ":").concat(pad(d.getMinutes(), 2), ":").concat(pad(d.getSeconds(), 2), "]");
            if (prefix == '') {
                prefix = str;
            }
            else {
                prefix = prefix + " " + str;
            }
        }
        if (prefix === '') {
            console.log.apply(console, __spreadArray([], __read(vals), false));
        }
        else {
            console.log.apply(console, __spreadArray([prefix], __read(vals), false));
        }
    },
};
var Logger = /** @class */ (function () {
    function Logger(opts) {
        var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.output, output = _b === void 0 ? exports.defaultOutput : _b, _c = _a.enable, enable = _c === void 0 ? true : _c, _d = _a.prefix, prefix = _d === void 0 ? '' : _d, _e = _a.time, time = _e === void 0 ? true : _e;
        this.opts = {
            output: output,
            enable: enable,
            prefix: prefix,
            time: time,
        };
    }
    Logger.prototype.log = function () {
        var vals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vals[_i] = arguments[_i];
        }
        var opts = this.opts;
        if (opts.enable) {
            opts.output.log(opts, vals);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
exports.defaultLogger = new Logger({
    prefix: 'easyts'
});
//# sourceMappingURL=logger.js.map