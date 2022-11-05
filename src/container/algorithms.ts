import { errRangeNotMatched, errIteratorInvalid, ExpandIterator, errBadRange } from './types';
import { Pair } from '../core/types';
/**
 * 
 * @throws 
 * {@link errRangeNotMatched}  
 * {@link errIteratorInvalid}
 */
function checkIterator<T>(begin: ExpandIterator<T>, end?: ExpandIterator<T>): Pair<ExpandIterator<T>, | ExpandIterator<T>> | undefined {
    const c = begin.c
    if (!c) { // deleted 
        throw errIteratorInvalid
    }
    if (end) {
        if (!end.c) {
            throw errIteratorInvalid
        } else if (c != end.c || begin.r != end.r) {
            throw errRangeNotMatched
        } else if (end.ok) {
            if (begin.ok) {
                if (begin.same(end)) {
                    return
                }
            } else {
                throw errBadRange
            }
        }
    } else if (begin.ok) {
        return new Pair(begin, begin.r ? c.rend() : c.end())
    }
    return
}
function getArray<T>(begin: ExpandIterator<T>, end?: ExpandIterator<T>): Array<T> | undefined {
    const r = checkIterator(begin, end)
    if (!r) {
        return
    }

    const result = new Array<any>()
    let it = r.first
    if (r.second.ok) {
        while (it.ok) {
            result.push(it.get())
            if (it.same(r.second)) {
                return result
            }
            it = it.next()
        }
        throw errBadRange
    }

    while (it.ok) {
        result.push(it.get())
        it = it.next()
    }
    return result
}
/**
 * 
 * @throws 
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
export function after<T>(position: ExpandIterator<T>, begin: ExpandIterator<T>, end?: ExpandIterator<T>) {
    if (!position.ok || !position.c) {
        throw errIteratorInvalid
    }

    const vals = getArray(begin, end)
    if (!vals) {
        return
    }

    position.c.after(position, ...vals)
}
/**
 * 
 * @throws 
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
export function before<T>(position: ExpandIterator<T>, begin: ExpandIterator<T>, end?: ExpandIterator<T>) {
    if (!position.ok || !position.c) {
        throw errIteratorInvalid
    }

    const vals = getArray(begin, end)
    if (!vals) {
        return
    }

    position.c.before(position, ...vals)
}
/**
 * Call the callback in turn for each data in the container
 * 
 * @throws 
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 */
export function forEach<T>(callback: (data: T) => void, begin: ExpandIterator<T>, end?: ExpandIterator<T>): void {
    const vals = getArray(begin, end)
    if (!vals) {
        return
    }
    for (const v of vals) {
        callback(v)
    }
}
export function map<T, To>(callback: (data: T) => To, begin: ExpandIterator<T>, end?: ExpandIterator<T>): Array<To> {
    const vals = getArray(begin, end)
    const result = new Array<To>()
    if (vals) {
        for (const v of vals) {
            result.push(callback(v))
        }
    }
    return result
}