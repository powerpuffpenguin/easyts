"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = exports.makeSlot = exports.Signals = void 0;
/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
var Signals = /** @class */ (function () {
    function Signals(combiner) {
        this.combiner = combiner;
        /**
         * Connected Signals/Slots
         */
        this.cons_ = new Array();
    }
    Object.defineProperty(Signals.prototype, "value", {
        /**
         * If there is a combiner, return the latest value of the combiner
         */
        get: function () {
            var _a;
            return (_a = this.combiner) === null || _a === void 0 ? void 0 : _a.value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signals.prototype, "length", {
        /**
         * Returns the number of connections
         */
        get: function () {
            return this.cons_.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Signals.prototype, "isEmpty", {
        /**
         * if there is no connections return it rue
         */
        get: function () {
            return this.cons_.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * connect Slots to Signals
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    Signals.prototype.connect = function (slot, tag) {
        var c = new Connection(this, slot, tag);
        this.cons_.push(c);
        return c;
    };
    /**
     * connect Signals/Slots
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    Signals.prototype.connectSlot = function (slot, tag) {
        var c = new Connection(this, makeSlot(slot), tag);
        this.cons_.push(c);
        return c;
    };
    /**
     * Generate a signal to call all Slots
     * @param val Parameters passed to the slot
     * @param combiner a temporary combiner
     */
    Signals.prototype.signal = function (val, combiner) {
        var e_1, _a;
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
                try {
                    for (var cons_1 = __values(cons), cons_1_1 = cons_1.next(); !cons_1_1.done; cons_1_1 = cons_1.next()) {
                        var c = cons_1_1.value;
                        c.invoke(val);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (cons_1_1 && !cons_1_1.done && (_a = cons_1.return)) _a.call(cons_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
    };
    Object.defineProperty(Signals.prototype, "slots", {
        /**
         * Returns an iterator to iterate over all slots
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
        * Returns an iterator to iterate over all connections
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
     * Disconnect all connections from slot to this signals
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
     * Disconnect all tags
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
    /**
     * @internal
     */
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
     * delete all slots
     */
    Signals.prototype.reset = function () {
        var e_2, _a;
        var cons = this.cons_;
        if (cons.length != 0) {
            try {
                for (var cons_2 = __values(cons), cons_2_1 = cons_2.next(); !cons_2_1.done; cons_2_1 = cons_2.next()) {
                    var c = cons_2_1.value;
                    c.ok_ = false;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (cons_2_1 && !cons_2_1.done && (_a = cons_2.return)) _a.call(cons_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            cons.splice(0);
        }
    };
    return Signals;
}());
exports.Signals = Signals;
/**
 * Create a slot by a function
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
 * Connection between Signals and Slots
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
     * Disconnect between Signals and Slots
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