
class lazybuf {
    buf: Array<string> | undefined
    w = 0
    constructor(public s: string) { }
    index(i: number): string {
        const buf = this.buf
        return buf ? buf[i] : this.s[i]
    }
    append(c: string) {
        let buf = this.buf
        if (!buf) {
            const s = this.s
            if (this.w < s.length && s[this.w] == c) {
                this.w++
                return
            }
            buf = Array.from(s)
            this.buf = buf
        }
        buf[this.w++] = c
    }
    toString(): string {
        const buf = this.buf
        if (buf) {
            buf.splice(this.w)
            return buf.join('')
        }
        return this.s.substring(0, this.w)
    }
}


/**
 * Join joins any number of path elements into a single path,  separating them with slashes. Empty elements are ignored. The result is Cleaned. However, if the argument list is  empty or all its elements are empty, Join returns an empty string.
 */
export function join(...elem: Array<string>): string {
    if (elem.length == 0) {
        return ''
    }
    const buf = new Array<string>()
    for (const e of elem) {
        if (e != '') {
            buf.push(e)
        }
    }

    return buf.length == 0 ? '' : clean(buf.join('/'))
}
/**
 * returns the shortest path name equivalent to path  by purely lexical processing.
 */
export function clean(path: string): string {
    if (path == '') {
        return '.'
    }
    let rooted = path[0] == '/'
    let n = path.length

    // Invariants:
    //	reading from path; r is index of next byte to process.
    //	writing to buf; w is index of next byte to write.
    //	dotdot is index in buf where .. must stop, either because
    //		it is the leading slash or it is a leading ../../.. prefix.
    let out = new lazybuf(path)
    let r = 0, dotdot = 0
    if (rooted) {
        out.append('/')
        r = 1
        dotdot = 1
    }

    while (r < n) {
        if (path[r] == '/') {
            // empty path element
            r++
        } else if (path[r] == '.' && (r + 1 == n || path[r + 1] == '/')) {
            // . element
            r++
        } else if (path[r] == '.' && path[r + 1] == '.' && (r + 2 == n || path[r + 2] == '/')) {
            // .. element: remove to last /
            r += 2
            if (out.w > dotdot) {
                // can backtrack
                out.w--
                while (out.w > dotdot && out.index(out.w) != '/') {
                    out.w--
                }
            } else if (!rooted) {
                // cannot backtrack, but not rooted, so append .. element.
                if (out.w > 0) {
                    out.append('/')
                }
                out.append('.')
                out.append('.')
                dotdot = out.w
            }
        } else {
            // real path element.
            // add slash if needed
            if ((rooted && out.w != 1) || (!rooted && out.w != 0)) {
                out.append('/')
            }
            // copy element
            for (; r < n && path[r] != '/'; r++) {
                out.append(path[r])
            }
        }
    }

    // Turn empty string into "."
    if (out.w == 0) {
        return "."
    }
    return out.toString()
}
/**
 * returns the file name extension used by path
 */
export function ext(path: string): string {
    for (let i = path.length - 1; i >= 0 && path[i] != '/'; i--) {
        if (path[i] == '.') {
            return path.substring(i)
        }
    }
    return ''
}
/**
 * returns the last element of path. Trailing slashes are removed before extracting the last element.
 * @returns If the path is empty, Base returns ".". If the path consists entirely of slashes, Base returns "/".
 */
export function base(path: string): string {
    if (path == "") {
        return "."
    }

    // Strip trailing slashes.
    let end = path.length
    while (end > 0 && path[end - 1] == '/') {
        end--
    }
    if (end == 0) {
        return "/"
    }
    // Find the last element
    let start = end - 1
    while (start >= 0 && path[start] != '/') {
        start--
    }
    start++


    // If empty now, it had only slashes.
    if (start == end) {
        return "/"
    }
    return start == 0 && end == path.length ? path : path.substring(start, end)
}
/**
 * splits path immediately following the final slash, separating it into a directory and file name component.  If there is no slash in path, Split returns an empty dir and file set to path.
 * @returns [dir,file] The returned values have the property that path = dir+file.
 */
export function split(path: string): Array<string> {
    let end = path.length
    let start = end - 1
    while (start >= 0 && path[start] != '/') {
        start--
    }
    start++
    return [
        start == 0 ? '' : path.substring(0, start),
        start == 0 ? path : path.substring(start)
    ]
}

/**
 * returns all but the last element of path, typically the path's directory.
 * 
 * @remarks
 * After dropping the final element using Split, the path is Cleaned and trailing slashes are removed.
 * If the path is empty, Dir returns ".".
 * If the path consists entirely of slashes followed by non-slash bytes, Dir returns a single slash. In any other case, the returned path does not end in a slash.
 */
export function dir(path: string): string {
    let end = path.length
    let start = end - 1
    while (start >= 0 && path[start] != '/') {
        start--
    }
    start++

    return clean(start == 0 ? '' : path.substring(0, start))
}
/**
 * reports whether the path is absolute.
 */
export function isAbs(path: string): boolean {
    return path.length > 0 && path[0] == '/'
}

