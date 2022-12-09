"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
function scanChunk(pattern) {
    var star = false;
    while (pattern.length > 0 && pattern[0] == '*') {
        pattern = pattern.substring(1);
        star = true;
    }
    var inrange = false;
    var i = 0;
    Scan: for (i = 0; i < pattern.length; i++) {
        switch (pattern[i]) {
            case '\\':
                // error check handled in matchChunk: bad pattern.
                if (i + 1 < pattern.length) {
                    i++;
                }
                break;
            case '[':
                inrange = true;
                break;
            case ']':
                inrange = false;
                break;
            case '*':
                if (!inrange) {
                    break Scan;
                }
                break;
        }
    }
    return [star, pattern.substring(0, i), pattern.substring(i)];
}
// getEsc gets a possibly-escaped character from chunk, for a character class.
function getEsc(chunk) {
    if (chunk.length == 0 || chunk[0] == '-' || chunk[0] == ']') {
        throw new SyntaxError('syntax error in pattern');
    }
    if (chunk[0] == '\\') {
        chunk = chunk.substring(1);
        if (chunk.length == 0) {
            throw new SyntaxError('syntax error in pattern');
        }
    }
    var r = chunk.charCodeAt(0);
    chunk = chunk.substring(1);
    if (chunk.length == 0) {
        throw new SyntaxError('syntax error in pattern');
    }
    return [r, chunk];
}
function matchChunk(chunk, s) {
    var _a, _b;
    // failed records whether the match has failed.
    // After the match fails, the loop continues on processing chunk,
    // checking that the pattern is well-formed but no longer reading s.
    var failed = false;
    while (chunk.length > 0) {
        if (!failed && s.length == 0) {
            failed = true;
        }
        switch (chunk[0]) {
            case '[':
                // character class
                var r = 0;
                if (!failed) {
                    r = s.charCodeAt(0);
                    s = s.substring(1);
                }
                chunk = chunk.substring(1);
                // possibly negated
                var negated = false;
                if (chunk.length > 0 && chunk[0] == '^') {
                    negated = true;
                    chunk = chunk.substring(1);
                }
                // parse all ranges
                var match_1 = false;
                var nrange = 0;
                while (true) {
                    if (chunk.length > 0 && chunk[0] == ']' && nrange > 0) {
                        chunk = chunk.substring(1);
                        break;
                    }
                    var lo = 0;
                    var hi = 0;
                    _a = __read(getEsc(chunk), 2), lo = _a[0], chunk = _a[1];
                    hi = lo;
                    if (chunk[0] == '-') {
                        _b = __read(getEsc(chunk.substring(1)), 2), hi = _b[0], chunk = _b[1];
                    }
                    if (lo <= r && r <= hi) {
                        match_1 = true;
                    }
                    nrange++;
                }
                if (match_1 == negated) {
                    failed = true;
                }
                break;
            case '?':
                if (!failed) {
                    if (s[0] == '/') {
                        failed = true;
                    }
                    s = s.substring(1);
                }
                chunk = chunk.substring(1);
                break;
            case '\\':
                chunk = chunk.substring(1);
                if (chunk.length == 0) {
                    throw new SyntaxError('syntax error in pattern');
                }
            default:
                if (!failed) {
                    if (chunk[0] != s[0]) {
                        failed = true;
                    }
                    s = s.substring(1);
                }
                chunk = chunk.substring(1);
                break;
        }
    }
    if (failed) {
        return;
    }
    return s;
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
function match(pattern, name) {
    var _a, _b;
    Pattern: while (pattern.length != 0) {
        var star = void 0;
        var chunk = void 0;
        _a = __read(scanChunk(pattern), 3), star = _a[0], chunk = _a[1], pattern = _a[2];
        if (star && chunk == '') {
            // Trailing * matches rest of string unless it has a /.
            return name.indexOf('/') < 0;
        }
        // Look for match at current position.
        var t = matchChunk(chunk, name);
        if (t !== undefined && (t.length == 0 || pattern.length > 0)) {
            name = t;
            continue;
        }
        if (star) {
            // Look for match skipping i+1 bytes.
            // Cannot skip /.
            for (var i = 0; i < name.length && name[i] != '/'; i++) {
                t = matchChunk(chunk, name.substring(i + 1));
                if (t !== undefined) {
                    // if we're the last chunk, make sure we exhausted the name
                    if (pattern.length == 0 && t.length > 0) {
                        continue;
                    }
                    name = t;
                    continue Pattern;
                }
            }
        }
        // Before returning false with no error,
        // check that the remainder of the pattern is syntactically valid.
        while (pattern.length > 0) {
            var _ = void 0;
            _b = __read(scanChunk(pattern), 3), _ = _b[0], chunk = _b[1], pattern = _b[2];
            matchChunk(chunk, "");
        }
        return false;
    }
    return name.length == 0;
}
exports.match = match;
//# sourceMappingURL=match.js.map