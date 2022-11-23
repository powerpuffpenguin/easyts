import { Exception } from '../core/exception.ts'

export const errBadPattern = new Exception("syntax error in pattern")

function scanChunk(pattern: string): Array<any> {
    let star = false
    while (pattern.length > 0 && pattern[0] == '*') {
        pattern = pattern.substring(1)
        star = true
    }
    let inrange = false
    let i = 0
    Scan:
    for (i = 0; i < pattern.length; i++) {
        switch (pattern[i]) {
            case '\\':
                // error check handled in matchChunk: bad pattern.
                if (i + 1 < pattern.length) {
                    i++
                }
                break
            case '[':
                inrange = true
                break
            case ']':
                inrange = false
                break
            case '*':
                if (!inrange) {
                    break Scan
                }
                break
        }
    }

    return [star, pattern.substring(0, i), pattern.substring(i)]
}
// getEsc gets a possibly-escaped character from chunk, for a character class.
function getEsc(chunk: string): Array<any> {
    if (chunk.length == 0 || chunk[0] == '-' || chunk[0] == ']') {
        throw errBadPattern
    }
    if (chunk[0] == '\\') {
        chunk = chunk.substring(1)
        if (chunk.length == 0) {
            throw errBadPattern
        }
    }
    const r = chunk.charCodeAt(0)
    chunk = chunk.substring(1)
    if (chunk.length == 0) {
        throw errBadPattern
    }
    return [r, chunk]
}

function matchChunk(chunk: string, s: string): string | undefined {
    // failed records whether the match has failed.
    // After the match fails, the loop continues on processing chunk,
    // checking that the pattern is well-formed but no longer reading s.
    let failed = false
    while (chunk.length > 0) {
        if (!failed && s.length == 0) {
            failed = true
        }
        switch (chunk[0]) {
            case '[':
                // character class
                let r = 0
                if (!failed) {
                    r = s.charCodeAt(0)
                    s = s.substring(1)
                }
                chunk = chunk.substring(1)
                // possibly negated
                let negated = false
                if (chunk.length > 0 && chunk[0] == '^') {
                    negated = true
                    chunk = chunk.substring(1)
                }
                // parse all ranges
                let match = false
                let nrange = 0
                while (true) {
                    if (chunk.length > 0 && chunk[0] == ']' && nrange > 0) {
                        chunk = chunk.substring(1)
                        break
                    }
                    let lo = 0
                    let hi = 0;
                    [lo, chunk] = getEsc(chunk)
                    hi = lo
                    if (chunk[0] == '-') {
                        [hi, chunk] = getEsc(chunk.substring(1))
                    }
                    if (lo <= r && r <= hi) {
                        match = true
                    }
                    nrange++
                }
                if (match == negated) {
                    failed = true
                }
                break
            case '?':
                if (!failed) {
                    if (s[0] == '/') {
                        failed = true
                    }
                    s = s.substring(1)
                }
                chunk = chunk.substring(1)
                break
            case '\\':
                chunk = chunk.substring(1)
                if (chunk.length == 0) {
                    throw errBadPattern
                }
            default:
                if (!failed) {
                    if (chunk[0] != s[0]) {
                        failed = true
                    }
                    s = s.substring(1)
                }
                chunk = chunk.substring(1)
                break
        }
    }
    if (failed) {
        return
    }
    return s
}
/**
 * reports whether name matches the shell pattern.
 * @remarks
 * The pattern syntax is:
 * ```
 * 	pattern:
 * 		{ term }
 * 	term:
 * 		'*'         matches any sequence of non-/ characters
 * 		'?'         matches any single non-/ character
 * 		'[' [ '^' ] { character-range } ']'
 * 		            character class (must be non-empty)
 * 		c           matches character c (c != '*', '?', '\\', '[')
 * 		'\\' c      matches character c
 * 
 * 	character-range:
 * 		c           matches character c (c != '\\', '-', ']')
 * 		'\\' c      matches character c
 * 		lo '-' hi   matches character c for lo <= c <= hi
 * ```
 * Match requires pattern to match all of name, not just a substring.
 * The only possible throw error is ErrBadPattern, when pattern is malformed.
 * 
 * @throws {@link errBadPattern}
 * 
 * @example
 * ```
 * consoloe.log(match("abc", "abc")) // true
 * consoloe.log(match("a*", "abc")) // true
 * consoloe.log(match("a*\/b", "a/c/b")) // false
 * ```
 */
export function match(pattern: string, name: string) {
    Pattern:
    while (pattern.length != 0) {
        let star: boolean
        let chunk: string
        [star, chunk, pattern] = scanChunk(pattern)
        if (star && chunk == '') {
            // Trailing * matches rest of string unless it has a /.
            return name.indexOf('/') < 0
        }
        // Look for match at current position.
        let t = matchChunk(chunk, name)
        if (t !== undefined && (t.length == 0 || pattern.length > 0)) {
            name = t
            continue
        }
        if (star) {
            // Look for match skipping i+1 bytes.
            // Cannot skip /.
            for (let i = 0; i < name.length && name[i] != '/'; i++) {
                t = matchChunk(chunk, name.substring(i + 1))
                if (t !== undefined) {
                    // if we're the last chunk, make sure we exhausted the name
                    if (pattern.length == 0 && t.length > 0) {
                        continue
                    }
                    name = t
                    continue Pattern
                }
            }
        }
        // Before returning false with no error,
        // check that the remainder of the pattern is syntactically valid.
        while (pattern.length > 0) {
            let _: string
            [_, chunk, pattern] = scanChunk(pattern)
            matchChunk(chunk, "")
        }
        return false
    }
    return name.length == 0
}
