class _NoResult implements IteratorReturnResult<any> {
    readonly done = true
    readonly value = undefined
}
export const noResult: IteratorReturnResult<any> = new _NoResult()

export const neverPromise = new Promise<any>(() => { })