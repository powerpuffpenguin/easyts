"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Values = exports.pathUnescape = exports.queryUnescape = exports.pathEscape = exports.queryEscape = exports.EscapeException = exports.InvalidHostException = void 0;
const core_1 = require("../../core");
class InvalidHostException extends core_1.Exception {
    /**
     *
     * @internal
     */
    static make(str) {
        return new InvalidHostException(`invalid character ${str} in host name`);
    }
    constructor(msg) {
        super(msg);
    }
}
exports.InvalidHostException = InvalidHostException;
class EscapeException extends core_1.Exception {
    /**
     *
     * @internal
     */
    static make(str) {
        return new EscapeException(`invalid URL escape ${str}`);
    }
    constructor(msg) {
        super(msg);
    }
}
exports.EscapeException = EscapeException;
var Encode;
(function (Encode) {
    Encode[Encode["Path"] = 1] = "Path";
    Encode[Encode["PathSegment"] = 2] = "PathSegment";
    Encode[Encode["Host"] = 3] = "Host";
    Encode[Encode["Zone"] = 4] = "Zone";
    Encode[Encode["UserPassword"] = 5] = "UserPassword";
    Encode[Encode["QueryComponent"] = 6] = "QueryComponent";
    Encode[Encode["Fragment"] = 7] = "Fragment";
})(Encode || (Encode = {}));
/**
 * "0123456789ABCDEF"
 */
const upperhex = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];
function ishex(c) {
    return (48 <= c && c <= 57) //  '0' <= c && c <= '9'
        || (97 <= c && c <= 102) // 'a' <= c && c <= 'f'
        || (65 <= c && c <= 70); // 'A' <= c && c <= 'F'
}
function unhex(c) {
    if (48 <= c && c <= 57) { //  '0' <= c && c <= '9'
        return c - 48; // return c - '0'
    }
    else if (97 <= c && c <= 102) { //   case 'a' <= c && c <= 'f'
        return c - 97 + 10; // c - 'a' + 10
    }
    else if (65 <= c && c <= 70) { // 'A' <= c && c <= 'F'
        return c - 65 + 10; // c - 'A' + 10
    }
    return 0;
}
function bytesEqual(l, r) {
    if (l.length != r.length) {
        return false;
    }
    for (let i = 0; i < l.length; i++) {
        if (l[i] != r[i]) {
            return false;
        }
    }
    return true;
}
/**
 * escapes the string so it can be safely placed inside a URL query.
 */
function queryEscape(s) {
    return escape(s, Encode.QueryComponent);
}
exports.queryEscape = queryEscape;
/**
 * escapes the string so it can be safely placed inside a URL path segment, replacing special characters (including /) with %XX sequences as needed.
 */
