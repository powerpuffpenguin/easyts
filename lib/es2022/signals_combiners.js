"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterCombiner = exports.SumCombiner = void 0;
/**
 * An example of a combiner to get the sum of the return values of all slots
 */
class SumCombiner {
    sum_ = 0;
    get value() {
        return this.sum_;
    }
    before() {
        this.sum_ = 0;
    }
    invoke(val, iterator) {
        let sum = 0;
        while (true) {
            const value = iterator.next();
            if (value.done) {
                break;
            }
            sum += value.value.slot(val);
        }
        this.sum_ = sum;
    }
}
exports.SumCombiner = SumCombiner;
/**
 * An example of a combiner that processes arguments before passing them to a slot and can determine whether to continue calling subsequent slots
 */
class FilterCombiner {
    pipe;
    constructor(pipe) {
        this.pipe = pipe;
    }
    invoke(val, iterator) {
        const pipe = this.pipe;
        let pv = {
            value: val,
            next: true,
        };
        let i = 0;
        while (true) {
            const value = iterator.next();
            if (value.done) {
                break;
            }
            pipe(pv, i++, value.value);
            if (!pv.next) {
                break;
            }
            value.value.slot(pv.value);
        }
    }
}
exports.FilterCombiner = FilterCombiner;
//# sourceMappingURL=signals_combiners.js.map