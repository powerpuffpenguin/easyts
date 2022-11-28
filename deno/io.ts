// deno-lint-ignore-file no-explicit-any
import { Exception } from './core/exception.ts';
/**
 * means that EOF was encountered in the middle of reading a fixed-size block or data structure.
 */
export const errUnexpectedEOF = new Exception("unexpected EOF");
/**
 * means that a read required a longer buffer than was provided.
 */
export const errShortWrite = new Exception("short write");
/**
 * means that a write returned an impossible count.
 */
export const errInvalidWrite = new Exception("invalid write result");
export interface Reader {
    read(b: Uint8Array): Promise<number | null>;
}
export interface WriterTo {
    writeTo(w: Writer): Promise<number>;
}
export function isWriterTo(r: any): r is WriterTo {
    try {
        return typeof r.writeTo === "function";
    } catch (_) {
        return false;
    }
}
export interface Writer {
    write(b: Uint8Array): Promise<number>;
}
export interface ReaderFrom {
    readFrom(r: Reader): Promise<number>;
}
interface Closer {
    close(): void;
}
export interface ReadWriter extends Reader, Writer { }
export interface WriteCloser extends Writer, Closer { }
export interface ReadWriteCloser extends Reader, Writer, Closer { }
export enum Seek {
    /* Seek from the start of the file/resource. */
    Start = 0,
    /* Seek from the current position within the file/resource. */
    Current = 1,
    /* Seek from the end of the current file/resource. */
    End = 2,
}
export interface Seeker {
    seek(offset: number, whence: 0 | 1 | 2): Promise<number>;
}
export interface ReadSeeker extends Reader, Seeker { }
export interface ReadSeekCloser extends Reader, Seeker, Closer { }
export interface WriteSeeker extends Writer, Seeker { }
export interface ReadWriteSeeker extends Reader, Writer, Seeker { }

export function isReaderFrom(r: any): r is ReaderFrom {
    try {
        return typeof r.readFrom === "function";
    } catch (_) {
        return false;
    }
}
export async function readAtLeast(
    r: Reader,
    buf: Uint8Array,
    min: number,
): Promise<number> {
    if (buf.length < min) {
        throw errShortWrite;
    }
    let n = 0;
    while (n < min) {
        const nn = await r.read(buf);
        if (nn === null) {
            break;
        }
        n += nn;
    }
    if (n < min) {
        throw errUnexpectedEOF;
    }
    return n;
}
export function readFull(r: Reader, buf: Uint8Array): Promise<number> {
    return readAtLeast(r, buf, buf.length);
}
export class LimitReader implements Reader {
    constructor(
        public readonly r: Reader,
        public n: number,
    ) { }
    async read(p: Uint8Array): Promise<number | null> {
        if (this.n <= 0) {
            return 0;
        }
        if (p.length > this.n) {
            p = p.subarray(0, this.n);
        }
        const n = await this.r.read(p) ?? 0;
        if (n == 0) {
            this.n = 0;
        } else {
            this.n -= n;
        }
        return n;
    }
}
export function copyN(dst: Writer, src: Reader, n: number): Promise<number> {
    return copy(dst, new LimitReader(src, n));
}
export async function _copyBuffer(
    dst: Writer,
    src: Reader,
    buf?: Uint8Array,
): Promise<number> {
    if (isWriterTo(src)) {
        return src.writeTo(dst);
    }
    if (isReaderFrom(dst)) {
        return dst.readFrom(src);
    }
    if (!buf) {
        let size = 1024 * 32;
        if (src instanceof LimitReader) {
            if (src.n < 1) {
                size = 1;
            } else {
                size = src.n;
            }
        }
        buf = new Uint8Array(size);
    }

    let num = 0;
    while (true) {
        const nr = await src.read(buf) ?? 0;
        if (nr == 0) {
            break;
        }
        const nw = await dst.write(buf.subarray(0, nr));
        num += nw;
        if (nr < nw) {
            throw errInvalidWrite;
        }
        if (nr != nw) {
            throw errShortWrite;
        }
    }
    return num;
}
export function copy(
    dst: Writer,
    src: Reader,
): Promise<number> {
    return _copyBuffer(dst, src);
}
export function copyBuffer(
    dst: Writer,
    src: Reader,
    buf: Uint8Array,
): Promise<number> {
    return _copyBuffer(dst, src, buf);
}
