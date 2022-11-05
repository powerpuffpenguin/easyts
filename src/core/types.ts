/**
 * callback function with no arguments
 */
export type VoidCallback = () => void

/**
 * callback function with one parameter
 */
export type ChangedCallback<T> = (val: T) => void

export class Pair<T0, T1>{
    constructor(public readonly first: T0, public readonly second: T1) {
    }
}