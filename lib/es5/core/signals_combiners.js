"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterCombiner = exports.SumCombiner = void 0;
/**
 * 一個合併器的例子 用於獲取所有插槽的返回值之和
 */
var SumCombiner = /** @class */ (function () {
    function SumCombiner() {
        this.sum_ = 0;
    }
    Object.defineProperty(SumCombiner.prototype, "value", {
        get: function () {
            return this.sum_;
        },
        enumerable: false,
        configurable: true
    });
    SumCombiner.prototype.before = function () {
        this.sum_ = 0;
    };
    SumCombiner.prototype.invoke = function (val, iterator) {
        var sum = 0;
        while (true) {
            var value = iterator.next();
            if (value.done) {
                break;
            }
            sum += value.value.slot(val);
        }
        this.sum_ = sum;
    };
    return SumCombiner;
}());
exports.SumCombiner = SumCombiner;
/**
 * 一個合併器的例子 在將參數傳遞給插槽前對參數進行處理，並可確定是否要繼續調用後續插槽
 */
var FilterCombiner = /** @class */ (function () {
    function FilterCombiner(pipe) {
        this.pipe = pipe;
    }
    FilterCombiner.prototype.invoke = function (val, iterator) {
        var pipe = this.pipe;
        var pv = {
            value: val,
            next: true,
        };
        var i = 0;
        while (true) {
            var value = iterator.next();
            if (value.done) {
                break;
            }
            pipe(pv, i++, value.value);
            if (!pv.next) {
                break;
            }
            value.value.slot(pv.value);
        }
    };
    return FilterCombiner;
}());
exports.FilterCombiner = FilterCombiner;
//# sourceMappingURL=signals_combiners.js.map