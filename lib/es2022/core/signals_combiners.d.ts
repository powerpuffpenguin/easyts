import { Combiner, Slot } from "./signals";
/**
 * An example of a combiner to get the sum of the return values of all slots
 */
export declare class SumCombiner implements Combiner<number, number> {
    private sum_;
    get value(): number;
    before(): void;
    invoke(val: number, iterator: Iterator<Slot<number, number>>): void;
}
export interface FilterValue<T> {
    /**
     * the value passed to the slot
     */
    value: T;
    /**
     * If set to false will stop subsequent slot calls
     */
    next: boolean;
}
export declare type FilterCallback<T> = (val: FilterValue<T>, i: number, solt: Slot<T, any>) => void;
/**
 * An example of a combiner that processes arguments before passing them to a slot and can determine whether to continue calling subsequent slots
 */
export declare class FilterCombiner<T> implements Combiner<T, void> {
    readonly pipe: FilterCallback<T>;
    constructor(pipe: FilterCallback<T>);
    invoke(val: T, iterator: Iterator<Slot<T, void>>): void;
}
