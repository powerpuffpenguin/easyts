import { VoidCallback } from "./types"
/**
 * 合併器用於獲取插槽的返回值,以及確定是否要繼續調用後續的插槽
 */
export interface Combiner<T, TR> {
    before?: VoidCallback
    after?: VoidCallback
    /**
     * 
     * @param val 
     * @param iterator 
     */
    invoke(val: T, iterator: Iterator<Slot<T, TR>>): void
    /**
     * 返回最近一次信號產生，調用完插槽的最終返回值
     */
    readonly value?: TR
}
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export class Signals<T, TR> {
    private cons_ = new Array<Connection<T, TR>>()
    constructor(public readonly combiner?: Combiner<T, TR>) { }
    get value(): TR | undefined {
        return this.combiner?.value
    }
    /**
     * 返回連接數量
     */
    get length(): number {
        return this.cons_.length
    }
    /**
     * 返回是否沒有插槽連接
     */
    get isEmpty(): boolean {
        return this.cons_.length == 0
    }
    /**
     * 連接 Signals/Slots
     * @param slot 
     * @param tag 自定義的分組標籤
     * @returns 
     */
    connect(slot: Slot<T, TR>, tag?: any): Connection<T, TR> {
        const c = new Connection(this, slot, tag)
        this.cons_.push(c)
        return c
    }
    /**
     * 連接 Signals/Slots
     * @param slot 
     * @param tag 自定義的分組標籤
     * @returns 
     */
    connectSlot(slot: SlotCallback<T, TR>, tag?: any): Connection<T, TR> {
        const c = new Connection(this, makeSlot(slot), tag)
        this.cons_.push(c)
        return c
    }
    /**
     * 產生一個信號以調用所有的 Slot
     * @param val 傳遞給插槽的參數
     * @param combiner 一個臨時的 合併器
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
     * 返回一個迭代器 用於遍歷 所有 插槽
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
   * 返回一個迭代器 用於遍歷 所有 連接
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
     * 斷開 slot 的所有連接
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
     * 斷開所有 tag 的連接
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
     * 刪除所有插槽
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
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export interface Slot<T, TR> {
    slot(val: T): TR
}
export type SlotCallback<T, TR> = (val: T) => TR
/**
 * 由 函數 創建插槽
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
 * Signals 和 Slots 之間的連接
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
     * 斷開 Signals 和 Slots 之間的連接
     */
    disconnect() {
        if (this.ok_) {
            this.ok_ = false
            this.signals.disconnectConnection(this)
        }
    }
}