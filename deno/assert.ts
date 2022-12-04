export interface Assert {
    val: any
    name?: string
    message?: string
}
export interface AssertNumber extends Assert {
    min?: number
    max?: number
}
export function throwType(val: Assert, typeName: string): never {
    if (val.message !== undefined) {
        throw new TypeError(val.message)
    }
    if (val.name === undefined) {
        throw new TypeError(`expects ${typeName} type`)
    }
    throw `argument '${val.name}' expects ${typeName} type`
}
export function throwNumber(val: AssertNumber, typeName: string, min: boolean): never {
    if (val.message !== undefined) {
        throw new RangeError(val.message)
    }
    if (min) {
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value >= ${val.min}, but it = ${JSON.stringify(val.val)}`)
        }
        throw new RangeError(`argument ${val.name} expects ${typeName} value >= ${val.min}, but it = ${JSON.stringify(val.val)}`)
    } else {
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value <= ${val.max}, but it = ${JSON.stringify(val.val)}`)
        }
        throw new RangeError(`argument ${val.name} expects ${typeName} value <= ${val.max}, but it = ${JSON.stringify(val.val)}`)
    }
}
export function assertNumber(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isFinite(v)) {
            if (Number.isFinite(val.min)) {
                if (v < val.min!) {
                    throwNumber(val, "number", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (v > val.max!) {
                    throwNumber(val, "number", false)
                }
            }
        } else {
            throwType(val, "number")
        }
    }
}
export function assertInt(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isSafeInteger(v)) {
            if (Number.isFinite(val.min)) {
                if (v < val.min!) {
                    throwNumber(val, "int", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (v > val.max!) {
                    throwNumber(val, "int", false)
                }
            }
        } else {
            throwType(val, "int")
        }
    }
}
export function assertUInt(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isSafeInteger(v) && v >= 0) {
            if (Number.isFinite(val.min)) {
                if (v < val.min!) {
                    throwNumber(val, "uint", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (v > val.max!) {
                    throwNumber(val, "uint", false)
                }
            }
        } else {
            throwType(val, "uint")
        }
    }
}
export type AssertCallback = (val: Assert) => void
export function assertAny(assert: AssertCallback, ...vals: Array<Assert>) {
    for (const v of vals) {
        assert(v)
    }
}