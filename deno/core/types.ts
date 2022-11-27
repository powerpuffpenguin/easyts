/**
 * callback function with no arguments
 */
export type VoidCallback = () => void

/**
 * callback function with one parameter
 */
export type ValueCallback<T> = (val: T) => void

/**
* Usually called before destroying the object, this function should not throw any exception, otherwise the behavior will be unknown
*/
export type DeleteCallback<T> = (val: T) => void

/**
 * Is the return value valid?
 */
export type ValidCallback<T> = (val: T) => boolean
/**
 * How to transform data
 */
export type MapCallback<TF, TO> = (data: TF) => TO
/**
 * How to copy data
 */
export type CloneCallback<T> = (data: T) => T

/**
 * How to compare element sizes
 * 
 * @example
 * ```
 * return l == r ? 0 : ( l < r ? -1 : 1)
 * ```
 */
export type CompareCallback<T> = (l: T, r: T) => number
export function compare<T>(l: T, r: T, c?: CompareCallback<T>): number {
    if (c) {
        return c(l, r)
    }
    if (l === r) {
        return 0
    }
    return l < r ? -1 : 1
}
export interface Comparable<T> {
    compareTo(o: Comparable<T>): number
}
export interface Swappable<T> {
    swap(o: Swappable<T>): void
}
export class Pair<T0, T1> implements Comparable<Pair<T0, T1>>, Swappable<Pair<T0, T1>> {
    private c0_?: CompareCallback<T0>
    private c1_?: CompareCallback<T1>
    constructor(public first: T0,
        public second: T1,
        compareFirst?: CompareCallback<T0>,
        compareSecond?: CompareCallback<T1>,
    ) {
        this.c0_ = compareFirst
        this.c1_ = compareSecond
    }
    compareTo(o: Pair<T0, T1>): number {
        const v = compare(this.first, o.first, this.c0_)
        if (v == 0) {
            return compare(this.second, o.second, this.c1_)
        }
        return v
    }
    swap(o: Pair<T0, T1>) {
        [this.c0_, this.c1_, this.first, this.second] = [o.c0_, o.c1_, o.first, o.second]
    }
}