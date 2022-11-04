"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = exports.makeSlot = exports.Signals = void 0;
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
class Signals {
    constructor(combiner) {
        this.combiner = combiner;
        this.cons_ = new Array();
    }
    get value() {
        var _a;
        return (_a = this.combiner) === null || _a === void 0 ? void 0 : _a.value;
    }
    /**
     * 返回連接數量
     */
    get length() {
        return this.cons_.length;
    }
    /**
     * 返回是否沒有插槽連接
     */
    get isEmpty() {
        return this.cons_.length == 0;
    }
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    connect(slot, tag) {
        const c = new Connection(this, slot, tag);
        this.cons_.push(c);
        return c;
    }
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    connectSlot(slot, tag) {
        const c = new Connection(this, makeSlot(slot), tag);
        this.cons_.push(c);
        return c;
    }
    /**
     * 產生一個信號以調用所有的 Slot
     * @param val 傳遞給插槽的參數
     * @param combiner 一個臨時的 合併器
     */
    signal(val, combiner) {
        const cons = this.cons_;
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
                for (const c of cons) {
                    c.invoke(val);
                }
            }
        }
    }
    /**
     * 返回一個迭代器 用於遍歷 所有 插槽
     */
    get slots() {
        let i = 0;
        const arrs = this.cons_;
        return {
            next() {
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
    }
    /**
   * 返回一個迭代器 用於遍歷 所有 連接
   */
    get conns() {
        let i = 0;
        const arrs = this.cons_;
        return {
            next() {
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
    }
    /**
     * 斷開 slot 的所有連接
     * @param slot
     */
    disconnectSlot(slot) {
        const cons = this.cons_;
        const last = cons.length - 1;
        for (let i = last; i >= 0; i--) {
            if (cons[i].slot == slot) {
                cons[i].ok_ = false;
                cons.splice(i, 1);
            }
        }
    }
    /**
     * 斷開所有 tag 的連接
     * @param tag
     */
    disconnectTag(tag) {
        const cons = this.cons_;
        const last = cons.length - 1;
        for (let i = last; i >= 0; i--) {
            if (cons[i].tag === tag) {
                cons[i].ok_ = false;
                cons.splice(i, 1);
            }
        }
    }
    disconnectConnection(c) {
        const cons = this.cons_;
        for (let i = 0; i < cons.length; i++) {
            if (c == cons[i]) {
                cons.splice(i, 1);
                break;
            }
        }
    }
    /**
     * 刪除所有插槽
     */
    reset() {
        const cons = this.cons_;
        if (cons.length != 0) {
            for (const c of cons) {
                c.ok_ = false;
            }
            cons.splice(0);
        }
    }
}
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
class _Slot {
    constructor(f) {
        this.f = f;
    }
    slot(val) {
        return this.f(val);
    }
}
/**
 * Signals 和 Slots 之間的連接
 */
class Connection {
    constructor(signals, slot, tag) {
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
    invoke(val) {
        return this.slot.slot(val);
    }
    /**
     * 斷開 Signals 和 Slots 之間的連接
     */
    disconnect() {
        if (this.ok_) {
            this.ok_ = false;
            this.signals.disconnectConnection(this);
        }
    }
}
exports.Connection = Connection;
//# sourceMappingURL=signals.js.map