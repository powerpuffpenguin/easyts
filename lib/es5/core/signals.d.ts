import { VoidCallback } from "./types";
/**
 * 合併器用於獲取插槽的返回值,以及確定是否要繼續調用後續的插槽
 */
export interface Combiner<T, TR> {
    before?: VoidCallback;
    after?: VoidCallback;
    /**
     *
     * @param val
     * @param iterator
     */
    invoke(val: T, iterator: Iterator<Slot<T, TR>>): void;
    /**
     * 返回最近一次信號產生，調用完插槽的最終返回值
     */
    readonly value?: TR;
}
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export declare class Signals<T, TR> {
    readonly combiner?: Combiner<T, TR> | undefined;
    private cons_;
    constructor(combiner?: Combiner<T, TR> | undefined);
    get value(): TR | undefined;
    /**
     * 返回連接數量
     */
    get length(): number;
    /**
     * 返回是否沒有插槽連接
     */
    get isEmpty(): boolean;
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    connect(slot: Slot<T, TR>, tag?: any): Connection<T, TR>;
    /**
     * 連接 Signals/Slots
     * @param slot
     * @param tag 自定義的分組標籤
     * @returns
     */
    connectSlot(slot: SlotCallback<T, TR>, tag?: any): Connection<T, TR>;
    /**
     * 產生一個信號以調用所有的 Slot
     * @param val 傳遞給插槽的參數
     * @param combiner 一個臨時的 合併器
     */
    signal(val: T, combiner?: Combiner<T, TR>): void;
    /**
     * 返回一個迭代器 用於遍歷 所有 插槽
     */
    get slots(): Iterator<Slot<T, TR>>;
    /**
   * 返回一個迭代器 用於遍歷 所有 連接
   */
    get conns(): Iterator<Connection<T, TR>>;
    /**
     * 斷開 slot 的所有連接
     * @param slot
     */
    disconnectSlot(slot: Slot<T, TR>): void;
    /**
     * 斷開所有 tag 的連接
     * @param tag
     */
    disconnectTag(tag: any): void;
    disconnectConnection(c: Connection<T, TR>): void;
    /**
     * 刪除所有插槽
     */
    reset(): void;
}
/**
 * Signals/Slots ,可以將多個 Slots 與 Signals 關聯，當 Signals 產生信號時 Slots 會被依次調用
 */
export interface Slot<T, TR> {
    slot(val: T): TR;
}
export declare type SlotCallback<T, TR> = (val: T) => TR;
/**
 * 由 函數 創建插槽
 * @param f
 * @returns
 */
export declare function makeSlot<T, TR>(f: SlotCallback<T, TR>): Slot<T, TR>;
/**
 * Signals 和 Slots 之間的連接
 */
export declare class Connection<T, TR> {
    private readonly signals;
    readonly slot: Slot<T, TR>;
    readonly tag: any;
    constructor(signals: Signals<T, TR>, slot: Slot<T, TR>, tag: any);
    /**
     * 斷開 Signals 和 Slots 之間的連接
     */
    disconnect(): void;
}
