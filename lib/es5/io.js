"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyBuffer = exports.copy = exports._copyBuffer = exports.copyN = exports.LimitReader = exports.readFull = exports.readAtLeast = exports.isReaderFrom = exports.Seek = exports.isWriterTo = exports.errInvalidWrite = exports.errShortWrite = exports.errUnexpectedEOF = void 0;
// deno-lint-ignore-file no-explicit-any
var exception_1 = require("./core/exception");
/**
 * means that EOF was encountered in the middle of reading a fixed-size block or data structure.
 */
exports.errUnexpectedEOF = new exception_1.Exception("unexpected EOF");
/**
 * means that a read required a longer buffer than was provided.
 */
exports.errShortWrite = new exception_1.Exception("short write");
/**
 * means that a write returned an impossible count.
 */
exports.errInvalidWrite = new exception_1.Exception("invalid write result");
function isWriterTo(r) {
    try {
        return typeof r.writeTo === "function";
    }
    catch (_) {
        return false;
    }
}
exports.isWriterTo = isWriterTo;
var Seek;
(function (Seek) {
    /* Seek from the start of the file/resource. */
    Seek[Seek["Start"] = 0] = "Start";
    /* Seek from the current position within the file/resource. */
    Seek[Seek["Current"] = 1] = "Current";
    /* Seek from the end of the current file/resource. */
    Seek[Seek["End"] = 2] = "End";
})(Seek = exports.Seek || (exports.Seek = {}));
function isReaderFrom(r) {
    try {
        return typeof r.readFrom === "function";
    }
    catch (_) {
        return false;
    }
}
exports.isReaderFrom = isReaderFrom;
function readAtLeast(r, buf, min) {
    return __awaiter(this, void 0, void 0, function () {
        var n, nn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (buf.length < min) {
                        throw exports.errShortWrite;
                    }
                    n = 0;
                    _a.label = 1;
                case 1:
                    if (!(n < min)) return [3 /*break*/, 3];
                    return [4 /*yield*/, r.read(buf)];
                case 2:
                    nn = _a.sent();
                    if (nn === null) {
                        return [3 /*break*/, 3];
                    }
                    n += nn;
                    return [3 /*break*/, 1];
                case 3:
                    if (n < min) {
                        throw exports.errUnexpectedEOF;
                    }
                    return [2 /*return*/, n];
            }
        });
    });
}
exports.readAtLeast = readAtLeast;
function readFull(r, buf) {
    return readAtLeast(r, buf, buf.length);
}
exports.readFull = readFull;
var LimitReader = /** @class */ (function () {
    function LimitReader(r, n) {
        this.r = r;
        this.n = n;
    }
    LimitReader.prototype.read = function (p) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var n;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.n <= 0) {
                            return [2 /*return*/, 0];
                        }
                        if (p.length > this.n) {
                            p = p.subarray(0, this.n);
                        }
                        return [4 /*yield*/, this.r.read(p)];
                    case 1:
                        n = (_a = _b.sent()) !== null && _a !== void 0 ? _a : 0;
                        if (n == 0) {
                            this.n = 0;
                        }
                        else {
                            this.n -= n;
                        }
                        return [2 /*return*/, n];
                }
            });
        });
    };
    return LimitReader;
}());
exports.LimitReader = LimitReader;
function copyN(dst, src, n) {
    return copy(dst, new LimitReader(src, n));
}
exports.copyN = copyN;
function _copyBuffer(dst, src, buf) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var size, num, nr, nw;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isWriterTo(src)) {
                        return [2 /*return*/, src.writeTo(dst)];
                    }
                    if (isReaderFrom(dst)) {
                        return [2 /*return*/, dst.readFrom(src)];
                    }
                    if (!buf) {
                        size = 1024 * 32;
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
                    num = 0;
                    _b.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, src.read(buf)];
                case 2:
                    nr = (_a = _b.sent()) !== null && _a !== void 0 ? _a : 0;
                    if (nr == 0) {
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, dst.write(buf.subarray(0, nr))];
                case 3:
                    nw = _b.sent();
                    num += nw;
                    if (nr < nw) {
                        throw exports.errInvalidWrite;
                    }
                    if (nr != nw) {
                        throw exports.errShortWrite;
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, num];
            }
        });
    });
}
exports._copyBuffer = _copyBuffer;
function copy(dst, src) {
    return _copyBuffer(dst, src);
}
exports.copy = copy;
function copyBuffer(dst, src, buf) {
    return _copyBuffer(dst, src, buf);
}
exports.copyBuffer = copyBuffer;
//# sourceMappingURL=io.js.map