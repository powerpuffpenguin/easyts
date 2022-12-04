import { assertInt, assertUInt } from "../assert";

export const IPv4len = 4;
export const IPv6len = 16;
// Bigger than we need, not too big to worry about overflow
const big = 0xFFFFFF;
function bytesEqual(l: ArrayLike<any>, r: ArrayLike<any>): boolean {
    for (let i = 0; i < l.length; i++) {
        if (l[i] != r[i]) {
            return false
        }
    }
    return true
}
// Decimal to integer.
// Returns number, characters consumed, success.
function dtoi(s: string): [number, number, boolean] {
    let n = 0;
    let i = 0;
    for (i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
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
function xtoi(s: string): [number, number, boolean] {
    let n = 0;
    let i = 0;
    for (i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (48 <= c && c <= 57) { // '0' <= s[i] && s[i] <= '9'
            n *= 16;
            n += c - 48;
        } else if (97 <= c && c <= 102) { // 'a' <= s[i] && s[i] <= 'f'
            n *= 16;
            n += c - 97 + 10;
        } else if (65 <= c && c <= 70) { // 'A' <= s[i] && s[i] <= 'F'
            n *= 16;
            n += c - 65 + 10;
        } else {
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
function parseIPv4(s: string): IP | undefined {
    const p = new Uint8Array(IPv4len);
    for (let i = 0; i < IPv4len; i++) {
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
        const [n, c, ok] = dtoi(s);
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
function parseIPv6(s: string): Uint8Array | undefined {
    const ip = new Uint8Array(IPv6len);
    let ellipsis = -1; // position of ellipsis in ip

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
    let i = 0;
    while (i < IPv6len) {
        // Hex number.
        const [n, c, ok] = xtoi(s);
        if (!ok || n > 0xFFFF) {
            return;
        }

        // If followed by dot, might be in trailing IPv4.
        if (c < s.length && s[c] == ".") {
            if (ellipsis < 0 && i != IPv6len - IPv4len) {
                // Not the right place.
                return;
            }
            if (i + IPv4len > IPv6len) {
                // Not enough room.
                return;
            }
            const ip4 = parseIPv4(s);
            if (ip4 === undefined) {
                return;
            }
            ip[i] = ip4.ip[12];
            ip[i + 1] = ip4.ip[13];
            ip[i + 2] = ip4.ip[14];
            ip[i + 3] = ip4.ip[15];
            s = "";
            i += IPv4len;
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
    if (i < IPv6len) {
        if (ellipsis < 0) {
            return;
        }
        const n = IPv6len - i;
        for (let j = i - 1; j >= ellipsis; j--) {
            ip[j + n] = ip[j];
        }
        for (let j = ellipsis + n - 1; j >= ellipsis; j--) {
            ip[j] = 0;
        }
    } else if (ellipsis >= 0) {
        // Ellipsis must represent at least one 0 group.
        return;
    }
    return ip;
}
const hexDigit = "0123456789abcdef";
function hexString(b: Uint8Array): string {
    const s = new Array<string>(b.length * 2);
    for (let i = 0; i < b.length; i++) {
        const tn = b[i];
        s[i * 2] = hexDigit[tn >>> 4];
        s[i * 2 + 1] = hexDigit[tn & 0xf];
    }
    return s.join("");
}
// ubtoa encodes the string form of the integer v to dst[start:] and
// returns the number of bytes written to dst. The caller must ensure
// that dst has sufficient length.
function ubtoa(dst: Array<string>, start: number, v: number): number {
    if (v < 10) {
        dst[start] = String.fromCharCode(v + 48); // v+ '0'
        return 1;
    } else if (v < 100) {
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
function simpleMaskLength(mask: Uint8Array): number {
    let n = 0
    for (let i = 0; i < mask.length; i++) {
        let v = mask[i];
        if (v == 0xff) {
            n += 8
            continue
        }
        // found non-ff byte
        // count 1 bits
        while (v & 0x80) {
            n++
            v <<= 1
            v &= 0xff
        }
        // rest must be 0 bits
        if (v) {
            return -1
        }
        for (i++; i < mask.length; i++) {
            if (mask[i]) {
                return -1
            }
        }
        break
    }
    return n
}

export class IPMask {
    /**
     * returns the IP mask (in 4-byte form) of the IPv4 mask a.b.c.d.
     */
    static v4(a: number, b: number, c: number, d: number): IPMask {
        assertUInt(
            {
                val: a,
                name: 'a',
                max: 255,
            },
            {
                val: b,
                name: 'b',
                max: 255,
            },
            {
                val: c,
                name: 'c',
                max: 255,
            },
            {
                val: d,
                name: 'd',
                max: 255,
            }
        )
        return new IPMask(new Uint8Array([a, b, c, d]))
    }
    /**
     * returns an IPMask consisting of 'ones' 1 bits followed by 0s up to a total length of 'bits' bits.
     */
    static cidr(ones: number, bits: number): IPMask | undefined {
        assertInt(
            {
                val: ones,
                name: "ones",
            },
            {
                val: bits,
                name: "bits",
            },
        )
        if (bits != 8 * IPv4len && bits != 8 * IPv6len) {
            return
        }
        if (ones < 0 || ones > bits) {
            return
        }
        const l = Math.floor(bits / 8)
        const m = new Uint8Array(l)
        let n = ones
        for (let i = 0; i < l; i++) {
            if (n >= 8) {
                m[i] = 0xff
                n -= 8
                continue
            }
            m[i] = (~(0xff >>> n)) & 0xff
            n = 0
        }
        return new IPMask(m)
    }
    constructor(public readonly mask: Uint8Array) { }
    get length(): number {
        return this.mask.length
    }
    toString(): string {
        return hexString(this.mask)
    }
    /**
     * returns the number of leading ones and total bits in the mask.
     * @remarks
     * If the mask is not in the canonical form--ones followed by zeros--then returns [0,0]
     * @returns [ones:number, bits:number]
     */
    size(): [number, number] {
        const ones = simpleMaskLength(this.mask)
        if (ones == -1) {
            return [0, 0]
        }
        return [ones, this.mask.length * 8]
    }
}
const classAMask = IPMask.v4(0xff, 0, 0, 0);
const classBMask = IPMask.v4(0xff, 0xff, 0, 0)
const classCMask = IPMask.v4(0xff, 0xff, 0xff, 0)
const v4InV6Prefix = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff])
function allFF(b: Uint8Array): boolean {
    for (const c of b) {
        if (c != 0xff) {
            return false
        }
    }
    return true
}
export class IP {
    constructor(public readonly ip: Uint8Array) { }
    static v4bcast = IP.v4(255, 255, 255, 255); // limited broadcast
    static v4allsys = IP.v4(224, 0, 0, 1); // all systems
    static v4allrouter = IP.v4(224, 0, 0, 2); // all routers
    static v4zero = IP.v4(0, 0, 0, 0); // all zeros

    static v6zero = new IP(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    );
    static v6unspecified = new IP(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    );
    static v6loopback = new IP(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
    );
    static v6interfacelocalallnodes = new IP(
        new Uint8Array([0xff, 0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x01]),
    );
    static v6linklocalallnodes = new IP(
        new Uint8Array([0xff, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x01]),
    );
    static v6linklocalallrouters = new IP(
        new Uint8Array([0xff, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x02]),
    );

    /**
     * returns the IP address (in 16-byte form) of the IPv4 address a.b.c.d.
     */
    static v4(a: number, b: number, c: number, d: number): IP {
        assertUInt({
            val: a,
            name: 'a',
            max: 255,
        },
            {
                val: b,
                name: 'b',
                max: 255,
            },
            {
                val: c,
                name: 'c',
                max: 255,
            },
            {
                val: d,
                name: 'd',
                max: 255,
            },
        )
        const p = new Uint8Array([
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
    }
    /**
     * parses s as an IP address, returning the result.
     * @remarks
     * The string s can be in IPv4 dotted decimal ("192.0.2.1"), IPv6 ("2001:db8::68"), or IPv4-mapped IPv6 ("::ffff:192.0.2.1") form.
     * If s is not a valid textual representation of an IP address, parse returns nil.
     */
    static parse(s: string): IP | undefined {
        for (let i = 0; i < s.length; i++) {
            switch (s[i]) {
                case ".":
                    return parseIPv4(s);
                case ":": {
                    const data = parseIPv6(s);
                    return data === undefined ? undefined : new IP(data);
                }
            }
        }
        return;
    }
    get length(): number {
        return this.ip.length
    }

    /**
     * returns the default IP mask for the IP address ip.
     * @remarks
     * Only IPv4 addresses have default masks; DefaultMask returns undefined if ip is not a valid IPv4 address.
     */
    defaultMask(): IPMask | undefined {
        const ip = this.to4()
        if (!ip) {
            return
        }
        const v = ip.ip[0]
        if (v < 0x80) {
            return classAMask
        } else if (v < 0xC0) {
            return classBMask
        }
        return classCMask
    }
    /**
     * reports whether ip and o are the same IP address. An IPv4 address and that same address in IPv6 form are considered to be equal.
     */
    equal(o: IP): boolean {
        const ip = this.ip
        const x = o.ip
        if (ip.length == o.length) {
            return bytesEqual(ip, x)
        }
        if (ip.length == IPv4len && x.length == IPv6len) {
            return bytesEqual(x.subarray(0, 12), v4InV6Prefix) &&
                bytesEqual(ip, x.subarray(12))
        }
        if (ip.length == IPv6len && x.length == IPv4len) {
            return bytesEqual(ip.subarray(0, 12), v4InV6Prefix) &&
                bytesEqual(ip.subarray(12), x)
        }
        return false
    }
    /**
     * reports whether ip is a global unicast address.
     * @remarks
     * The identification of global unicast addresses uses address type
     * identification as defined in RFC 1122, RFC 4632 and RFC 4291 with
     * the exception of IPv4 directed broadcast addresses.
     * It returns true even if ip is in IPv4 private address space or
     * local IPv6 unicast address space.
     */
    get isGlobalUnicast(): boolean {
        return (this.length == IPv4len || this.length == IPv6len) &&
            !this.equal(IP.v4bcast) &&
            !this.isUnspecified &&
            !this.isLoopback &&
            !this.isMulticast &&
            !this.isLinkLocalUnicast
    }
    /**
     * reports whether ip is an interface-local multicast address.
     */
    get isInterfaceLocalMulticast(): boolean {
        const ip = this.ip
        return ip.length == IPv6len &&
            ip[0] == 0xff &&
            (ip[1] & 0x0f) == 0x01
    }
    /**
     * reports whether ip is a link-local multicast address.
     */
    get isLinkLocalMulticast(): boolean {
        const ip4 = this.to4()
        if (ip4) {
            const ip = ip4.ip
            return ip[0] == 224 && ip[1] == 0 && ip[2] == 0
        }
        const ip = this.ip
        return ip.length == IPv6len && ip[0] == 0xff && (ip[1] & 0x0f) == 0x02
    }
    /**
     * reports whether ip is a link-local unicast address.
     */
    get isLinkLocalUnicast(): boolean {
        const ip4 = this.to4()
        if (ip4) {
            const ip = ip4.ip
            return ip[0] == 169 && ip[1] == 254
        }
        const ip = this.ip
        return ip.length == IPv6len && ip[0] == 0xfe && (ip[1] & 0xc0) == 0x80
    }
    /**
     * reports whether ip is a loopback address.
     */
    get isLoopback(): boolean {
        const ip4 = this.to4()
        if (ip4) {
            return ip4.ip[0] == 127
        }
        return this.equal(IP.v6loopback)
    }
    /**
     * reports whether ip is a multicast address.
     */
    get isMulticast(): boolean {
        const ip4 = this.to4()
        if (ip4) {
            return (ip4.ip[0] & 0xf0) == 0xe0
        }
        const ip = this.ip
        return ip.length == IPv6len && ip[0] == 0xff
    }
    /**
     * reports whether ip is a private address, according to RFC 1918 (IPv4 addresses) and RFC 4193 (IPv6 addresses).
     */
    get isPrivate(): boolean {
        const ipv4 = this.to4()
        if (ipv4) {
            // Following RFC 1918, Section 3. Private Address Space which says:
            //   The Internet Assigned Numbers Authority (IANA) has reserved the
            //   following three blocks of the IP address space for private internets:
            //     10.0.0.0        -   10.255.255.255  (10/8 prefix)
            //     172.16.0.0      -   172.31.255.255  (172.16/12 prefix)
            //     192.168.0.0     -   192.168.255.255 (192.168/16 prefix)
            const ip4 = ipv4.ip
            return ip4[0] == 10 ||
                (ip4[0] == 172 && (ip4[1] & 0xf0) == 16) ||
                (ip4[0] == 192 && ip4[1] == 168)
        }
        // Following RFC 4193, Section 8. IANA Considerations which says:
        //   The IANA has assigned the FC00::/7 prefix to "Unique Local Unicast".
        const ip = this.ip
        return ip.length == IPv6len && (ip[0] & 0xfe) == 0xfc
    }
    /**
     * reports whether ip is an unspecified address, either the IPv4 address "0.0.0.0" or the IPv6 address "::".
     */
    get isUnspecified(): boolean {
        return this.equal(IP.v4zero) || this.equal(IP.v6unspecified)
    }
    /**
     * converts the IPv4 address ip to a 4-byte representation.
     * @remarks
     * If ip is not an IPv4 address, To4 returns nil.
     */
    to4(): IP | undefined {
        const ip = this.ip;
        if (ip.length == IPv4len) {
            return this;
        }
        if (
            ip.length == IPv6len &&
            ip[10] == 0xff &&
            ip[11] == 0xff
        ) {
            for (let i = 0; i < 10; i++) {
                if (ip[i] != 0) {
                    return;
                }
            }
            return new IP(ip.subarray(12, 16));
        }
        return;
    }

    /**
     * converts the IP address ip to a 16-byte representation.
     * @remarks
     * If ip is not an IP address (it is the wrong length), to16 returns undefined.
     */
    to16(): IP | undefined {
        const ip = this.ip;
        if (ip.length == IPv4len) {
            return IP.v4(ip[0], ip[1], ip[2], ip[3]);
        }
        if (ip.length == IPv6len) {
            return this;
        }
        return;
    }

    /**
     * returns the string form of the IP address ip.
     * @remarks 
     * It returns one of 4 forms:
     *   - "<undefined>", if ip has length 0
     *   - dotted decimal ("192.0.2.1"), if ip is an IPv4 or IP4-mapped IPv6 address
     *   - IPv6 ("2001:db8::1"), if ip is a valid IPv6 address
     *   - the hexadecimal form of ip, without punctuation, if no other cases apply
     */
    toString(): string {
        const p = this.ip;

        if (p.length == 0) {
            return "<undefined>";
        }

        // If IPv4, use dotted notation.
        const p4 = this.to4()?.ip;
        if (p4?.length == IPv4len) {
            const maxIPv4StringLen = "255.255.255.255".length;
            const b = new Array<string>(maxIPv4StringLen);

            let n = ubtoa(b, 0, p4[0]);
            b[n] = ".";
            n++;

            n += ubtoa(b, n, p4[1]);
            b[n] = ".";
            n++;

            n += ubtoa(b, n, p4[2]);
            b[n] = ".";
            n++;

            n += ubtoa(b, n, p4[3]);
            return b.join("");
        }
        if (p.length != IPv6len) {
            return "?" + hexString(this.ip);
        }

        // Find longest run of zeros.
        let e0 = -1;
        let e1 = -1;
        for (let i = 0; i < IPv6len; i += 2) {
            let j = i;
            while (j < IPv6len && p[j] == 0 && p[j + 1] == 0) {
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

        const maxLen = "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff".length;
        const b = new Array<string>(maxLen);
        let offset = 0;
        // Print with possible :: in place of run of zeros
        for (let i = 0; i < IPv6len; i += 2) {
            if (i == e0) {
                b[offset++] = ":";
                b[offset++] = ":";
                i = e1;
                if (i >= IPv6len) {
                    break;
                }
            } else if (i > 0) {
                b[offset++] = ":";
            }

            // 	b = appendHex(b, (uint32(p[i])<<8)|uint32(p[i+1]))
            const val = ((p[i] << 8) | (p[i + 1])) & 0xFFFFFFFF;
            if (val == 0) {
                b[offset++] = "0";
            } else {
                for (let j = 7; j >= 0; j--) {
                    const v = val >>> j * 4;
                    if (v > 0) {
                        b[offset++] = hexDigit[v & 0xf];
                    }
                }
            }
        }
        return b.join("");
    }

    /**
     * returns the result of masking the IP address ip with mask.
     */
    mask(mask: IPMask): IP | undefined {
        let m = mask.mask
        if (m.length == IPv6len && this.length == IPv4len && allFF(m.subarray(0, 12))) {
            m = m.subarray(12)
        }
        let ip = this.ip
        if (m.length == IPv4len && ip.length == IPv6len && bytesEqual(ip.subarray(0, 12), v4InV6Prefix)) {
            ip = ip.subarray(12)
        }
        const n = ip.length
        if (n != mask.length) {
            return
        }
        const out = new Uint8Array(n)
        for (let i = 0; i < n; i++) {
            out[i] = ip[i] & m[i]
        }
        return new IP(out)
    }
}
/**
 * parses s as a CIDR notation IP address and prefix length, like "192.0.2.0/24" or "2001:db8::/32", as defined in RFC 4632 and RFC 4291.
 * 
 * @remarks
 * It returns the IP address and the network implied by the IP and prefix length.
 * 
 * For example, ParseCIDR("192.0.2.1/24") returns the IP address 192.0.2.1 and the network 192.0.2.0/24.
 * 
 */
export function parseCIDR(s: string): [IP, IPNet] | undefined {
    let i = s.indexOf("/")
    if (i < 0) {
        return
    }
    const addr = s.substring(0, i)
    const mask = s.substring(i + 1)
    let iplen = IPv4len
    let ip = parseIPv4(addr)
    if (ip === undefined) {
        iplen = IPv6len
        const d = parseIPv6(addr)
        if (d === undefined) {
            return
        }
        ip = new IP(d)
    }
    let n: number
    let ok: boolean
    [n, i, ok] = dtoi(mask)
    if (!ok || i != mask.length || n < 0 || n > 8 * iplen) {
        return
    }
    const m = IPMask.cidr(n, 8 * iplen)!
    return [ip, new IPNet(ip.mask(m)!, m)]
}
/**
 * @internal
 */
export function networkNumberAndMask(n: IPNet): [IP, IPMask] | undefined {
    let ip = n.ip.to4()
    if (ip === undefined) {
        ip = n.ip
        if (ip.length != IPv6len) {
            return
        }
    }
    let m = n.mask
    switch (m.length) {
        case IPv4len:
            if (ip.length != IPv4len) {
                return
            }
            break
        case IPv6len:
            if (ip.length == IPv4len) {
                m = new IPMask(m.mask.subarray(12))
            }
            break
        default:
            return
    }
    return [ip, m]
}

/**
 * An IPNet represents an IP network.
 */
export class IPNet {
    constructor(public readonly ip: IP, public readonly mask: IPMask) { }
    /**
     * returns the address's network name, "ip+net".
     */
    get network(): string { return "ip+net" }
    /**
     * reports whether the network includes ip.
     */
    contains(ip: IP): boolean {
        const nnm = networkNumberAndMask(this)
        if (!nnm) {
            return false
        }
        const [nn, m] = nnm
        const x = ip.to4()
        if (x !== undefined) {
            ip = x
        }
        const l = ip.length
        if (l != nn.length) {
            return false
        }
        const nnb = nn.ip
        const mb = m.mask
        const ipb = ip.ip
        for (let i = 0; i < l; i++) {
            if ((nnb[i] & mb[i]) != (ipb[i] & mb[i])) {
                return false
            }
        }
        return true
    }
    /**
     * returns the CIDR notation of n like "192.0.2.0/24" or "2001:db8::/48" as defined in RFC 4632 and RFC 4291.
     * 
     * @remarks
     * If the mask is not in the canonical form, it returns the string which consists of an IP address, followed by a slash character and a mask expressed as hexadecimal form with no punctuation like "198.51.100.0/c000ff00".
     */
    toString(): string {
        const nnm = networkNumberAndMask(this)
        if (!nnm) {
            return "<undefined>"
        }
        const [nn, m] = nnm
        const l = simpleMaskLength(m.mask)
        if (l == -1) {
            return nn.toString() + "/" + m.toString()
        }
        return nn.toString() + "/" + l.toString()
    }
}