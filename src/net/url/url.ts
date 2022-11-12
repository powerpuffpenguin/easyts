import { Slice } from "../../core/slice";
import { CompareCallback } from "../../core/types";

enum Encode {
    Path = 1,
    PathSegment,
    Host,
    Zone,
    UserPassword,
    QueryComponent,
    Fragment,
}
/**
 * "0123456789ABCDEF"
 */
const upperhex = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70]
/**
 * escapes the string so it can be safely placed inside a URL query.
 */
export function queryEscape(s: string): string {
    return escape(s, Encode.QueryComponent)
}
// escapes the string so it can be safely placed inside a URL path segment, replacing special characters (including /) with %XX sequences as needed.
export function pathEscape(s: string): string {
    return escape(s, Encode.PathSegment)
}
function escape(s0: string, mode: Encode): string {
    const s = new TextEncoder().encode(s0)
    let spaceCount = 0, hexCount = 0
    for (let i = 0; i < s.length; i++) {
        let c = s[i]
        if (shouldEscape(c, mode)) {
            if (c == 32 && mode == Encode.QueryComponent) {
                spaceCount++
            } else {
                hexCount++
            }
        }
    }
    if (spaceCount == 0 && hexCount == 0) {
        return s0
    }

    let required = s.length + 2 * hexCount
    let t = new Uint8Array(required)

    if (hexCount == 0) {
        for (let i = 0; i < s.length; i++) {
            const c = s[i]
            if (c == 32) { // 32
                t[i] = 43//'+'
            } else {
                t[i] = c
            }
        }
        return new TextDecoder().decode(t)
    }

    let j = 0
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c == 32/*' '*/ && mode == Encode.QueryComponent) {
            t[j] = 43// '+'
            j++
        } else if (shouldEscape(c, mode)) {
            t[j] = 37// '%'

            t[j + 1] = upperhex[c >> 4]
            t[j + 2] = upperhex[c & 15]
            j += 3
        } else {
            t[j] = s[i]
            j++
        }
    }
    return new TextDecoder().decode(t)
}
function shouldEscape(c: number, mode: Encode): boolean {
    // §2.3 Unreserved characters (alphanum)
    // if ('a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9') {
    if (97 <= c && c <= 122 || 65 <= c && c <= 90 || 48 <= c && c <= 57) {
        return false
    }

    if (mode == Encode.Host || mode == Encode.Zone) {
        // §3.2.2 Host allows
        //	sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
        // as part of reg-name.
        // We add : because we include :port as part of host.
        // We add [ ] because we include [ipv6]:port as part of host.
        // We add < > because they're the only characters left that
        // we could possibly allow, and Parse will reject them if we
        // escape them (because hosts can't use %-encoding for
        // ASCII bytes).
        switch (c) {
            case 33: // '!'
            case 36: // '$'
            case 38: // '&'
            case 39: // '\''
            case 40: // '('
            case 41: // ')'
            case 42: // '*'
            case 43: // '+'
            case 44: // ','
            case 59: // ';'
            case 61: // '='
            case 58: // ':'
            case 91: // '['
            case 93: // ']'
            case 60: // '<'
            case 62: // '>'
            case 34: // '"'
                return false
        }
    }

    switch (c) {
        case 45:// '-':
        case 95://'_':
        case 46://'.':
        case 126://'~': // §2.3 Unreserved characters (mark)
            return false

        case 36://'$':
        case 38://'&':
        case 43://'+':
        case 44://',':
        case 47://'/':
        case 58://':':
        case 59://';':
        case 61://'=':
        case 63://'?':
        case 64://'@': // §2.2 Reserved characters (reserved)
            // Different sections of the URL allow a few of
            // the reserved characters to appear unescaped.
            switch (mode) {
                case Encode.Path: // §3.3
                    // The RFC allows : @ & = + $ but saves / ; , for assigning
                    // meaning to individual path segments. This package
                    // only manipulates the path as a whole, so we allow those
                    // last three as well. That leaves only ? to escape.
                    return c == 63//'?'

                case Encode.PathSegment: // §3.3
                    // The RFC allows : @ & = + $ but saves / ; , for assigning
                    // meaning to individual path segments.
                    return c == 47 || c == 59 || c == 44 || c == 63
                // return c == '/' || c == ';' || c == ',' || c == '?'

                case Encode.UserPassword: // §3.2.1
                    // The RFC allows ';', ':', '&', '=', '+', '$', and ',' in
                    // userinfo, so we must escape only '@', '/', and '?'.
                    // The parsing of userinfo treats ':' as special so we must escape
                    // that too.
                    return c == 64 || c == 47 || c == 63 || c == 58
                // return c == '@' || c == '/' || c == '?' || c == ':'

                case Encode.QueryComponent: // §3.4
                    // The RFC reserves (so we must escape) everything.
                    return true

                case Encode.Fragment: // §4.1
                    // The RFC text is silent but the grammar allows
                    // everything, so escape nothing.
                    return false
            }
    }

    if (mode == Encode.Fragment) {
        // RFC 3986 §2.2 allows not escaping sub-delims. A subset of sub-delims are
        // included in reserved from RFC 2396 §2.2. The remaining sub-delims do not
        // need to be escaped. To minimize potential breakage, we apply two restrictions:
        // (1) we always escape sub-delims outside of the fragment, and (2) we always
        // escape single quote to avoid breaking callers that had previously assumed that
        // single quotes would be escaped. See issue #19917.
        switch (c) {
            case 33:// '!'
            case 40:// '('
            case 41:// ')'
            case 42:// '*'
                return false
        }
    }

    // Everything else must be escaped.
    return true
}
/**
 * It is typically used for query parameters and form values.
 * the keys in a Values map are case-sensitive.
 */
