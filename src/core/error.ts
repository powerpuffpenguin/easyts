export interface CauseLike {
    code: number | bigint | string
    error?: Error
    message?: string
}

export function isCause(cause: any, ...targets: Array<CauseLike>): boolean {
    while (typeof cause === "object") {
        for (const t of targets) {
            if (cause.code === t.code) {
                return true
            }
        }

        if (typeof cause.unwrap === "function") {
            cause = cause.unwrap()
        } else {
            break
        }
    }
    return false
}
export interface AsCauseResult {
    target: CauseLike
    value: CauseLike
}
export function asCause(cause: any, ...targets: Array<CauseLike>): undefined | AsCauseResult {
    while (typeof cause === "object") {
        for (const t of targets) {
            if (cause.code === t.code) {
                return {
                    target: t,
                    value: cause,
                }
            }
        }
        if (typeof cause.unwrap === "function") {
            cause = cause.unwrap()
        } else {
            break
        }
    }
    return
}