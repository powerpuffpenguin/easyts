import { Exception } from "../../core";
import { CompareCallback } from "../../core/types";

export class InvalidHostException extends Exception {
    /**
     * 
     * @internal
     */
    static make(str: string): InvalidHostException {
        return new InvalidHostException(`invalid character ${str} in host name`)
    }
    private constructor(msg: string) {
        super(msg)
    }
}
export class EscapeException extends Exception {
    /**
     * 
     * @internal
     */
    static make(str: string): EscapeException {
        return new EscapeException(`invalid URL escape ${str}`)
    }
    private constructor(msg: string) {
        super(msg)
    }
}

class URLException extends Exception {
    constructor(
        public op: string,
        public url: string,
        public err: any,
    ) {
        super('ParseError')
    }
    unwrap(): undefined | Exception {
        return this.err
    }
    error(): string {
        return `${this.op} '${this.url}': ${this.err.error()}`
    }
    timeout(): boolean {
        return this.err.timeout()
    }
    temporary(): boolean {
        return this.err.temporary()
    }
}


/**
 * @internal
 */
export enum Encode {
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
function ishex(c: number): boolean {
    return (48 <= c && c <= 57) //  '0' <= c && c <= '9'
        || (97 <= c && c <= 102) // 'a' <= c && c <= 'f'
        || (65 <= c && c <= 70) // 'A' <= c && c <= 'F'
}
function unhex(c: number): number {
    if (48 <= c && c <= 57) { //  '0' <= c && c <= '9'
        return c - 48 // return c - '0'
    } else if (97 <= c && c <= 102) {//   case 'a' <= c && c <= 'f'
        return c - 97 + 10 // c - 'a' + 10
    } else if (65 <= c && c <= 70) { // 'A' <= c && c <= 'F'
        return c - 65 + 10 // c - 'A' + 10
    }
    return 0
}
function bytesEqual(l: ArrayLike<number>, r: ArrayLike<number>): boolean {
    if (l.length != r.length) {
        return false
    }
    for (let i = 0; i < l.length; i++) {
        if (l[i] != r[i]) {
            return false
        }
    }
    return true
}
/**
 * escapes the string so it can be safely placed inside a URL query.
 */
export function queryEscape(s: string): string {
    return escape(s, Encode.QueryComponent)
}
/**
 * escapes the string so it can be safely placed inside a URL path segment, replacing special characters (including /) with %XX sequences as needed.
 */
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
/**
 * @internal
 */
export function shouldEscape(c: number, mode: Encode): boolean {
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
 * QueryUnescape does the inverse transformation of QueryEscape, converting each 3-byte encoded substring of the form "%AB" into the hex-decoded byte 0xAB.
 * 
 * It throw an error if any % is not followed by two hexadecimal digits.
 * 
 * @throws {@link EscapeException}
 */
export function queryUnescape(s: string): string {
    return unescape(s, Encode.QueryComponent)
}
/**
 * pathUnescape does the inverse transformation of pathEscape, converting each 3-byte encoded substring of the form "%AB" into the  hex-decoded byte 0xAB. It throw an error if any % is not followed  by two hexadecimal digits.
 * 
 * pathUnescape is identical to queryUnescape except that it does not  unescape '+' to ' ' (space).
 * 
 * @throws {@link EscapeException}
 */
export function pathUnescape(s: string): string {
    return unescape(s, Encode.PathSegment)
}
function unescape(s0: string, mode: Encode): string {
    // Count %, check that they're well-formed.
    let s = new TextEncoder().encode(s0)
    let n = 0
    let hasPlus = false
    for (let i = 0; i < s.length;) {
        switch (s[i]) {
            case 37: //'%'
                n++
                if (i + 2 >= s.length
                    || !ishex(s[i + 1])
                    || !ishex(s[i + 2])
                ) {
                    s = s.subarray(i)
                    if (s.length > 3) {
                        s = s.subarray(0, 3)
                    }
                    throw EscapeException.make(new TextDecoder().decode(s))
                }
                // Per https://tools.ietf.org/html/rfc3986#page-21
                // in the host component %-encoding can only be used
                // for non-ASCII bytes.
                // But https://tools.ietf.org/html/rfc6874#section-2
                // introduces %25 being allowed to escape a percent sign
                // in IPv6 scoped-address literals. Yay.
                if (mode == Encode.Host
                    && unhex(s[i + 1]) < 8
                    && !bytesEqual(s.subarray(i, i + 3), [37, 50, 53]) // s[i: i + 3] != "%25"
                ) {
                    throw EscapeException.make(new TextDecoder().decode(s.subarray(i, i + 3)))
                }
                if (mode == Encode.Zone) {
                    // RFC 6874 says basically "anything goes" for zone identifiers
                    // and that even non-ASCII can be redundantly escaped,
                    // but it seems prudent to restrict %-escaped bytes here to those
                    // that are valid host name bytes in their unescaped form.
                    // That is, you can use escaping in the zone identifier but not
                    // to introduce bytes you couldn't just write directly.
                    // But Windows puts spaces here! Yay.
                    let v = unhex(s[i + 1]) << 4 | unhex(s[i + 2])
                    if (!bytesEqual(s.subarray(i, i + 3), [37, 50, 53]) // s[i: i + 3] != "%25"
                        && v != 32 // v != ' '
                        && shouldEscape(v, Encode.Host)
                    ) {
                        throw EscapeException.make(new TextDecoder().decode(s.subarray(i, i + 3)))
                    }
                }
                i += 3
                break
            case 43://'+'
                hasPlus = mode == Encode.QueryComponent
                i++
                break
            default:
                if ((mode == Encode.Host || mode == Encode.Zone)
                    && s[i] < 0x80
                    && shouldEscape(s[i], mode)) {
                    throw InvalidHostException.make(new TextDecoder().decode(s.subarray(i, i + 1)))

                }
                i++
                break
        }
    }

    if (n == 0 && !hasPlus) {
        return s0
    }
    const t = new Uint8Array(s.length - 2 * n)
    let j = 0
    for (let i = 0; i < s.length; i++) {
        const c = s[i]
        switch (c) {
            case 37: // '%'
                t[j++] = unhex(s[i + 1]) << 4 | unhex(s[i + 2])
                i += 2
                break
            case 43:// '+'
                if (mode == Encode.QueryComponent) {
                    t[j++] = 32 // ' '
                } else {
                    t[j++] = c
                }
                break
            default:
                t[j++] = c
                break
        }
    }
    return new TextDecoder().decode(t)
}

/**
 * resolvePath applies special path segments from refs and applies them to base, per RFC 3986.
 * @internal
 */
export function resolvePath(base: string, ref: string): string {
    let full: string
    if (ref == "") {
        full = base
    } else if (ref[0] != '/') {
        let i = base.lastIndexOf("/")
        full = base.substring(0, i + 1) + ref
    } else {
        full = ref
    }
    if (full == "") {
        return ""
    }

    let elem = ''
    let dst = new Array<string>()
    let first = true
    let remaining = full
    // We want to return a leading '/', so write it now.
    dst.push('/')
    let found = true
    while (found) {
        // 	elem, remaining, found = strings.Cut(remaining, "/")
        const i = remaining.indexOf('/')
        found = i >= 0
        if (found) {
            elem = remaining.substring(0, i)
            remaining = remaining.substring(i + 1)
        } else {
            elem = remaining
            remaining = ''
        }
        if (elem == ".") {
            first = false
            // drop
            continue
        }

        if (elem == "..") {
            // Ignore the leading '/' we already wrote.
            let str = dst.join('').substring(1)
            let index = str.lastIndexOf('/')

            dst.splice(0, dst.length)
            dst.push('/')
            if (index == -1) {
                first = true
            } else {
                dst.push(str.substring(0, index))
            }
        } else {
            if (!first) {
                dst.push('/')
            }
            dst.push(elem)
            first = false
        }
    }

    if (elem == "." || elem == "..") {
        dst.push('/')
    }

    // We wrote an initial '/', but we don't want two.
    let r = dst.join('')
    if (r.length > 1 && r[1] == '/') {
        r = r.substring(1)
    }
    return r
}

export interface ValuesObject {
    [key: string]: Array<string> | string
}
interface cutResult {
    b: string
    a: string
    f?: boolean
}
function stringsCut(s: string, sep: string): Array<string> {
    const i = s.indexOf(sep)
    if (i >= 0) {
        return [s.substring(0, i), s.substring(i + sep.length), "1"]
    }
    return [s, '', ""]
}
/**
 * It is typically used for query parameters and form values.
 * the keys in a Values map are case-sensitive.
 */
export class Values {
    /**
     * parses the URL-encoded query string and returns a map listing the values specified for each key.
     * @param errs set errors encountered to this array
     * @param first If true then errs will only log the first error encountered
     * @returns always returns a non-nil map containing all the valid query parameters found
     */
    static parse(query: string, errs?: Array<Exception>, first = true): Values {
        const m = new Values(new Map<string, Array<string>>())
        let key: string
        let value: string
        let cut: cutResult
        let n = errs?.length ?? 0
        while (query != "") {
            [key, query] = stringsCut(query, '&')
            if (key.indexOf(';') >= 0) {
                if (errs) {
                    if (!first || n == errs.length) {
                        errs.push(new Exception('invalid semicolon separator in query'))
                    }
                }
                continue
            }
            if (key == "") {
                continue
            }
            [key, value] = stringsCut(key, '=')
            try {
                key = queryUnescape(key)
            } catch (e) {
                if (errs) {
                    if (!first || n == errs.length) {
                        errs.push(e as any)
                    }
                }
                continue
            }
            try {
                value = queryUnescape(value)
            } catch (e) {
                if (errs) {
                    if (!first || n == errs.length) {
                        errs.push(e as any)
                    }
                }
                continue
            }
            m.add(key, value)
        }
        return m
    }
    /**
     * convert Object to Values
     */
    static fromObject(obj: ValuesObject) {
        const m = new Map<string, Array<string>>()
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const v = obj[key]
                if (Array.isArray(v)) {
                    m.set(key, v)
                } else {
                    m.set(key, [v])
                }
            }
        }
        return new Values(m)
    }
    /**
     * map listing
     */
    readonly m: Map<string, Array<string>>
    constructor(m?: Map<string, Array<string>>) {
        this.m = m ?? new Map<string, Array<string>>()
    }
    /**
     * return keys.length
     */
    get length(): number {
        return this.m.size
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
     * sets the key to vals. It replaces any existing
     */
    setObject(obj: ValuesObject): void {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const v = obj[key]
                if (Array.isArray(v)) {
                    this.set(key, ...v)
                } else {
                    this.set(key, v)
                }
            }
        }
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
     * adds the value to key. It appends to any existing values associated with key.
     */
    addObject(obj: ValuesObject): void {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const v = obj[key]
                if (Array.isArray(v)) {
                    this.add(key, ...v)
                } else {
                    this.add(key, v)
                }
            }
        }
    }
    /**
     * convert Values to Object
     */
    object(): ValuesObject {
        const m: ValuesObject = {}
        this.m.forEach((v, k) => {
            m[k] = v
        })
        return m
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
        return buf.join('')
    }
    private _encode(buf: Array<string>, k: string, vs: Array<string>) {
        k = queryEscape(k)
        for (const v of vs) {
            buf.push(buf.length > 0 ? `&${k}=${queryEscape(v)}` : `${k}=${queryEscape(v)}`)
        }
    }
}

