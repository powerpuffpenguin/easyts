class _NoResult implements IteratorReturnResult<any> {
    readonly done = true
    readonly value = undefined
}
export const NoResult: IteratorReturnResult<any> = new _NoResult()