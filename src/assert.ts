export interface Assert {
    val: any
    name?: string
    message?: string
}
export interface AssertNumber extends Assert {
    min?: number
    max?: number
    notMin?: boolean
    notMax?: boolean
}
/**
 * @throws {@link TypeError}
 */
export function throwType(val: Assert, typeName: string): never {
    if (val.message !== undefined) {
        throw new TypeError(val.message)
    }
    if (val.name === undefined) {
        throw new TypeError(`expects ${typeName} type`)
    }
    throw new TypeError(`argument '${val.name}' expects ${typeName} type`)
}
/**
 * @throws {@link RangeError}
 */
export function throwNumber(val: AssertNumber, typeName: string, min: boolean): never {
    if (val.message !== undefined) {
        throw new RangeError(val.message)
    }
    if (min) {
        const op = val.notMin ? '>' : ">="
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value ${op} ${val.min}, but it = ${JSON.stringify(val.val)}`)
        }
        throw new RangeError(`argument '${val.name}' expects ${typeName} value ${op} ${val.min}, but it = ${JSON.stringify(val.val)}`)
    } else {
        const op = val.notMax ? '<' : "<="
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value ${op} ${val.max}, but it = ${JSON.stringify(val.val)}`)
        }
        throw new RangeError(`argument '${val.name}' expects ${typeName} value ${op} ${val.max}, but it = ${JSON.stringify(val.val)}`)
    }
}
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export function assertNumber(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isFinite(v)) {
            if (Number.isFinite(val.min)) {
                if (val.notMin ? v <= val.min! : v < val.min!) {
                    throwNumber(val, "number", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (val.notMax ? v >= val.max! : v > val.max!) {
                    throwNumber(val, "number", false)
                }
            }
        } else {
            throwType(val, "number")
        }
    }
}
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export function assertInt(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isSafeInteger(v)) {
            if (Number.isFinite(val.min)) {
                if (val.notMin ? v <= val.min! : v < val.min!) {
                    throwNumber(val, "int", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (val.notMax ? v >= val.max! : v > val.max!) {
                    throwNumber(val, "int", false)
                }
            }
        } else {
            throwType(val, "int")
        }
    }
}

/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export function assertUInt(...vals: Array<AssertNumber>) {
    for (const val of vals) {
        const v = val.val
        if (Number.isSafeInteger(v) && v >= 0) {
            if (Number.isFinite(val.min)) {
                if (val.notMin ? v <= val.min! : v < val.min!) {
                    throwNumber(val, "uint", true)
                }
            }
            if (Number.isFinite(val.max)) {
                if (val.notMax ? v >= val.max! : v > val.max!) {
                    throwNumber(val, "uint", false)
                }
            }
        } else {
            throwType(val, "uint")
        }
    }
}
export type AssertCallback = (val: Assert) => void
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export function assertAny(assert: AssertCallback, ...vals: Array<Assert>) {
    for (const v of vals) {
        assert(v)
    }
}