"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = exports.forEach = exports.before = exports.after = void 0;
const types_1 = require("./types");
const types_2 = require("../core/types");
/**
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 */
function checkIterator(begin, end) {
    const c = begin.c;
    if (!c) { // deleted 
        throw types_1.errIteratorInvalid;
    }
    if (end) {
        if (!end.c) {
            throw types_1.errIteratorInvalid;
        }
        else if (c != end.c || begin.r != end.r) {
            throw types_1.errRangeNotMatched;
        }
        else if (end.ok) {
            if (begin.ok) {
                if (begin.same(end)) {
                    return;
                }
            }
            else {
                throw types_1.errBadRange;
            }
        }
    }
    else if (begin.ok) {
        return new types_2.Pair(begin, begin.r ? c.rend() : c.end());
    }
    return;
}
function getArray(begin, end) {
    const r = checkIterator(begin, end);
    if (!r) {
        return;
    }
    const result = new Array();
    let it = r.first;
    if (r.second.ok) {
        while (it.ok) {
            result.push(it.get());
            if (it.same(r.second)) {
                return result;
            }
            it = it.next();
        }
        throw types_1.errBadRange;
    }
    while (it.ok) {
        result.push(it.get());
        it = it.next();
    }
    return result;
}
function hasAlgorithm(it, name) {
    const c = it.c;
    if (!c) { // deleted 
        throw types_1.errIteratorInvalid;
    }
    else if (c instanceof types_1.Basic) {
        return;
    }
}
/**
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
function after(position, begin, end) {
    if (!position.ok || !position.c) {
        throw types_1.errIteratorInvalid;
    }
    const vals = getArray(begin, end);
    if (!vals) {
        return;
    }
    position.c.after(position, ...vals);
}
exports.after = after;
/**
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
function before(position, begin, end) {
    if (!position.ok || !position.c) {
        throw types_1.errIteratorInvalid;
    }
    const vals = getArray(begin, end);
    if (!vals) {
        return;
    }
    position.c.before(position, ...vals);
}
exports.before = before;
/**
 * Call the callback in turn for each data in the container
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 */
function forEach(callback, begin, end) {
    const vals = getArray(begin, end);
    if (!vals) {
        return;
    }
    for (const v of vals) {
        callback(v);
    }
}
exports.forEach = forEach;
/**
 * convert iterator to array
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 */
function map(callback, begin, end) {
    if (!begin.c) {
    }
    const vals = getArray(begin, end);
    const result = new Array();
    if (vals) {
        for (const v of vals) {
            result.push(callback(v));
        }
    }
    return result;
}
exports.map = map;
//# sourceMappingURL=algorithms.js.map