"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Values = exports.pathEscape = exports.queryEscape = void 0;
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
 * escapes the string so it can be safely placed inside a URL query.
 */
function queryEscape(s) {
    return escape(s, Encode.QueryComponent);
}
exports.queryEscape = queryEscape;
// escapes the string so it can be safely placed inside a URL path segment, replacing special characters (including /) with %XX sequences as needed.
function pathEscape(s) {
    return escape(s, Encode.PathSegment);
}
exports.pathEscape = pathEscape;
function escape(s, mode) {
    let spaceCount = 0, hexCount = 0;
    for (let i = 0; i < s.length; i++) {
        let c = s[i];
        if (shouldEscape(c, mode)) {
            if (c == ' ' && mode == Encode.QueryComponent) {
                spaceCount++;
            }
            else {
                hexCount++;
            }
        }
    }
    return '';
}
let s = 'c';
switch (s) {
    case "a":
    case "b":
        console.log("ok");
        break;
}
function shouldEscape(c, mode) {
    // §2.3 Unreserved characters (alphanum)
    if ('a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9') {
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
        // switch (c) {
        //     case '!', '$', '&', '\'', '(', ')', '*', '+', ',', ';', '=', ':', '[', ']', '<', '>', '"':
        //         return false
        // }
    }
    // switch c {
    //     case '-', '_', '.', '~': // §2.3 Unreserved characters (mark)
    //         return false
    //     case '$', '&', '+', ',', '/', ':', ';', '=', '?', '@': // §2.2 Reserved characters (reserved)
    //         // Different sections of the URL allow a few of
    //         // the reserved characters to appear unescaped.
    //         switch mode {
    //             case encodePath: // §3.3
    //                 // The RFC allows : @ & = + $ but saves / ; , for assigning
    //                 // meaning to individual path segments. This package
    //                 // only manipulates the path as a whole, so we allow those
    //                 // last three as well. That leaves only ? to escape.
    //                 return c == '?'
    //             case encodePathSegment: // §3.3
    //                 // The RFC allows : @ & = + $ but saves / ; , for assigning
    //                 // meaning to individual path segments.
    //                 return c == '/' || c == ';' || c == ',' || c == '?'
    //             case encodeUserPassword: // §3.2.1
    //                 // The RFC allows ';', ':', '&', '=', '+', '$', and ',' in
    //                 // userinfo, so we must escape only '@', '/', and '?'.
    //                 // The parsing of userinfo treats ':' as special so we must escape
    //                 // that too.
    //                 return c == '@' || c == '/' || c == '?' || c == ':'
    //             case encodeQueryComponent: // §3.4
    //                 // The RFC reserves (so we must escape) everything.
    //                 return true
    //             case encodeFragment: // §4.1
    //                 // The RFC text is silent but the grammar allows
    //                 // everything, so escape nothing.
    //                 return false
    //         }
    // }
    // if mode == encodeFragment {
    //     // RFC 3986 §2.2 allows not escaping sub-delims. A subset of sub-delims are
    //     // included in reserved from RFC 2396 §2.2. The remaining sub-delims do not
    //     // need to be escaped. To minimize potential breakage, we apply two restrictions:
    //     // (1) we always escape sub-delims outside of the fragment, and (2) we always
    //     // escape single quote to avoid breaking callers that had previously assumed that
    //     // single quotes would be escaped. See issue #19917.
    //     switch c {
    //         case '!', '(', ')', '*':
    //             return false
    //     }
    // }
    // Everything else must be escaped.
    return true;
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