/**
 * An example of a combiner to get the sum of the return values of all slots
 */
export class SumCombiner {
    constructor() {
        this.sum_ = 0;
    }
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
/**
 * An example of a combiner that processes arguments before passing them to a slot and can determine whether to continue calling subsequent slots
 */
export class FilterCombiner {
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
//# sourceMappingURL=signals_combiners.js.map