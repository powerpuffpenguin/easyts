import { defaultAssert } from "../assert";
import { CodeException } from "../exception";
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["UnexpectedEOF"] = 1] = "UnexpectedEOF";
    ErrorCode[ErrorCode["ShortWrite"] = 2] = "ShortWrite";
    ErrorCode[ErrorCode["InvalidWrite"] = 3] = "InvalidWrite";
})(ErrorCode || (ErrorCode = {}));
export class IOException extends CodeException {
}
export function isWriterTo(r) {
    try {
        return typeof r.writeTo === "function";
    }
    catch (_) {
        return false;
    }
}
export var Seek;
(function (Seek) {
    /* Seek from the start of the file/resource. */
    Seek[Seek["Start"] = 0] = "Start";
    /* Seek from the current position within the file/resource. */
    Seek[Seek["Current"] = 1] = "Current";
    /* Seek from the end of the current file/resource. */
    Seek[Seek["End"] = 2] = "End";
})(Seek || (Seek = {}));
export function isReaderFrom(r) {
    try {
        return typeof r.readFrom === "function";
    }
    catch (_) {
        return false;
    }
}
export async function readAtLeast(r, buf, min) {
    defaultAssert.isUInt({
        name: 'nin',
        val: min,
        max: buf.length,
    });
    let n = 0;
    while (n < min) {
        const nn = await r.read(buf);
        if (nn === null) {
            break;
        }
        n += nn;
    }
    if (n < min) {
        throw new IOException(ErrorCode.UnexpectedEOF, `readAtLeast read ${n} bytes, ${min} bytes less than expected`);
    }
    return n;
}
export function readFull(r, buf) {
    return readAtLeast(r, buf, buf.length);
}
export class LimitReader {
    constructor(r, n) {
        this.r = r;
        this.n = n;
    }
    async read(p) {
        if (this.n <= 0) {
            return 0;
        }
        if (p.length > this.n) {
            p = p.subarray(0, this.n);
        }
        const n = await this.r.read(p) ?? 0;
        if (n == 0) {
            this.n = 0;
        }
        else {
            this.n -= n;
        }
        return n;
    }
}
export function copyN(dst, src, n) {
    defaultAssert.isUInt({
        name: 'n',
        val: n,
    });
    return copy(dst, new LimitReader(src, n));
}
export async function _copyBuffer(dst, src, buf) {
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
            }
            else {
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
        if (nw < 0 || nr < nw) {
            throw new IOException(ErrorCode.InvalidWrite, `io returned an invalid number of bytes written, read=${nr} write=${nw}`);
        }
        if (nr != nw) {
            throw new IOException(ErrorCode.ShortWrite, `io writes fewer bytes than reads, read=${nr} write=${nw}`);
        }
    }
    return num;
}
export function copy(dst, src) {
    return _copyBuffer(dst, src);
}
export function copyBuffer(dst, src, buf) {
    return _copyBuffer(dst, src, buf);
}
//# sourceMappingURL=io.js.map