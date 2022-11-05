/**
 * callback function with no arguments
 */
export type VoidCallback = () => void

/**
 * callback function with one parameter
 */
export type ChangedCallback<T> = (val: T) => void