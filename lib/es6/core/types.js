export function compare(l, r, c) {
    if (c) {
        return c(l, r);
    }
    if (l === r) {
        return 0;
    }
    return l < r ? -1 : 1;
}
export class Pair {
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
//# sourceMappingURL=types.js.map