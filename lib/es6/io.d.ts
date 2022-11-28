import { Exception } from "./core/exception";
/**
 * means that EOF was encountered in the middle of reading a fixed-size block or data structure.
 */
export declare const errUnexpectedEOF: Exception;
/**
 * means that a read required a longer buffer than was provided.
 */
export declare const errShortWrite: Exception;
/**
 * means that a write returned an impossible count.
 */
export declare const errInvalidWrite: Exception;
export interface Reader {
    read(b: Uint8Array): Promise<number | null>;
}
export interface WriterTo {
    writeTo(w: Writer): Promise<number>;
}
export declare function isWriterTo(r: any): r is WriterTo;
export interface Writer {
    write(b: Uint8Array): Promise<number>;
}
export interface ReaderFrom {
    readFrom(r: Reader): Promise<number>;
}
interface Closer {
    close(): void;
}
export interface ReadWriter extends Reader, Writer {
}
export interface WriteCloser extends Writer, Closer {
}
export interface ReadWriteCloser extends Reader, Writer, Closer {
}
export declare enum Seek {
    Start = 0,
    Current = 1,
    End = 2
}
export interface Seeker {
    seek(offset: number, whence: 0 | 1 | 2): Promise<number>;
}
export interface ReadSeeker extends Reader, Seeker {
}
export interface ReadSeekCloser extends Reader, Seeker, Closer {
}
export interface WriteSeeker extends Writer, Seeker {
}
export interface ReadWriteSeeker extends Reader, Writer, Seeker {
}
export declare function isReaderFrom(r: any): r is ReaderFrom;
export declare function readAtLeast(r: Reader, buf: Uint8Array, min: number): Promise<number>;
export declare function readFull(r: Reader, buf: Uint8Array): Promise<number>;
export declare class LimitReader implements Reader {
    readonly r: Reader;
    n: number;
    constructor(r: Reader, n: number);
    read(p: Uint8Array): Promise<number | null>;
}
export declare function copyN(dst: Writer, src: Reader, n: number): Promise<number>;
export declare function _copyBuffer(dst: Writer, src: Reader, buf?: Uint8Array): Promise<number>;
export declare function copy(dst: Writer, src: Reader): Promise<number>;
export declare function copyBuffer(dst: Writer, src: Reader, buf: Uint8Array): Promise<number>;
export {};
