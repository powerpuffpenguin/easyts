import { Exception } from "../exception";
export declare class AddrError extends Exception {
    readonly addr: string;
    readonly err: string;
    constructor(addr: string, err: string);
}
export declare const IPv4len = 4;
export declare const IPv6len = 16;
export declare class IPMask {
    readonly mask: Uint8Array;
    /**
     * returns the IP mask (in 4-byte form) of the IPv4 mask a.b.c.d.
     */
    static v4(a: number, b: number, c: number, d: number): IPMask;
    /**
     * returns an IPMask consisting of 'ones' 1 bits followed by 0s up to a total length of 'bits' bits.
     */
    static cidr(ones: number, bits: number): IPMask | undefined;
    constructor(mask: Uint8Array);
    get length(): number;
    toString(): string;
    /**
     * returns the number of leading ones and total bits in the mask.
     * @remarks
     * If the mask is not in the canonical form--ones followed by zeros--then returns [0,0]
     * @returns [ones:number, bits:number]
     */
    size(): [number, number];
}
export declare class IP {
    readonly ip: Uint8Array;
    constructor(ip: Uint8Array);
    static v4bcast: IP;
    static v4allsys: IP;
    static v4allrouter: IP;
    static v4zero: IP;
    static v6zero: IP;
    static v6unspecified: IP;
    static v6loopback: IP;
    static v6interfacelocalallnodes: IP;
    static v6linklocalallnodes: IP;
    static v6linklocalallrouters: IP;
    /**
     * returns the IP address (in 16-byte form) of the IPv4 address a.b.c.d.
     */
    static v4(a: number, b: number, c: number, d: number): IP;
    /**
     * parses s as an IP address, returning the result.
     * @remarks
     * The string s can be in IPv4 dotted decimal ("192.0.2.1"), IPv6 ("2001:db8::68"), or IPv4-mapped IPv6 ("::ffff:192.0.2.1") form.
     * If s is not a valid textual representation of an IP address, parse returns nil.
     */
    static parse(s: string): IP | undefined;
    get length(): number;
    /**
     * returns the default IP mask for the IP address ip.
     * @remarks
     * Only IPv4 addresses have default masks; DefaultMask returns undefined if ip is not a valid IPv4 address.
     */
    defaultMask(): IPMask | undefined;
    /**
     * reports whether ip and o are the same IP address. An IPv4 address and that same address in IPv6 form are considered to be equal.
     */
    equal(o: IP): boolean;
    /**
     * reports whether ip is a global unicast address.
     * @remarks
     * The identification of global unicast addresses uses address type
     * identification as defined in RFC 1122, RFC 4632 and RFC 4291 with
     * the exception of IPv4 directed broadcast addresses.
     * It returns true even if ip is in IPv4 private address space or
     * local IPv6 unicast address space.
     */
    get isGlobalUnicast(): boolean;
    /**
     * reports whether ip is an interface-local multicast address.
     */
    get isInterfaceLocalMulticast(): boolean;
    /**
     * reports whether ip is a link-local multicast address.
     */
    get isLinkLocalMulticast(): boolean;
    /**
     * reports whether ip is a link-local unicast address.
     */
    get isLinkLocalUnicast(): boolean;
    /**
     * reports whether ip is a loopback address.
     */
    get isLoopback(): boolean;
    /**
     * reports whether ip is a multicast address.
     */
    get isMulticast(): boolean;
    /**
     * reports whether ip is a private address, according to RFC 1918 (IPv4 addresses) and RFC 4193 (IPv6 addresses).
     */
    get isPrivate(): boolean;
    /**
     * reports whether ip is an unspecified address, either the IPv4 address "0.0.0.0" or the IPv6 address "::".
     */
    get isUnspecified(): boolean;
    /**
     * converts the IPv4 address ip to a 4-byte representation.
     * @remarks
     * If ip is not an IPv4 address, To4 returns nil.
     */
    to4(): IP | undefined;
    /**
     * converts the IP address ip to a 16-byte representation.
     * @remarks
     * If ip is not an IP address (it is the wrong length), to16 returns undefined.
     */
    to16(): IP | undefined;
    /**
     * returns the string form of the IP address ip.
     * @remarks
     * It returns one of 4 forms:
     *   - "<undefined>", if ip has length 0
     *   - dotted decimal ("192.0.2.1"), if ip is an IPv4 or IP4-mapped IPv6 address
     *   - IPv6 ("2001:db8::1"), if ip is a valid IPv6 address
     *   - the hexadecimal form of ip, without punctuation, if no other cases apply
     */
    toString(): string;
    /**
     * returns the result of masking the IP address ip with mask.
     */
    mask(mask: IPMask): IP | undefined;
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
export declare function parseCIDR(s: string): [IP, IPNet] | undefined;
/**
 * An IPNet represents an IP network.
 */
export declare class IPNet {
    readonly ip: IP;
    readonly mask: IPMask;
    constructor(ip: IP, mask: IPMask);
    /**
     * returns the address's network name, "ip+net".
     */
    get network(): string;
    /**
     * reports whether the network includes ip.
     */
    contains(ip: IP): boolean;
    /**
     * returns the CIDR notation of n like "192.0.2.0/24" or "2001:db8::/48" as defined in RFC 4632 and RFC 4291.
     *
     * @remarks
     * If the mask is not in the canonical form, it returns the string which consists of an IP address, followed by a slash character and a mask expressed as hexadecimal form with no punctuation like "198.51.100.0/c000ff00".
     */
    toString(): string;
}
/**
 * combines host and port into a network address of the
 * form "host:port". If host contains a colon, as found in literal
 * IPv6 addresses, then JoinHostPort returns "[host]:port".
 */
export declare function joinHostPort(host: string, port: string | number): string;
/**
 * SplitHostPort splits a network address of the form "host:port",
 * "host%zone:port", "[host]:port" or "[host%zone]:port" into host or
 * host%zone and port.
 *
 *  A literal IPv6 address in hostport must be enclosed in square
 * brackets, as in "[::1]:80", "[::1%lo0]:80".
 */
export declare function splitHostPort(hostport: string): [string, string];
