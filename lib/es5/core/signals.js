"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = exports.makeSlot = exports.Signals = void 0;
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
var Signals = /** @class */ (function () {
    function Signals(combiner) {
        this.combiner = combiner;
        this.cons_ = new Array();
    }
    Object.defineProperty(Signals.prototype, "value", {
        get: function () {
            var _a;
            return (_a = this.combiner) === null || _a === void 0 ? void 0 : _a.value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signals.prototype, "length", {
        /**
         * 返回連接數量
         */
        get: function () {
            return this.cons_.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signals.prototype, "isEmpty", {
        /**
         * 返回是否沒有插槽連接
         */
        get: function () {
            return this.cons_.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    Signals.prototype.connect = function (slot, tag) {
        var c = new Connection(this, slot, tag);
        this.cons_.push(c);
        return c;
    };
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    Signals.prototype.connectSlot = function (slot, tag) {
        var c = new Connection(this, makeSlot(slot), tag);
        this.cons_.push(c);
        return c;
    };
    /**
     * 產生一個信號以調用所有的 Slot
     * @param val 傳遞給插槽的參數
     * @param combiner 一個臨時的 合併器
     */
    Signals.prototype.signal = function (val, combiner) {
        var cons = this.cons_;
        if (cons.length != 0) {
            if (!combiner) {
                combiner = this.combiner;
            }
            if (combiner) {
                if (combiner.before) {
                    combiner.before();
                }
                combiner.invoke(val, this.slots);
                if (combiner.after) {
                    combiner.after();
                }
            }
            else {
                for (var _i = 0, cons_1 = cons; _i < cons_1.length; _i++) {
                    var c = cons_1[_i];
                    c.invoke(val);
                }
            }
        }
    };
    Object.defineProperty(Signals.prototype, "slots", {
        /**
         * 返回一個迭代器 用於遍歷 所有 插槽
         */
        get: function () {
            var i = 0;
            var arrs = this.cons_;
            return {
                next: function () {
                    if (i < arrs.length) {
                        return {
                            done: false,
                            value: arrs[i++].slot,
                        };
                    }
                    return {
                        done: true,
                        value: undefined,
                    };
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signals.prototype, "conns", {
        /**
       * 返回一個迭代器 用於遍歷 所有 連接
       */
        get: function () {
            var i = 0;
            var arrs = this.cons_;
            return {
                next: function () {
                    if (i < arrs.length) {
                        return {
                            done: false,
                            value: arrs[i++],
                        };
                    }
                    return {
                        done: true,
                        value: undefined,
                    };
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 斷開 slot 的所有連接
     * @param slot
     */
    Signals.prototype.disconnectSlot = function (slot) {
        var cons = this.cons_;
        var last = cons.length - 1;
        for (var i = last; i >= 0; i--) {
            if (cons[i].slot == slot) {
                cons[i].ok_ = false;
                cons.splice(i, 1);
            }
        }
    };
    /**
     * 斷開所有 tag 的連接
     * @param tag
     */
    Signals.prototype.disconnectTag = function (tag) {
        var cons = this.cons_;
        var last = cons.length - 1;
        for (var i = last; i >= 0; i--) {
            if (cons[i].tag === tag) {
                cons[i].ok_ = false;
                cons.splice(i, 1);
            }
        }
    };
    Signals.prototype.disconnectConnection = function (c) {
        var cons = this.cons_;
        for (var i = 0; i < cons.length; i++) {
            if (c == cons[i]) {
                cons.splice(i, 1);
                break;
            }
        }
    };
    /**
     * 刪除所有插槽
     */
    Signals.prototype.reset = function () {
        var cons = this.cons_;
        if (cons.length != 0) {
            for (var _i = 0, cons_2 = cons; _i < cons_2.length; _i++) {
                var c = cons_2[_i];
                c.ok_ = false;
            }
            cons.splice(0);
        }
    };
    return Signals;
}());
exports.Signals = Signals;
/**
 * 由 函數 創建插槽
 * @param f
 * @returns
 */
function makeSlot(f) {
    return new _Slot(f);
}
exports.makeSlot = makeSlot;
var _Slot = /** @class */ (function () {
    function _Slot(f) {
        this.f = f;
    }
    _Slot.prototype.slot = function (val) {
        return this.f(val);
    };
    return _Slot;
}());
/**
 * Signals 和 Slots 之間的連接
 */
var Connection = /** @class */ (function () {
    function Connection(signals, slot, tag) {
        this.signals = signals;
        this.slot = slot;
        this.tag = tag;
        /**
         * @internal
         */
        this.ok_ = true;
    }
    /**
     * @internal
     * @param val
     */
    Connection.prototype.invoke = function (val) {
        return this.slot.slot(val);
    };
    /**
     * 斷開 Signals 和 Slots 之間的連接
     */
    Connection.prototype.disconnect = function () {
        if (this.ok_) {
            this.ok_ = false;
            this.signals.disconnectConnection(this);
        }
    };
    return Connection;
}());
exports.Connection = Connection;
//# sourceMappingURL=signals.js.map