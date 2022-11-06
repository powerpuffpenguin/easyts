"use strict";
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
class Pair {
    first;
    second;
    c0_;
    c1_;
    constructor(first, second, compareFirst, compareSecond) {
        this.first = first;
        this.second = second;
        this.c0_ = compareFirst;
        this.c1_ = compareSecond;
    }
    compareTo(o) {
        const v = compare(this.first, o.first, this.c0_);
        if (v == 0) {
            return compare(this.second, o.second, this.c1_);
        }
        return v;
    }
    swap(o) {
        [this.c0_, this.c1_, this.first, this.second] = [o.c0_, o.c1_, o.first, o.second];
    }
}
exports.Pair = Pair;
//# sourceMappingURL=types.js.map