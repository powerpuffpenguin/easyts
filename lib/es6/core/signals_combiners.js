"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterCombiner = exports.SumCombiner = void 0;
/**
 * 一個合併器的例子 用於獲取所有插槽的返回值之和
 */
class SumCombiner {
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
exports.SumCombiner = SumCombiner;
/**
 * 一個合併器的例子 在將參數傳遞給插槽前對參數進行處理，並可確定是否要繼續調用後續插槽
 */
class FilterCombiner {
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