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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pair = exports.compare = void 0;
function compare(l, r, c) {
    if (c) {
        return c(l, r);
    }
    if (l === r) {
        return 0;
    }
    return l < r ? -1 : 1;
}
exports.compare = compare;
var Pair = /** @class */ (function () {
    function Pair(first, second, compareFirst, compareSecond) {
        this.first = first;
        this.second = second;
        this.c0_ = compareFirst;
        this.c1_ = compareSecond;
    }
    Pair.prototype.compareTo = function (o) {
        var v = compare(this.first, o.first, this.c0_);
        if (v == 0) {
            return compare(this.second, o.second, this.c1_);
        }
        return v;
    };
    Pair.prototype.swap = function (o) {
        var _a;
        _a = __read([o.c0_, o.c1_, o.first, o.second], 4), this.c0_ = _a[0], this.c1_ = _a[1], this.first = _a[2], this.second = _a[3];
    };
    return Pair;
}());
exports.Pair = Pair;
//# sourceMappingURL=types.js.map