function pathEscape(s) {
    return escape(s, Encode.PathSegment);
}
exports.pathEscape = pathEscape;
function escape(s0, mode) {
    const s = new TextEncoder().encode(s0);
    let spaceCount = 0, hexCount = 0;
    for (let i = 0; i < s.length; i++) {
        let c = s[i];
        if (shouldEscape(c, mode)) {
            if (c == 32 && mode == Encode.QueryComponent) {
                spaceCount++;
            }
            else {
                hexCount++;
            }
        }
    }
    if (spaceCount == 0 && hexCount == 0) {
        return s0;
    }
    let required = s.length + 2 * hexCount;
    let t = new Uint8Array(required);
    if (hexCount == 0) {
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            if (c == 32) { // 32
                t[i] = 43; //'+'
            }
            else {
                t[i] = c;
            }
        }
        return new TextDecoder().decode(t);
    }
    let j = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c == 32 /*' '*/ && mode == Encode.QueryComponent) {
            t[j] = 43; // '+'
            j++;
        }
        else if (shouldEscape(c, mode)) {
            t[j] = 37; // '%'
            t[j + 1] = upperhex[c >> 4];
            t[j + 2] = upperhex[c & 15];
            j += 3;
        }
        else {
            t[j] = s[i];
            j++;
        }
    }
    return new TextDecoder().decode(t);
}
function shouldEscape(c, mode) {
    // §2.3 Unreserved characters (alphanum)
    // if ('a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9') {
    if (97 <= c && c <= 122 || 65 <= c && c <= 90 || 48 <= c && c <= 57) {
        return false;
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
                return false;
        }
    }
    switch (c) {
        case 45: // '-':
        case 95: //'_':
        case 46: //'.':
        case 126: //'~': // §2.3 Unreserved characters (mark)
            return false;
        case 36: //'$':
        case 38: //'&':
        case 43: //'+':
        case 44: //',':
        case 47: //'/':
        case 58: //':':
        case 59: //';':
        case 61: //'=':
        case 63: //'?':
        case 64: //'@': // §2.2 Reserved characters (reserved)
            // Different sections of the URL allow a few of
            // the reserved characters to appear unescaped.
            switch (mode) {
                case Encode.Path: // §3.3
                    // The RFC allows : @ & = + $ but saves / ; , for assigning
                    // meaning to individual path segments. This package
                    // only manipulates the path as a whole, so we allow those
                    // last three as well. That leaves only ? to escape.
                    return c == 63; //'?'
                case Encode.PathSegment: // §3.3
                    // The RFC allows : @ & = + $ but saves / ; , for assigning
                    // meaning to individual path segments.
                    return c == 47 || c == 59 || c == 44 || c == 63;
                // return c == '/' || c == ';' || c == ',' || c == '?'
                case Encode.UserPassword: // §3.2.1
                    // The RFC allows ';', ':', '&', '=', '+', '$', and ',' in
                    // userinfo, so we must escape only '@', '/', and '?'.
                    // The parsing of userinfo treats ':' as special so we must escape
                    // that too.
                    return c == 64 || c == 47 || c == 63 || c == 58;
                // return c == '@' || c == '/' || c == '?' || c == ':'
                case Encode.QueryComponent: // §3.4
                    // The RFC reserves (so we must escape) everything.
                    return true;
                case Encode.Fragment: // §4.1
                    // The RFC text is silent but the grammar allows
                    // everything, so escape nothing.
                    return false;
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
            case 33: // '!'
            case 40: // '('
            case 41: // ')'
            case 42: // '*'
                return false;
        }
    }
    // Everything else must be escaped.
    return true;
}
/**
 * QueryUnescape does the inverse transformation of QueryEscape, converting each 3-byte encoded substring of the form "%AB" into the hex-decoded byte 0xAB.
 *
 * It throw an error if any % is not followed by two hexadecimal digits.
 *
 * @throws {@link EscapeException}
 */
function queryUnescape(s) {
    return unescape(s, Encode.QueryComponent);
}
exports.queryUnescape = queryUnescape;
/**
 * pathUnescape does the inverse transformation of pathEscape, converting each 3-byte encoded substring of the form "%AB" into the  hex-decoded byte 0xAB. It throw an error if any % is not followed  by two hexadecimal digits.
 *
 * pathUnescape is identical to queryUnescape except that it does not  unescape '+' to ' ' (space).
 *
 * @throws {@link EscapeException}
 */
