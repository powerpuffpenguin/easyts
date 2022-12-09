"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitHostPort = exports.joinHostPort = exports.IPNet = exports.networkNumberAndMask = exports.parseCIDR = exports.IP = exports.IPMask = exports.IPv6len = exports.IPv4len = exports.AddrError = void 0;
var assert_1 = require("../assert");
var exception_1 = require("../exception");
var AddrError = /** @class */ (function (_super) {
    __extends(AddrError, _super);
    function AddrError(addr, err) {
        var _this = _super.call(this, addr == '' ? err : "address ".concat(addr, ": ").concat(err)) || this;
        _this.addr = addr;
        _this.err = err;
        return _this;
    }
    return AddrError;
}(exception_1.Exception));
exports.AddrError = AddrError;
exports.IPv4len = 4;
exports.IPv6len = 16;
// Bigger than we need, not too big to worry about overflow
var big = 0xFFFFFF;
function bytesEqual(l, r) {
    for (var i = 0; i < l.length; i++) {
        if (l[i] != r[i]) {
            return false;
        }
    }
    return true;
}
// Decimal to integer.
// Returns number, characters consumed, success.
function dtoi(s) {
    var n = 0;
    var i = 0;
    for (i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        if (!(48 <= code && code <= 57)) {
            break;
        }
        n = n * 10 + (code - 48);
        if (n >= big) {
            return [big, i, false];
        }
    }
    if (i == 0) {
        return [0, 0, false];
    }
    return [n, i, true];
}
// Hexadecimal to integer.
// Returns number, characters consumed, success.
function xtoi(s) {
    var n = 0;
    var i = 0;
    for (i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (48 <= c && c <= 57) { // '0' <= s[i] && s[i] <= '9'
            n *= 16;
            n += c - 48;
        }
        else if (97 <= c && c <= 102) { // 'a' <= s[i] && s[i] <= 'f'
            n *= 16;
            n += c - 97 + 10;
        }
        else if (65 <= c && c <= 70) { // 'A' <= s[i] && s[i] <= 'F'
            n *= 16;
            n += c - 65 + 10;
        }
        else {
            break;
        }
        if (n >= big) {
            return [0, i, false];
        }
    }
    if (i == 0) {
        return [0, i, false];
    }
    return [n, i, true];
}
function parseIPv4(s) {
    var p = new Uint8Array(exports.IPv4len);
    for (var i = 0; i < exports.IPv4len; i++) {
        if (s.length == 0) {
            // Missing octets.
            return undefined;
        }
        if (i > 0) {
            if (s[0] != ".") {
                return undefined;
            }
            s = s.substring(1);
        }
        var _a = __read(dtoi(s), 3), n = _a[0], c = _a[1], ok = _a[2];
        if (!ok || n > 0xFF) {
            return undefined;
        }
        if (c > 1 && s[0] == "0") {
            // Reject non-zero components with leading zeroes.
            return undefined;
        }
        s = s.substring(c);
        p[i] = n;
    }
    if (s.length != 0) {
        return;
    }
    return IP.v4(p[0], p[1], p[2], p[3]);
}
// parseIPv6 parses s as a literal IPv6 address described in RFC 4291
// and RFC 5952.
function parseIPv6(s) {
    var ip = new Uint8Array(exports.IPv6len);
    var ellipsis = -1; // position of ellipsis in ip
    // Might have leading ellipsis
    if (s.length >= 2 && s[0] == ":" && s[1] == ":") {
        ellipsis = 0;
        s = s.substring(2);
        // Might be only ellipsis
        if (s.length == 0) {
            return ip;
        }
    }
    // Loop, parsing hex numbers followed by colon.
    var i = 0;
    while (i < exports.IPv6len) {
        // Hex number.
        var _a = __read(xtoi(s), 3), n = _a[0], c = _a[1], ok = _a[2];
        if (!ok || n > 0xFFFF) {
            return;
        }
        // If followed by dot, might be in trailing IPv4.
        if (c < s.length && s[c] == ".") {
            if (ellipsis < 0 && i != exports.IPv6len - exports.IPv4len) {
                // Not the right place.
                return;
            }
            if (i + exports.IPv4len > exports.IPv6len) {
                // Not enough room.
                return;
            }
            var ip4 = parseIPv4(s);
            if (ip4 === undefined) {
                return;
            }
            ip[i] = ip4.ip[12];
            ip[i + 1] = ip4.ip[13];
            ip[i + 2] = ip4.ip[14];
            ip[i + 3] = ip4.ip[15];
            s = "";
            i += exports.IPv4len;
            break;
        }
        // Save this 16-bit chunk.
        ip[i] = n >>> 8;
        ip[i + 1] = n;
        i += 2;
        // Stop at end of string.
        s = s.substring(c);
        if (s.length == 0) {
            break;
        }
        // Otherwise must be followed by colon and more.
        if (s[0] != ":" || s.length == 1) {
            return;
        }
        s = s.substring(1);
        // Look for ellipsis.
        if (s[0] == ":") {
            if (ellipsis >= 0) { // already have one
                return;
            }
            ellipsis = i;
            s = s.substring(1);
            if (s.length == 0) { // can be at end
                break;
            }
        }
    }
    // Must have used entire string.
    if (s.length != 0) {
        return;
    }
    // If didn't parse enough, expand ellipsis.
    if (i < exports.IPv6len) {
        if (ellipsis < 0) {
            return;
        }
        var n = exports.IPv6len - i;
        for (var j = i - 1; j >= ellipsis; j--) {
            ip[j + n] = ip[j];
        }
        for (var j = ellipsis + n - 1; j >= ellipsis; j--) {
            ip[j] = 0;
        }
    }
    else if (ellipsis >= 0) {
        // Ellipsis must represent at least one 0 group.
        return;
    }
    return ip;
}
var hexDigit = "0123456789abcdef";
function hexString(b) {
    var s = new Array(b.length * 2);
    for (var i = 0; i < b.length; i++) {
        var tn = b[i];
        s[i * 2] = hexDigit[tn >>> 4];
        s[i * 2 + 1] = hexDigit[tn & 0xf];
    }
    return s.join("");
}
// ubtoa encodes the string form of the integer v to dst[start:] and
// returns the number of bytes written to dst. The caller must ensure
// that dst has sufficient length.
function ubtoa(dst, start, v) {
    if (v < 10) {
        dst[start] = String.fromCharCode(v + 48); // v+ '0'
        return 1;
    }
    else if (v < 100) {
        dst[start + 1] = String.fromCharCode(v % 10 + 48); // v%10 + '0'
        dst[start] = String.fromCharCode(Math.floor(v / 10) + 48); // v/10 + '0'
        return 2;
    }
    dst[start + 2] = String.fromCharCode(v % 10 + 48); // v%10 + '0'
    dst[start + 1] = String.fromCharCode(Math.floor((v / 10) % 10) + 48); // (v/10)%10 + '0'
    dst[start] = String.fromCharCode(Math.floor(v / 100) + 48); // v/100 + '0'
    return 3;
}
// If mask is a sequence of 1 bits followed by 0 bits,
// return the number of 1 bits.
function simpleMaskLength(mask) {
    var n = 0;
    for (var i = 0; i < mask.length; i++) {
        var v = mask[i];
        if (v == 0xff) {
            n += 8;
            continue;
        }
        // found non-ff byte
        // count 1 bits
        while (v & 0x80) {
            n++;
            v <<= 1;
            v &= 0xff;
        }
        // rest must be 0 bits
        if (v) {
            return -1;
        }
        for (i++; i < mask.length; i++) {
            if (mask[i]) {
                return -1;
            }
        }
        break;
    }
    return n;
}
var IPMask = /** @class */ (function () {
    function IPMask(mask) {
        this.mask = mask;
    }
    /**
     * returns the IP mask (in 4-byte form) of the IPv4 mask a.b.c.d.
     */
    IPMask.v4 = function (a, b, c, d) {
        assert_1.defaultAssert.isUInt({
            val: a,
            name: 'a',
            max: 255,
        }, {
            val: b,
            name: 'b',
            max: 255,
        }, {
            val: c,
            name: 'c',
            max: 255,
        }, {
            val: d,
            name: 'd',
            max: 255,
        });
        return new IPMask(new Uint8Array([a, b, c, d]));
    };
    /**
     * returns an IPMask consisting of 'ones' 1 bits followed by 0s up to a total length of 'bits' bits.
     */
    IPMask.cidr = function (ones, bits) {
        assert_1.defaultAssert.isInt({
            val: ones,
            name: "ones",
        }, {
            val: bits,
            name: "bits",
        });
        if (bits != 8 * exports.IPv4len && bits != 8 * exports.IPv6len) {
            return;
        }
        if (ones < 0 || ones > bits) {
            return;
        }
        var l = Math.floor(bits / 8);
        var m = new Uint8Array(l);
        var n = ones;
        for (var i = 0; i < l; i++) {
            if (n >= 8) {
                m[i] = 0xff;
                n -= 8;
                continue;
            }
            m[i] = (~(0xff >>> n)) & 0xff;
            n = 0;
        }
        return new IPMask(m);
    };
    Object.defineProperty(IPMask.prototype, "length", {
        get: function () {
            return this.mask.length;
        },
        enumerable: false,
        configurable: true
    });
    IPMask.prototype.toString = function () {
        return hexString(this.mask);
    };
    /**
     * returns the number of leading ones and total bits in the mask.
     * @remarks
     * If the mask is not in the canonical form--ones followed by zeros--then returns [0,0]
     * @returns [ones:number, bits:number]
     */
    IPMask.prototype.size = function () {
        var ones = simpleMaskLength(this.mask);
        if (ones == -1) {
            return [0, 0];
        }
        return [ones, this.mask.length * 8];
    };
    return IPMask;
}());
exports.IPMask = IPMask;
var classAMask = IPMask.v4(0xff, 0, 0, 0);
var classBMask = IPMask.v4(0xff, 0xff, 0, 0);
var classCMask = IPMask.v4(0xff, 0xff, 0xff, 0);
var v4InV6Prefix = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff]);
function allFF(b) {
    var e_1, _a;
    try {
        for (var b_1 = __values(b), b_1_1 = b_1.next(); !b_1_1.done; b_1_1 = b_1.next()) {
            var c = b_1_1.value;
            if (c != 0xff) {
                return false;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (b_1_1 && !b_1_1.done && (_a = b_1.return)) _a.call(b_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return true;
}
var IP = /** @class */ (function () {
    function IP(ip) {
        this.ip = ip;
    }
    /**
     * returns the IP address (in 16-byte form) of the IPv4 address a.b.c.d.
     */
    IP.v4 = function (a, b, c, d) {
        assert_1.defaultAssert.isUInt({
            val: a,
            name: 'a',
            max: 255,
        }, {
            val: b,
            name: 'b',
            max: 255,
        }, {
            val: c,
            name: 'c',
            max: 255,
        }, {
            val: d,
            name: 'd',
            max: 255,
        });
        var p = new Uint8Array([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0xff,
            0xff,
            0,
            0,
            0,
            0,
        ]);
        p[12] = a;
        p[13] = b;
        p[14] = c;
        p[15] = d;
        return new IP(p);
    };
    /**
     * parses s as an IP address, returning the result.
     * @remarks
     * The string s can be in IPv4 dotted decimal ("192.0.2.1"), IPv6 ("2001:db8::68"), or IPv4-mapped IPv6 ("::ffff:192.0.2.1") form.
     * If s is not a valid textual representation of an IP address, parse returns nil.
     */
    IP.parse = function (s) {
        for (var i = 0; i < s.length; i++) {
            switch (s[i]) {
                case ".":
                    return parseIPv4(s);
                case ":": {
                    var data = parseIPv6(s);
                    return data === undefined ? undefined : new IP(data);
                }
            }
        }
        return;
    };
    Object.defineProperty(IP.prototype, "length", {
        get: function () {
            return this.ip.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * returns the default IP mask for the IP address ip.
     * @remarks
     * Only IPv4 addresses have default masks; DefaultMask returns undefined if ip is not a valid IPv4 address.
     */
    IP.prototype.defaultMask = function () {
        var ip = this.to4();
        if (!ip) {
            return;
        }
        var v = ip.ip[0];
        if (v < 0x80) {
            return classAMask;
        }
        else if (v < 0xC0) {
            return classBMask;
        }
        return classCMask;
    };
    /**
     * reports whether ip and o are the same IP address. An IPv4 address and that same address in IPv6 form are considered to be equal.
     */
    IP.prototype.equal = function (o) {
        var ip = this.ip;
        var x = o.ip;
        if (ip.length == o.length) {
            return bytesEqual(ip, x);
        }
        if (ip.length == exports.IPv4len && x.length == exports.IPv6len) {
            return bytesEqual(x.subarray(0, 12), v4InV6Prefix) &&
                bytesEqual(ip, x.subarray(12));
        }
        if (ip.length == exports.IPv6len && x.length == exports.IPv4len) {
            return bytesEqual(ip.subarray(0, 12), v4InV6Prefix) &&
                bytesEqual(ip.subarray(12), x);
        }
        return false;
    };
    Object.defineProperty(IP.prototype, "isGlobalUnicast", {
        /**
         * reports whether ip is a global unicast address.
         * @remarks
         * The identification of global unicast addresses uses address type
         * identification as defined in RFC 1122, RFC 4632 and RFC 4291 with
         * the exception of IPv4 directed broadcast addresses.
         * It returns true even if ip is in IPv4 private address space or
         * local IPv6 unicast address space.
         */
        get: function () {
            return (this.length == exports.IPv4len || this.length == exports.IPv6len) &&
                !this.equal(IP.v4bcast) &&
                !this.isUnspecified &&
                !this.isLoopback &&
                !this.isMulticast &&
                !this.isLinkLocalUnicast;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isInterfaceLocalMulticast", {
        /**
         * reports whether ip is an interface-local multicast address.
         */
        get: function () {
            var ip = this.ip;
            return ip.length == exports.IPv6len &&
                ip[0] == 0xff &&
                (ip[1] & 0x0f) == 0x01;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isLinkLocalMulticast", {
        /**
         * reports whether ip is a link-local multicast address.
         */
        get: function () {
            var ip4 = this.to4();
            if (ip4) {
                var ip_1 = ip4.ip;
                return ip_1[0] == 224 && ip_1[1] == 0 && ip_1[2] == 0;
            }
            var ip = this.ip;
            return ip.length == exports.IPv6len && ip[0] == 0xff && (ip[1] & 0x0f) == 0x02;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isLinkLocalUnicast", {
        /**
         * reports whether ip is a link-local unicast address.
         */
        get: function () {
            var ip4 = this.to4();
            if (ip4) {
                var ip_2 = ip4.ip;
                return ip_2[0] == 169 && ip_2[1] == 254;
            }
            var ip = this.ip;
            return ip.length == exports.IPv6len && ip[0] == 0xfe && (ip[1] & 0xc0) == 0x80;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isLoopback", {
        /**
         * reports whether ip is a loopback address.
         */
        get: function () {
            var ip4 = this.to4();
            if (ip4) {
                return ip4.ip[0] == 127;
            }
            return this.equal(IP.v6loopback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isMulticast", {
        /**
         * reports whether ip is a multicast address.
         */
        get: function () {
            var ip4 = this.to4();
            if (ip4) {
                return (ip4.ip[0] & 0xf0) == 0xe0;
            }
            var ip = this.ip;
            return ip.length == exports.IPv6len && ip[0] == 0xff;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isPrivate", {
        /**
         * reports whether ip is a private address, according to RFC 1918 (IPv4 addresses) and RFC 4193 (IPv6 addresses).
         */
        get: function () {
            var ipv4 = this.to4();
            if (ipv4) {
                // Following RFC 1918, Section 3. Private Address Space which says:
                //   The Internet Assigned Numbers Authority (IANA) has reserved the
                //   following three blocks of the IP address space for private internets:
                //     10.0.0.0        -   10.255.255.255  (10/8 prefix)
                //     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
                //     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
                var ip4 = ipv4.ip;
                return ip4[0] == 10 ||
                    (ip4[0] == 172 && (ip4[1] & 0xf0) == 16) ||
                    (ip4[0] == 192 && ip4[1] == 168);
            }
            // Following RFC 4193, Section 8. IANA Considerations which says:
            //   The IANA has assigned the FC00::/7 prefix to "Unique Local Unicast".
            var ip = this.ip;
            return ip.length == exports.IPv6len && (ip[0] & 0xfe) == 0xfc;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IP.prototype, "isUnspecified", {
        /**
         * reports whether ip is an unspecified address, either the IPv4 address "0.0.0.0" or the IPv6 address "::".
         */
        get: function () {
            return this.equal(IP.v4zero) || this.equal(IP.v6unspecified);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * converts the IPv4 address ip to a 4-byte representation.
     * @remarks
     * If ip is not an IPv4 address, To4 returns nil.
     */
    IP.prototype.to4 = function () {
        var ip = this.ip;
        if (ip.length == exports.IPv4len) {
            return this;
        }
        if (ip.length == exports.IPv6len &&
            ip[10] == 0xff &&
            ip[11] == 0xff) {
            for (var i = 0; i < 10; i++) {
                if (ip[i] != 0) {
                    return;
                }
            }
            return new IP(ip.subarray(12, 16));
        }
        return;
    };
    /**
     * converts the IP address ip to a 16-byte representation.
     * @remarks
     * If ip is not an IP address (it is the wrong length), to16 returns undefined.
     */
    IP.prototype.to16 = function () {
        var ip = this.ip;
        if (ip.length == exports.IPv4len) {
            return IP.v4(ip[0], ip[1], ip[2], ip[3]);
        }
        if (ip.length == exports.IPv6len) {
            return this;
        }
        return;
    };
    /**
     * returns the string form of the IP address ip.
     * @remarks
     * It returns one of 4 forms:
     *   - "<undefined>", if ip has length 0
     *   - dotted decimal ("192.0.2.1"), if ip is an IPv4 or IP4-mapped IPv6 address
     *   - IPv6 ("2001:db8::1"), if ip is a valid IPv6 address
     *   - the hexadecimal form of ip, without punctuation, if no other cases apply
     */
    IP.prototype.toString = function () {
        var _a;
        var p = this.ip;
        if (p.length == 0) {
            return "<undefined>";
        }
        // If IPv4, use dotted notation.
        var p4 = (_a = this.to4()) === null || _a === void 0 ? void 0 : _a.ip;
        if ((p4 === null || p4 === void 0 ? void 0 : p4.length) == exports.IPv4len) {
            var maxIPv4StringLen = "255.255.255.255".length;
            var b_2 = new Array(maxIPv4StringLen);
            var n = ubtoa(b_2, 0, p4[0]);
            b_2[n] = ".";
            n++;
            n += ubtoa(b_2, n, p4[1]);
            b_2[n] = ".";
            n++;
            n += ubtoa(b_2, n, p4[2]);
            b_2[n] = ".";
            n++;
            n += ubtoa(b_2, n, p4[3]);
            return b_2.join("");
        }
        if (p.length != exports.IPv6len) {
            return "?" + hexString(this.ip);
        }
        // Find longest run of zeros.
        var e0 = -1;
        var e1 = -1;
        for (var i = 0; i < exports.IPv6len; i += 2) {
            var j = i;
            while (j < exports.IPv6len && p[j] == 0 && p[j + 1] == 0) {
                j += 2;
            }
            if (j > i && j - i > e1 - e0) {
                e0 = i;
                e1 = j;
                i = j;
            }
        }
        // The symbol "::" MUST NOT be used to shorten just one 16 bit 0 field.
        if (e1 - e0 <= 2) {
            e0 = -1;
            e1 = -1;
        }
        var maxLen = "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff".length;
        var b = new Array(maxLen);
        var offset = 0;
        // Print with possible :: in place of run of zeros
        for (var i = 0; i < exports.IPv6len; i += 2) {
            if (i == e0) {
                b[offset++] = ":";
                b[offset++] = ":";
                i = e1;
                if (i >= exports.IPv6len) {
                    break;
                }
            }
            else if (i > 0) {
                b[offset++] = ":";
            }
            // 	b = appendHex(b, (uint32(p[i])<<8)|uint32(p[i+1]))
            var val = ((p[i] << 8) | (p[i + 1])) & 0xFFFFFFFF;
            if (val == 0) {
                b[offset++] = "0";
            }
            else {
                for (var j = 7; j >= 0; j--) {
                    var v = val >>> j * 4;
                    if (v > 0) {
                        b[offset++] = hexDigit[v & 0xf];
                    }
                }
            }
        }
        return b.join("");
    };
    /**
     * returns the result of masking the IP address ip with mask.
     */
    IP.prototype.mask = function (mask) {
        var m = mask.mask;
        if (m.length == exports.IPv6len && this.length == exports.IPv4len && allFF(m.subarray(0, 12))) {
            m = m.subarray(12);
        }
        var ip = this.ip;
        if (m.length == exports.IPv4len && ip.length == exports.IPv6len && bytesEqual(ip.subarray(0, 12), v4InV6Prefix)) {
            ip = ip.subarray(12);
        }
        var n = ip.length;
        if (n != mask.length) {
            return;
        }
        var out = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            out[i] = ip[i] & m[i];
        }
        return new IP(out);
    };
    IP.v4bcast = IP.v4(255, 255, 255, 255); // limited broadcast
    IP.v4allsys = IP.v4(224, 0, 0, 1); // all systems
    IP.v4allrouter = IP.v4(224, 0, 0, 2); // all routers
    IP.v4zero = IP.v4(0, 0, 0, 0); // all zeros
    IP.v6zero = new IP(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    IP.v6unspecified = new IP(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    IP.v6loopback = new IP(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]));
    IP.v6interfacelocalallnodes = new IP(new Uint8Array([0xff, 0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x01]));
    IP.v6linklocalallnodes = new IP(new Uint8Array([0xff, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x01]));
    IP.v6linklocalallrouters = new IP(new Uint8Array([0xff, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x02]));
    return IP;
}());
exports.IP = IP;
/**
 * parses s as a CIDR notation IP address and prefix length, like "192.0.2.0/24" or "2001:db8::/32", as defined in RFC 4632 and RFC 4291.
 *
 * @remarks
 * It returns the IP address and the network implied by the IP and prefix length.
 *
 * For example, ParseCIDR("192.0.2.1/24") returns the IP address 192.0.2.1 and the network 192.0.2.0/24.
 *
 */
function parseCIDR(s) {
    var _a;
    var i = s.indexOf("/");
    if (i < 0) {
        return;
    }
    var addr = s.substring(0, i);
    var mask = s.substring(i + 1);
    var iplen = exports.IPv4len;
    var ip = parseIPv4(addr);
    if (ip === undefined) {
        iplen = exports.IPv6len;
        var d = parseIPv6(addr);
        if (d === undefined) {
            return;
        }
        ip = new IP(d);
    }
    var n;
    var ok;
    _a = __read(dtoi(mask), 3), n = _a[0], i = _a[1], ok = _a[2];
    if (!ok || i != mask.length || n < 0 || n > 8 * iplen) {
        return;
    }
    var m = IPMask.cidr(n, 8 * iplen);
    return [ip, new IPNet(ip.mask(m), m)];
}
exports.parseCIDR = parseCIDR;
/**
 * @internal
 */
function networkNumberAndMask(n) {
    var ip = n.ip.to4();
    if (ip === undefined) {
        ip = n.ip;
        if (ip.length != exports.IPv6len) {
            return;
        }
    }
    var m = n.mask;
    switch (m.length) {
        case exports.IPv4len:
            if (ip.length != exports.IPv4len) {
                return;
            }
            break;
        case exports.IPv6len:
            if (ip.length == exports.IPv4len) {
                m = new IPMask(m.mask.subarray(12));
            }
            break;
        default:
            return;
    }
    return [ip, m];
}
exports.networkNumberAndMask = networkNumberAndMask;
/**
 * An IPNet represents an IP network.
 */
var IPNet = /** @class */ (function () {
    function IPNet(ip, mask) {
        this.ip = ip;
        this.mask = mask;
    }
    Object.defineProperty(IPNet.prototype, "network", {
        /**
         * returns the address's network name, "ip+net".
         */
        get: function () { return "ip+net"; },
        enumerable: false,
        configurable: true
    });
    /**
     * reports whether the network includes ip.
     */
    IPNet.prototype.contains = function (ip) {
        var nnm = networkNumberAndMask(this);
        if (!nnm) {
            return false;
        }
        var _a = __read(nnm, 2), nn = _a[0], m = _a[1];
        var x = ip.to4();
        if (x !== undefined) {
            ip = x;
        }
        var l = ip.length;
        if (l != nn.length) {
            return false;
        }
        var nnb = nn.ip;
        var mb = m.mask;
        var ipb = ip.ip;
        for (var i = 0; i < l; i++) {
            if ((nnb[i] & mb[i]) != (ipb[i] & mb[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * returns the CIDR notation of n like "192.0.2.0/24" or "2001:db8::/48" as defined in RFC 4632 and RFC 4291.
     *
     * @remarks
     * If the mask is not in the canonical form, it returns the string which consists of an IP address, followed by a slash character and a mask expressed as hexadecimal form with no punctuation like "198.51.100.0/c000ff00".
     */
    IPNet.prototype.toString = function () {
        var nnm = networkNumberAndMask(this);
        if (!nnm) {
            return "<undefined>";
        }
        var _a = __read(nnm, 2), nn = _a[0], m = _a[1];
        var l = simpleMaskLength(m.mask);
        if (l == -1) {
            return nn.toString() + "/" + m.toString();
        }
        return nn.toString() + "/" + l.toString();
    };
    return IPNet;
}());
exports.IPNet = IPNet;
/**
 * combines host and port into a network address of the
 * form "host:port". If host contains a colon, as found in literal
 * IPv6 addresses, then JoinHostPort returns "[host]:port".
 */
function joinHostPort(host, port) {
    // We assume that host is a literal IPv6 address if host has
    // colons.
    if (host.indexOf(':') >= 0) {
        return "[".concat(host, "]:").concat(port);
    }
    return "".concat(host, ":").concat(port);
}
exports.joinHostPort = joinHostPort;
var missingPort = "missing port in address";
var tooManyColons = "too many colons in address";
/**
 * SplitHostPort splits a network address of the form "host:port",
 * "host%zone:port", "[host]:port" or "[host%zone]:port" into host or
 * host%zone and port.
 *
 *  A literal IPv6 address in hostport must be enclosed in square
 * brackets, as in "[::1]:80", "[::1%lo0]:80".
 */
function splitHostPort(hostport) {
    var j = 0;
    var k = 0;
    // The port starts after the last colon.
    var i = hostport.lastIndexOf(':');
    if (i < 0) {
        throw new AddrError(hostport, missingPort);
    }
    var host;
    var port;
    if (hostport[0] == '[') {
        // Expect the first ']' just before the last ':'.
        var end = hostport.indexOf(']', 1);
        if (end < 0) {
            throw new AddrError(hostport, "missing ']' in address");
        }
        switch (end + 1) {
            case hostport.length:
                // There can't be a ':' behind the ']' now.
                throw new AddrError(hostport, missingPort);
            case i:
                // The expected result.
                break;
            default:
                // Either ']' isn't followed by a colon, or it is
                // followed by a colon that is not the last one.
                if (hostport[end + 1] == ':') {
                    throw new AddrError(hostport, tooManyColons);
                }
                throw new AddrError(hostport, missingPort);
        }
        host = hostport.substring(1, end);
        j = 1;
        k = end + 1; // there can't be a '[' resp. ']' before these positions
    }
    else {
        host = hostport.substring(0, i);
        if (host.indexOf(':') >= 0) {
            throw new AddrError(hostport, tooManyColons);
        }
    }
    if (hostport.indexOf('[', j) >= 0) {
        throw new AddrError(hostport, "unexpected '[' in address");
    }
    if (hostport.indexOf(']', k) >= 0) {
        throw new AddrError(hostport, "unexpected ']' in address");
    }
    port = hostport.substring(i + 1);
    return [host, port];
}
exports.splitHostPort = splitHostPort;
//# sourceMappingURL=ip.js.map