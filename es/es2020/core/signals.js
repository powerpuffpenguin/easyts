/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
export class Signals {
    constructor(combiner) {
        this.combiner = combiner;
        /**
         * Connected Signals/Slots
         */
        this.cons_ = new Array();
    }
    /**
     * If there is a combiner, return the latest value of the combiner
     */
    get value() {
        return this.combiner?.value;
    }
    /**
     * Returns the number of connections
     */
    get length() {
        return this.cons_.length;
    }
    /**
     * if there is no connections return it rue
     */
    get isEmpty() {
        return this.cons_.length == 0;
    }
    /**
     * connect Slots to Signals
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    connect(slot, tag) {
        const c = new Connection(this, slot, tag);
        this.cons_.push(c);
        return c;
    }
    /**
     * connect Signals/Slots
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    connectSlot(slot, tag) {
        const c = new Connection(this, makeSlot(slot), tag);
        this.cons_.push(c);
        return c;
    }
    /**
     * Generate a signal to call all Slots
     * @param val Parameters passed to the slot
     * @param combiner a temporary combiner
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
     * Returns an iterator to iterate over all slots
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
    * Returns an iterator to iterate over all connections
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
     * Disconnect all connections from slot to this signals
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
     * Disconnect all tags
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
    /**
     * @internal
     */
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
     * delete all slots
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
/**
 * Create a slot by a function
 * @param f
 * @returns
 */
export function makeSlot(f) {
    return new _Slot(f);
}
class _Slot {
    constructor(f) {
        this.f = f;
    }
    slot(val) {
        return this.f(val);
    }
}
/**
 * Connection between Signals and Slots
 */
export class Connection {
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
     * Disconnect between Signals and Slots
     */
    disconnect() {
        if (this.ok_) {
            this.ok_ = false;
            this.signals.disconnectConnection(this);
        }
    }
}
//# sourceMappingURL=signals.js.map