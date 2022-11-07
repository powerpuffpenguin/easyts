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

/**
 * A completed Promise is usually used to notify the caller immediately
 */
export const resolvePromise: Promise<any> = Promise.resolve()
/**
 * This function does nothing and can usually be used as the default handler for something
 */
export function nopCallback(): void { }