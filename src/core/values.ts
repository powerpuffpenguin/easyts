class _NoResult implements IteratorReturnResult<any> {
    readonly done = true
    readonly value = undefined
}
/**
 * Explicitly means no value
 */
export const noResult: IteratorReturnResult<any> = new _NoResult()
/**
 * An Promise that will never finish
 */
export const neverPromise = new Promise<any>(() => { })