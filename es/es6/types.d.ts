export declare type Constructor<T> = new (...args: any[]) => T;
/**
 * callback function with no arguments
 */
export declare type VoidCallback = () => void;
/**
* callback function with no arguments
*/
export declare type AsyncVoidCallback = () => Promise<void>;
/**
 * callback function with one parameter
 */
export declare type ValueCallback<T> = (val: T) => void;
/**
* Usually called before destroying the object, this function should not throw any exception, otherwise the behavior will be unknown
*/
export declare type DeleteCallback<T> = (val: T) => void;
/**
 * Is the return value valid?
 */
export declare type ValidCallback<T> = (val: T) => boolean;
/**
 * How to transform data
 */
export declare type MapCallback<TF, TO> = (data: TF) => TO;
/**
 * How to copy data
 */
export declare type CloneCallback<T> = (data: T) => T;
/**
 * How to compare element sizes
 *
 * @example
 * ```
 * return l == r ? 0 : ( l < r ? -1 : 1)
 * ```
 */
export declare type CompareCallback<T> = (l: T, r: T) => number;
export declare function compare<T>(l: T, r: T, c?: CompareCallback<T>): number;
export interface Comparable<T> {
    compareTo(o: Comparable<T>): number;
}
export interface Swappable<T> {
    swap(o: Swappable<T>): void;
}
export declare class Pair<T0, T1> implements Comparable<Pair<T0, T1>>, Swappable<Pair<T0, T1>> {
    first: T0;
    second: T1;
    private c0_?;
    private c1_?;
    constructor(first: T0, second: T1, compareFirst?: CompareCallback<T0>, compareSecond?: CompareCallback<T1>);
    compareTo(o: Pair<T0, T1>): number;
    swap(o: Pair<T0, T1>): void;
}
export declare type ReturnValue<T> = undefined | T;
export declare type ReturnValueRaw<T> = [undefined, false] | [T, true];
