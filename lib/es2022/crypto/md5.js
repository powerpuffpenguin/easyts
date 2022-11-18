"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MD5 = exports.BlockSize = exports.Size = void 0;
/**
 * The size of an MD5 checksum in bytes.
 */
exports.Size = 16;
/**
 * The blocksize of MD5 in bytes.
 */
exports.BlockSize = 64;
const init0 = 0x67452301;
const init1 = 0xEFCDAB89;
const init2 = 0x98BADCFE;
const init3 = 0x10325476;
class MD5 {
    s = new Uint32Array(4);
    x = new Uint8Array(exports.BlockSize);
    nx = 0;
    len = BigInt(0);
    constructor() {
        this.reset();
    }
    reset() {
        this.s[0] = init0;
        this.s[1] = init1;
        this.s[2] = init2;
        this.s[3] = init3;
        this.nx = 0;
        this.len = BigInt(0);
    }
    size() { return exports.Size; }
    blockSize() { return exports.BlockSize; }
    write(p) {
        // Note that we currently call block or blockGeneric
        // directly (guarded using haveAsm) because this allows
        // escape analysis to see that p and d don't escape.
        let nn = p.length;
        this.len += BigInt(nn);
        if (this.nx > 0) {
            //     n := copy(d.x[d.nx:], p)
            //     d.nx += n
            //     if d.nx == BlockSize {
            //         if haveAsm {
            //             block(d, d.x[:])
            //         } else {
            //             blockGeneric(d, d.x[:])
            //         }
            //         d.nx = 0
            //     }
            //     p = p[n:]
        }
        // if len(p) >= BlockSize {
        //     n := len(p) &^ (BlockSize - 1)
        //     if haveAsm {
        //         block(d, p[:n])
        //     } else {
        //         blockGeneric(d, p[:n])
        //     }
        //     p = p[n:]
        // }
        // if len(p) > 0 {
        //     d.nx = copy(d.x[:], p)
        // }
        return 0;
    }
    p() {
        console.log(this.s[0] == init0);
        console.log(this.s[1] == init1);
        console.log(this.s[2] == init2);
        console.log(this.s[3] == init3);
    }
}
exports.MD5 = MD5;
const m = new MD5();
m.p();
const b0 = new ArrayBuffer(8);
const v0 = new DataView(b0, 1, 4);
console.log(v0.byteLength, v0.byteOffset);
const b = new TextEncoder().encode('123');
console.log(b.byteLength);
//# sourceMappingURL=md5.js.map