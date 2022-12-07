import { VoidCallback } from "./types";
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
    before?: VoidCallback;
    /**
     * Called after each execution of the combiner
     */
    after?: VoidCallback;
    /**
     * Execute the combiner
     * @param val
     * @param iterator
     */
    invoke(val: T, iterator: Iterator<Slot<T, TR>>): void;
    /**
     * Returns the final return value of the slot after the last signal is generated
     */
    readonly value?: TR;
}
/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
export declare class Signals<T, TR> {
    readonly combiner?: Combiner<T, TR> | undefined;
    /**
     * Connected Signals/Slots
     */
    private cons_;
    constructor(combiner?: Combiner<T, TR> | undefined);
    /**
     * If there is a combiner, return the latest value of the combiner
     */
    get value(): TR | undefined;
    /**
     * Returns the number of connections
     */
    get length(): number;
    /**
     * if there is no connections return it rue
     */
    get isEmpty(): boolean;
    /**
     * connect Slots to Signals
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    connect(slot: Slot<T, TR>, tag?: any): Connection<T, TR>;
    /**
     * connect Signals/Slots
     * @param slot
     * @param tag Slots group tag name
     * @returns
     */
    connectSlot(slot: SlotCallback<T, TR>, tag?: any): Connection<T, TR>;
    /**
     * Generate a signal to call all Slots
     * @param val Parameters passed to the slot
     * @param combiner a temporary combiner
     */
    signal(val: T, combiner?: Combiner<T, TR>): void;
    /**
     * Returns an iterator to iterate over all slots
     */
    get slots(): Iterator<Slot<T, TR>>;
    /**
    * Returns an iterator to iterate over all connections
    */
    get conns(): Iterator<Connection<T, TR>>;
    /**
     * Disconnect all connections from slot to this signals
     * @param slot
     */
    disconnectSlot(slot: Slot<T, TR>): void;
    /**
     * Disconnect all tags
     * @param tag
     */
    disconnectTag(tag: any): void;
    /**
     * delete all slots
     */
    reset(): void;
}
/**
 * Signals/Slots, you can associate multiple Slots with Signals, when Signals generate signals, Slots will be called in turn
 */
export interface Slot<T, TR> {
    slot(val: T): TR;
}
export declare type SlotCallback<T, TR> = (val: T) => TR;
/**
 * Create a slot by a function
 * @param f
 * @returns
 */
export declare function makeSlot<T, TR>(f: SlotCallback<T, TR>): Slot<T, TR>;
/**
 * Connection between Signals and Slots
 */
export declare class Connection<T, TR> {
    private readonly signals;
    readonly slot: Slot<T, TR>;
    readonly tag: any;
    constructor(signals: Signals<T, TR>, slot: Slot<T, TR>, tag: any);
    /**
     * Disconnect between Signals and Slots
     */
    disconnect(): void;
}
