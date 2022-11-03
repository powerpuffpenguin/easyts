/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export class Signals<T> {
    private cons_ = new Array<Connection<T>>()
    constructor() { }
    /**
     * 返回連接的插槽數量
     */
    get slots(): number {
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
    connect(slot: Slot<T>, tag?: any): Connection<T> {
        const c = new Connection(this, slot, tag)
        this.cons_.push(c)
        return c
    }
    /**
     * 產生一個信號以調用所有的 Slot
     * @param val 
     */
    signal(val: T): any {
        for (const c of this.cons_) {
            c.invoke(val)
        }
    }
    /**
     * 斷開 slot 的所有連接
     * @param slot
     */
    disconnectSlot(slot: Slot<T>) {
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
    disconnectConnection(c: Connection<T>) {
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
        }
    }
}
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export interface Slot<T> {
    slot(val: T): void
}
/**
 * Signals 和 Slots 之間的連接
 */
export class Connection<T> {
    /**
     * @internal
     */
    ok_ = true
    constructor(private readonly signals: Signals<T>,
        public readonly slot: Slot<T>,
        public readonly tag: any,
    ) { }
    /**
     * @internal
     * @param val 
     */
    invoke(val: T) {
        this.slot.slot(val)
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