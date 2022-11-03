import { Combiner, Slot } from "./signals"

/**
 * 一個合併器的例子 用於獲取所有插槽的返回值之和
 */
export class SumCombiner implements Combiner<number, number> {
    private sum_ = 0
    get value(): number {
        return this.sum_
    }
    before() {
        this.sum_ = 0
    }
    invoke(val: number, iterator: Iterator<Slot<number, number>>) {
        let sum = 0
        while (true) {
            const value = iterator.next()
            if (value.done) {
                break
            }
            sum += value.value.slot(val)
        }
        this.sum_ = sum
    }
}
export interface FilterValue<T> {
    /**
     * 傳遞給插槽的值
     */
    value: T
    /**
     * 如果設置爲 false 則將停止後續插槽的調用
     */
    next: boolean
}
export type FilterCallback<T> = (val: FilterValue<T>, i: number, solt: Slot<T, any>) => void
/**
 * 一個合併器的例子 在將參數傳遞給插槽前對參數進行處理，並可確定是否要繼續調用後續插槽
 */
export class FilterCombiner<T> implements Combiner<T, void>{
    constructor(public readonly pipe: FilterCallback<T>) { }
    invoke(val: T, iterator: Iterator<Slot<T, void>>): void {
        const pipe = this.pipe
        let pv: FilterValue<T> = {
            value: val,
            next: true,
        }
        let i = 0
        while (true) {
            const value = iterator.next()
            if (value.done) {
                break
            }
            pipe(pv, i++, value.value)
            if (!pv.next) {
                break
            }
            value.value.slot(pv.value)
        }
    }
}
