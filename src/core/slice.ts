function formatUint(v: number | undefined) {
    if (!v) {
        return 0
    }
    v = Math.floor(v)
    if (!isFinite(length) || length < 0) {
        return 0
    }
    return v
}
export class Slice<T> {
    static make<T>(length: number, capacity: number): Slice<T> {
        return new Slice<T>(length, capacity)
    }
    private a_: Array<T>
    private constructor(length?: number, capacity?: number, a?: Array<T>) {
        if (Array.isArray(a)) {
            this.a_ = a
            return
        }
        length = length === undefined ? 128 : formatUint(length)
        capacity = capacity === undefined ? 128 : formatUint(capacity)
        this.a_ = new Array<T>(capacity)
    }
}