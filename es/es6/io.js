var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// deno-lint-ignore-file no-explicit-any
import { Exception } from "./core/exception";
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
export function readAtLeast(r, buf, min) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buf.length < min) {
            throw errShortWrite;
        }
        let n = 0;
        while (n < min) {
            const nn = yield r.read(buf);
            if (nn === null) {
                break;
            }
            n += nn;
        }
        if (n < min) {
            throw errUnexpectedEOF;
        }
        return n;
    });
}
export function readFull(r, buf) {
    return readAtLeast(r, buf, buf.length);
}
export class LimitReader {
    constructor(r, n) {
        this.r = r;
        this.n = n;
    }
    read(p) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.n <= 0) {
                return 0;
            }
            if (p.length > this.n) {
                p = p.subarray(0, this.n);
            }
            const n = (_a = yield this.r.read(p)) !== null && _a !== void 0 ? _a : 0;
            if (n == 0) {
                this.n = 0;
            }
            else {
                this.n -= n;
            }
            return n;
        });
    }
}
export function copyN(dst, src, n) {
    return copy(dst, new LimitReader(src, n));
}
export function _copyBuffer(dst, src, buf) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
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
            const nr = (_a = yield src.read(buf)) !== null && _a !== void 0 ? _a : 0;
            if (nr == 0) {
                break;
            }
            const nw = yield dst.write(buf.subarray(0, nr));
            num += nw;
            if (nr < nw) {
                throw errInvalidWrite;
            }
            if (nr != nw) {
                throw errShortWrite;
            }
        }
        return num;
    });
}
export function copy(dst, src) {
    return _copyBuffer(dst, src);
}
export function copyBuffer(dst, src, buf) {
    return _copyBuffer(dst, src, buf);
}
//# sourceMappingURL=io.js.map