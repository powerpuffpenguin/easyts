"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterCombiner = exports.SumCombiner = void 0;
/**
 * An example of a combiner to get the sum of the return values of all slots
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
 * An example of a combiner that processes arguments before passing them to a slot and can determine whether to continue calling subsequent slots
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