import { VoidCallback } from "./types"
/**
 * sadsaasdsa
 */

/**
 * The combiner is used to obtain the return value of the slot, and to determine whether to continue calling subsequent slots
 */
export interface Combiner<T, TR> {
    /**
     * Called before each execution of the combiner
     */
    before?: VoidCallback
    /**
     * Called after each execution of the combiner
     */
    after?: VoidCallback
    /**
     * Execute the combiner
     * @param val 
     * @param iterator 
     */
    invoke(val: T, iterator: Iterator<Slot<T, TR>>): void
    /**
     * Returns the final return value of the slot after the last signal is generated
     */
    readonly value?: TR
}
/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
export class Signals<T, TR> {
    /**
     * Connected Signals/Slots
     */
    private cons_ = new Array<Connection<T, TR>>()
    constructor(public readonly combiner?: Combiner<T, TR>) { }
    /**
     * If there is a combiner, return the latest value of the combiner
     */
    get value(): TR | undefined {
        return this.combiner?.value
    }
    /**
     * Returns the number of connections
     */
    get length(): number {
        return this.cons_.length
    }
    /**
     * if there is no connections return it rue
     */
    get isEmpty(): boolean {
        return this.cons_.length == 0
    }
    /**
     * connect Slots to Signals
     * @param slot 
     * @param tag Slots group tag name
     * @returns 
     */
    connect(slot: Slot<T, TR>, tag?: any): Connection<T, TR> {
        const c = new Connection(this, slot, tag)
        this.cons_.push(c)
        return c
    }
    /**
     * connect Signals/Slots
     * @param slot 
     * @param tag Slots group tag name
     * @returns 
     */
    connectSlot(slot: SlotCallback<T, TR>, tag?: any): Connection<T, TR> {
        const c = new Connection(this, makeSlot(slot), tag)
        this.cons_.push(c)
        return c
    }
    /**
     * Generate a signal to call all Slots
     * @param val Parameters passed to the slot
     * @param combiner a temporary combiner
     */
    signal(val: T, combiner?: Combiner<T, TR>): void {
        const cons = this.cons_
        if (cons.length != 0) {
            if (!combiner) {
                combiner = this.combiner
            }
            if (combiner) {
                if (combiner.before) {
                    combiner.before()
                }
                combiner.invoke(val, this.slots)
                if (combiner.after) {
                    combiner.after()
                }
            } else {
                for (const c of cons) {
                    c.invoke(val)
                }
            }
        }
    }
    /**
     * Returns an iterator to iterate over all slots
     */
    get slots(): Iterator<Slot<T, TR>> {
        let i = 0
        const arrs = this.cons_
        return {
            next(): IteratorResult<Slot<T, TR>> {
                if (i < arrs.length) {
                    return {
                        done: false,
                        value: arrs[i++].slot,
                    }
                }
                return {
                    done: true,
                    value: undefined,
                }
            }
        }
    }
    /**
    * Returns an iterator to iterate over all connections
    */
    get conns(): Iterator<Connection<T, TR>> {
        let i = 0
        const arrs = this.cons_
        return {
            next(): IteratorResult<Connection<T, TR>> {
                if (i < arrs.length) {
                    return {
                        done: false,
                        value: arrs[i++],
                    }
                }
                return {
                    done: true,
                    value: undefined,
                }
            }
        }
    }
    /**
     * Disconnect all connections from slot to this signals
     * @param slot
     */
    disconnectSlot(slot: Slot<T, TR>) {
        const cons = this.cons_
        const last = cons.length - 1
        for (let i = last; i >= 0; i--) {
            if (cons[i].slot == slot) {
                cons[i].ok_ = false
                cons.splice(i, 1)
            }
        }
    }
    /**
     * Disconnect all tags
     * @param tag
     */
    disconnectTag(tag: any) {
        const cons = this.cons_
        const last = cons.length - 1
        for (let i = last; i >= 0; i--) {
            if (cons[i].tag === tag) {
                cons[i].ok_ = false
                cons.splice(i, 1)
            }
        }
    }
    /**
     * @internal
     */
    disconnectConnection(c: Connection<T, TR>) {
        const cons = this.cons_
        for (let i = 0; i < cons.length; i++) {
            if (c == cons[i]) {
                cons.splice(i, 1)
                break
            }
        }
    }
    /**
     * delete all slots
     */
    reset() {
        const cons = this.cons_
        if (cons.length != 0) {
            for (const c of cons) {
                c.ok_ = false
            }
            cons.splice(0)
        }
    }
}
/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
export interface Slot<T, TR> {
    slot(val: T): TR
}
export type SlotCallback<T, TR> = (val: T) => TR
/**
 * Create a slot by a function
 * @param f 
 * @returns 
 */
export function makeSlot<T, TR>(f: SlotCallback<T, TR>): Slot<T, TR> {
    return new _Slot(f)
}
class _Slot<T, TR> {
    constructor(private readonly f: SlotCallback<T, TR>
    ) { }
    slot(val: T): TR {
        return this.f(val)
    }
}
/**
 * Connection between Signals and Slots
 */
export class Connection<T, TR> {
    /**
     * @internal
     */
    ok_ = true
    constructor(private readonly signals: Signals<T, TR>,
        public readonly slot: Slot<T, TR>,
        public readonly tag: any,
    ) { }
    /**
     * @internal
     * @param val 
     */
    invoke(val: T): TR {
        return this.slot.slot(val)
    }
    /**
     * Disconnect between Signals and Slots
     */
    disconnect() {
        if (this.ok_) {
            this.ok_ = false
            this.signals.disconnectConnection(this)
        }
    }
}