function pathUnescape(s) {
    return unescape(s, Encode.PathSegment);
}
exports.pathUnescape = pathUnescape;
function unescape(s0, mode) {
    // Count %, check that they're well-formed.
    let s = new TextEncoder().encode(s0);
    let n = 0;
    let hasPlus = false;
    for (let i = 0; i < s.length;) {
        switch (s[i]) {
            case 37: //'%'
                n++;
                if (i + 2 >= s.length
                    || !ishex(s[i + 1])
                    || !ishex(s[i + 2])) {
                    s = s.subarray(i);
                    if (s.length > 3) {
                        s = s.subarray(0, 3);
                    }
                    throw EscapeException.make(new TextDecoder().decode(s));
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
                    throw EscapeException.make(new TextDecoder().decode(s.subarray(i, i + 3)));
                }
                if (mode == Encode.Zone) {
                    // RFC 6874 says basically "anything goes" for zone identifiers
                    // and that even non-ASCII can be redundantly escaped,
                    // but it seems prudent to restrict %-escaped bytes here to those
                    // that are valid host name bytes in their unescaped form.
                    // That is, you can use escaping in the zone identifier but not
                    // to introduce bytes you couldn't just write directly.
                    // But Windows puts spaces here! Yay.
                    let v = unhex(s[i + 1]) << 4 | unhex(s[i + 2]);
                    if (!bytesEqual(s.subarray(i, i + 3), [37, 50, 53]) // s[i: i + 3] != "%25"
                        && v != 32 // v != ' '
                        && shouldEscape(v, Encode.Host)) {
                        throw EscapeException.make(new TextDecoder().decode(s.subarray(i, i + 3)));
                    }
                }
                i += 3;
                break;
            case 43: //'+'
                hasPlus = mode == Encode.QueryComponent;
                i++;
                break;
            default:
                if ((mode == Encode.Host || mode == Encode.Zone)
                    && s[i] < 0x80
                    && shouldEscape(s[i], mode)) {
                    throw InvalidHostException.make(new TextDecoder().decode(s.subarray(i, i + 1)));
                }
                i++;
                break;
        }
    }
    if (n == 0 && !hasPlus) {
        return s0;
    }
    const t = new Uint8Array(s.length - 2 * n);
    let j = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        switch (c) {
            case 37: // '%'
                t[j++] = unhex(s[i + 1]) << 4 | unhex(s[i + 2]);
                i += 2;
                break;
            case 43: // '+'
                if (mode == Encode.QueryComponent) {
                    t[j++] = 32; // ' '
                }
                else {
                    t[j++] = c;
                }
                break;
            default:
                t[j++] = c;
                break;
        }
    }
    return new TextDecoder().decode(t);
}
/**
 * It is typically used for query parameters and form values.
 * the keys in a Values map are case-sensitive.
 */
class Values {
    m;
    constructor(m) {
        this.m = m ?? new Map();
    }
    /**
     * gets the first value associated with the given key.
     * to access multiple values, use the map directly.
     */
    get(key) {
        const found = this.m.get(key);
        if (found && found.length != 0) {
            return found[0];
        }
        return '';
    }
    /**
     * sets the key to vals. It replaces any existing
     */
    set(key, ...vals) {
        this.m.set(key, vals);
    }
    /**
     * adds the value to key. It appends to any existing values associated with key.
     */
    add(key, ...vals) {
        const m = this.m;
        const found = m.get(key);
        if (found) {
            found.push(...vals);
        }
        else {
            m.set(key, vals);
        }
    }
    /**
     * deletes the values associated with key.
     */
    del(key) {
        this.m.delete(key);
    }
    /**
     * checks whether a given key is set.
     */
    has(key) {
        return this.m.has(key);
    }
    /**
     * encodes the values into ``URL encoded'' form ("bar=baz&foo=quux") sorted by key.
     */
    encode(sortKey) {
        const m = this.m;
        const buf = new Array();
        if (sortKey) {
            const keys = Array.from(m.keys()).sort(typeof sortKey === "boolean" ? undefined : sortKey);
            for (const k of keys) {
                const vs = m.get(k);
                this._encode(buf, k, vs);
            }
        }
        else {
            this.m.forEach((vs, k) => {
                this._encode(buf, k, vs);
            });
        }
        return buf.toString();
    }
    _encode(buf, k, vs) {
        k = queryEscape(k);
        let s;
        for (const v of vs) {
            buf.push(buf.length > 0 ? `&${k}=${queryEscape(v)}` : `${k}=${queryEscape(v)}`);
        }
    }
}
exports.Values = Values;
//# sourceMappingURL=url.js.map