/**
 * The Userinfo type is an immutable encapsulation of username and password details for a URL. An existing Userinfo value is guaranteed to have a username set (potentially empty, as allowed by RFC 2396), and optionally a password.
 */
export class Userinfo {
    constructor(public readonly username: string, public readonly password?: string) { }
    toString(): string {
        let s = escape(this.username, Encode.UserPassword)
        const pwd = this.password
        if (pwd) {
            s += ":" + escape(pwd, Encode.UserPassword)
        }
        return s
    }
}
function stringContainsCTLByte(s: string): boolean {
    for (const b of new TextEncoder().encode(s)) {
        if (b < 32 || b == 0x7f) {
            return true
        }
    }
    return false
}
// Maybe rawURL is of the form scheme:path.
// (Scheme must be [a-zA-Z][a-zA-Z0-9+-.]*)
// If so, return scheme, path; else return "", rawURL.
function getScheme(rawURL: string): Array<string> {
    for (let i = 0; i < rawURL.length; i++) {
        const c = rawURL.charCodeAt(i)
        if (97 <= c && c <= 122 || 65 <= c && c <= 90) {// 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z'
            // do nothing
        } else if (48 <= c && c <= 57 || c == 43 || c == 45 || c == 46) {// '0' <= c && c <= '9' || c == '+' || c == '-' || c == '.'
            if (i == 0) {
                return ["", rawURL]
            }
        } else if (c == 58) {// c==':'
            if (i == 0) {
                throw new Exception('missing protocol scheme')
            }
            return [rawURL.substring(0, i), rawURL.substring(i + 1)]
        } else {
            // we have encountered an invalid character,
            // so there is no valid scheme
            break
        }
    }
    return ["", rawURL]
}
interface Authority {
    user?: Userinfo
    host: string
}
function parseAuthority(authority: string): Authority {
    let host: string
    let i = authority.indexOf("@")
    if (i < 0) {
        host = parseHost(authority)
        return {
            host: host
        }
    } else {
        host = parseHost(authority.substring(i + 1))
    }

    let userinfo = authority.substring(0, i)
    if (!validUserinfo(userinfo)) {
        throw new Exception('net/url: invalid userinfo')
    }
    let user: undefined | Userinfo
    if (userinfo.indexOf(':') < 0) {
        userinfo = unescape(userinfo, Encode.UserPassword)
        user = new Userinfo(userinfo)
    } else {
        const [username, password] = stringsCut(userinfo, ":")
        user = new Userinfo(
            unescape(username, Encode.UserPassword),
            unescape(password, Encode.UserPassword)
        )
    }
    return {
        user: user,
        host: host
    }
}
function parseHost(host: string): string {
    if (host.startsWith('[')) {
        // Parse an IP-Literal in RFC 3986 and RFC 6874.
        // E.g., "[fe80::1]", "[fe80::1%25en0]", "[fe80::1]:80".
        const i = host.lastIndexOf(']')
        if (i < 0) {
            throw new Exception("missing ']' in host")
        }
        const colonPort = host.substring(i + 1)
        if (!validOptionalPort(colonPort)) {
            throw new Exception(`invalid port ${colonPort} after host`)
        }

        // RFC 6874 defines that %25 (%-encoded percent) introduces
        // the zone identifier, and the zone identifier can use basically
        // any %-encoding it likes. That's different from the host, which
        // can only %-encode non-ASCII bytes.
        // We do impose some restrictions on the zone, to avoid stupidity
        // like newlines.
        const zone = host.substring(0, i).indexOf("%25")
        if (zone >= 0) {
            const host1 = unescape(host.substring(0, zone), Encode.Host)
            const host2 = unescape(host.substring(zone, i), Encode.Zone)
            const host3 = unescape(host.substring(i), Encode.Host)
            return host1 + host2 + host3
        }
    } else {
        const i = host.lastIndexOf(':')
        if (i != -1) {
            const colonPort = host.substring(i)
            if (!validOptionalPort(colonPort)) {
                throw new Exception(`invalid port ${colonPort} after host`)
            }
        }
    }
    return unescape(host, Encode.Host)
}
function validOptionalPort(port: string): boolean {
    if (port == "") {
        return true
    }
    if (port[0] != ':') {
        return false
    }
    for (let i = 1; i < port.length; i++) {
        const b = port[i].charCodeAt(i)
        if (b < 48 || b > 57) { // b < '0' || b > '9'
            return false
        }
    }
    return true
}
// validUserinfo reports whether s is a valid userinfo string per RFC 3986
// Section 3.2.1:
//     userinfo    = *( unreserved / pct-encoded / sub-delims / ":" )
//     unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
//     sub-delims  = "!" / "$" / "&" / "'" / "(" / ")"
//                   / "*" / "+" / "," / ";" / "="
//
// It doesn't validate pct-encoded. The caller does that via func unescape.
function validUserinfo(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
        const r = s.charCodeAt(i)
        if (65 <= r && r <= 90) {// ('A' <= r && r <= 'Z')
            continue
        }
        if (97 <= r && r <= 122) { // 'a' <= r && r <= 'z'
            continue
        }
        if (48 <= r && r <= 57) { // '0' <= r && r <= '9'
            continue
        }
        switch (r) {
            case 45: // -
            case 46: // .
            case 95: // _
            case 58: // :
            case 126: // ~
            case 33: // !
            case 36: // $
            case 38: // &
            case 39: // '
            case 40: // (
            case 41: // )
            case 42: // *
            case 43: // +
            case 44: // ,
            case 59: // ;
            case 61: // =
            case 37: // %
            case 64: // @
                break
            default:
                return false
        }
    }
    return true
}
export class URL {
    /**
     * parses a raw url into a URL class.
     * 
     * @remarks
     * The url may be relative (a path, without a host) or absolute (starting with a scheme). Trying to parse a hostname and path without a scheme is invalid but may not necessarily return an error, due to parsing ambiguities.
     * 
     * @throws {@link URLException}
     * @throws {@link Exception}
     */
    static parse(rawURL: string): URL {
        // Cut off #frag
        const [u, frag] = stringsCut(rawURL, "#")
        let url: URL
        try {
            url = URL._parse(u, false)
        } catch (e) {
            throw new URLException(
                "parse", u, e
            )
        }
        if (frag != "") {
            try {
                url.setFragment(frag)
            } catch (e) {
                throw new URLException(
                    "parse", u, e
                )
            }
        }
        return url
    }


