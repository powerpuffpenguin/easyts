import { Combiner, Slot } from "./signals"

/**
 * An example of a combiner to get the sum of the return values of all slots
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
     * the value passed to the slot
     */
    value: T
    /**
     * If set to false will stop subsequent slot calls
     */
    next: boolean
}
export type FilterCallback<T> = (val: FilterValue<T>, i: number, solt: Slot<T, any>) => void
/**
 * An example of a combiner that processes arguments before passing them to a slot and can determine whether to continue calling subsequent slots
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
