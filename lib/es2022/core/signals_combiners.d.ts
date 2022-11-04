import { Combiner, Slot } from "./signals";
/**
 * 一個合併器的例子 用於獲取所有插槽的返回值之和
 */
export declare class SumCombiner implements Combiner<number, number> {
    private sum_;
    get value(): number;
    before(): void;
    invoke(val: number, iterator: Iterator<Slot<number, number>>): void;
}
export interface FilterValue<T> {
    /**
     * 傳遞給插槽的值
     */
    value: T;
    /**
     * 如果設置爲 false 則將停止後續插槽的調用
     */
    next: boolean;
}
export declare type FilterCallback<T> = (val: FilterValue<T>, i: number, solt: Slot<T, any>) => void;
/**
 * 一個合併器的例子 在將參數傳遞給插槽前對參數進行處理，並可確定是否要繼續調用後續插槽
 */
export declare class FilterCombiner<T> implements Combiner<T, void> {
    readonly pipe: FilterCallback<T>;
    constructor(pipe: FilterCallback<T>);
    invoke(val: T, iterator: Iterator<Slot<T, void>>): void;
}