    /**
     * parses a raw url into a URL class. 
     * 
     * @remarks
     * It assumes that url was received in an HTTP request, so the url is interpreted only as an absolute URI or an absolute path.
     * The string url is assumed not to have a #fragment suffix.
     * (Web browsers strip #fragment before sending the URL to a web server.)
     * 
     * @throws {@link URLException}
     * @throws {@link Exception}
     */
    static parseRequestURI(rawURL: string): URL {
        try {
            return URL._parse(rawURL, true)
        } catch (e) {
            throw new URLException(
                "parse", rawURL, e
            )
        }
    }
    private static _parse(rawURL: string, viaRequest: boolean): URL {
        let rest = ''

        if (stringContainsCTLByte(rawURL)) {
            throw new Exception('net/url: invalid control character in URL')
        }

        if (rawURL == "" && viaRequest) {
            throw new Exception('empty url')
        }
        const url = new URL()

        if (rawURL == "*") {
            url.path = "*"
            return url
        }

        // Split off possible leading "http:", "mailto:", etc.
        // Cannot contain escaped characters.
        [url.scheme, rest] = getScheme(rawURL)
        url.scheme = url.scheme.toLowerCase()

        if (rest.endsWith('?') && rest.indexOf('?') != rest.length - 1) {
            url.forceQuery = true
            rest = rest.substring(0, rest.length - 1)
        } else {
            [rest, url.rawQuery] = stringsCut(rest, '?')
        }

        if (rest.startsWith('/')) {
            if (url.scheme != "") {
                // We consider rootless paths per RFC 3986 as opaque.
                url.opaque = rest
                return url
            }
            if (viaRequest) {
                throw new Exception('invalid URI for request')
            }

            // Avoid confusion with malformed schemes, like cache_object:foo/bar.
            // See golang.org/issue/16822.
            //
            // RFC 3986, §3.3:
            // In addition, a URI reference (Section 4.1) may be a relative-path reference,
            // in which case the first path segment cannot contain a colon (":") character.
            const [segment] = stringsCut(rest, "/")
            if (segment.indexOf(':') >= 0) {
                // First path segment has colon. Not allowed in relative URL.
                throw new Exception('first path segment in URL cannot contain colon')
            }
        }

        if (url.scheme != ""
            || !viaRequest && !rest.startsWith("///") && rest.startsWith("//")
        ) {
            let authority = rest.substring(2)
            rest = ''

            const i = authority.indexOf('/')
            if (i >= 0) {
                [authority, rest] = [authority.substring(0, i), authority.substring(i)]
            }
            const obj = parseAuthority(authority)
            url.user = obj.user
            url.host = obj.host
        }

        // Set Path and, optionally, RawPath.
        // RawPath is a hint of the encoding of Path. We don't want to set it if
        // the default escaping of Path is equivalent, to help make sure that people
        // don't rely on it in general.
        url.setPath(rest)

        return url
    }
    private constructor() { }
    scheme = ''
    /**
     * encoded opaque data
     */
    opaque = ''
    user?: Userinfo // username and password information
    host = ''    // host or host:port
    path = ''    // path (relative paths may omit leading slash)
    rawPath?: string    // encoded path hint (see EscapedPath method)
    forceQuery = false      // append a query ('?') even if RawQuery is empty
    rawQuery?: string   // encoded query values, without '?'
    fragment = ''    // fragment for references, without '#'
    rawFragment?: string    // encoded fragment hint (see EscapedFragment method)

    setFragment(f: string): void {

    }
    setPath(p: string): void {

    }
}