export class Values {
    readonly m: Map<string, Array<string>>
    constructor(m?: Map<string, Array<string>>) {
        this.m = m ?? new Map<string, Array<string>>()
    }
    /**
     * gets the first value associated with the given key.
     * to access multiple values, use the map directly.
     */
    get(key: string): string {
        const found = this.m.get(key)
        if (found && found.length != 0) {
            return found[0]
        }
        return ''
    }
    /**
     * sets the key to vals. It replaces any existing
     */
    set(key: string, ...vals: Array<string>): void {
        this.m.set(key, vals)
    }
    /**
     * adds the value to key. It appends to any existing values associated with key.
     */
    add(key: string, ...vals: Array<string>): void {
        const m = this.m
        const found = m.get(key)
        if (found) {
            found.push(...vals)
        } else {
            m.set(key, vals)
        }
    }
    /**
     * deletes the values associated with key.
     */
    del(key: string): void {
        this.m.delete(key)
    }
    /**
     * checks whether a given key is set.
     */
    has(key: string): boolean {
        return this.m.has(key)
    }
    /**
     * encodes the values into ``URL encoded'' form ("bar=baz&foo=quux") sorted by key.
     */
    encode(sortKey?: CompareCallback<string> | boolean): string {
        const m = this.m
        const buf = new Array<string>()
        if (sortKey) {
            const keys = Array.from(m.keys()).sort(typeof sortKey === "boolean" ? undefined : sortKey)
            for (const k of keys) {
                const vs = m.get(k)
                this._encode(buf, k, vs!)
            }
        } else {
            this.m.forEach((vs, k) => {
                this._encode(buf, k, vs)
            })
        }
        return buf.toString()
    }
    private _encode(buf: Array<string>, k: string, vs: Array<string>) {
        k = queryEscape(k)
        let s: string
        for (const v of vs) {
            buf.push(buf.length > 0 ? `&${k}=${queryEscape(v)}` : `${k}=${queryEscape(v)}`)
        }
    }
}
