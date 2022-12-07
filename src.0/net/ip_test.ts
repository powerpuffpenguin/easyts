import { AddrError, IP, IPMask, IPNet, IPv6len, joinHostPort, networkNumberAndMask, parseCIDR, splitHostPort } from "./ip"
const nil = undefined

function makeIP(...vals: Array<number>): IP {
    return new IP(new Uint8Array(vals))
}
function makeIPMask(...vals: Array<number>): IPMask {
    return new IPMask(new Uint8Array(vals))
}
function ParseError(v: {
    Type: string
    Text: string
}) {
    return v
}
QUnit.module('net', hooks => {
    QUnit.test('IP.parse', (assert) => {
        const tests: Array<[string, IP | undefined]> = [
            ["127.0.1.2", IP.v4(127, 0, 1, 2)],
            ["127.0.0.1", IP.v4(127, 0, 0, 1)],
            ["::ffff:127.1.2.3", IP.v4(127, 1, 2, 3)],
            ["::ffff:7f01:0203", IP.v4(127, 1, 2, 3)],
            ["0:0:0:0:0000:ffff:127.1.2.3", IP.v4(127, 1, 2, 3)],
            ["0:0:0:0:000000:ffff:127.1.2.3", IP.v4(127, 1, 2, 3)],
            ["0:0:0:0::ffff:127.1.2.3", IP.v4(127, 1, 2, 3)],

            ["2001:4860:0:2001::68", makeIP(0x20, 0x01, 0x48, 0x60, 0, 0, 0x20, 0x01, 0, 0, 0, 0, 0, 0, 0x00, 0x68)],
            ["2001:4860:0000:2001:0000:0000:0000:0068", makeIP(0x20, 0x01, 0x48, 0x60, 0, 0, 0x20, 0x01, 0, 0, 0, 0, 0, 0, 0x00, 0x68)],

            ["-0.0.0.0", nil],
            ["0.-1.0.0", nil],
            ["0.0.-2.0", nil],
            ["0.0.0.-3", nil],
            ["127.0.0.256", nil],
            ["abc", nil],
            ["123:", nil],
            ["fe80::1%lo0", nil],
            ["fe80::1%911", nil],
            ["", nil],
            ["a1:a2:a3:a4::b1:b2:b3:b4", nil], // Issue 6628
            ["127.001.002.003", nil],
            ["::ffff:127.001.002.003", nil],
            ["123.000.000.000", nil],
            ["1.2..4", nil],
            ["0123.0.0.1", nil],
        ]
        for (const tt of tests) {
            const o = IP.parse(tt[0])
            assert.deepEqual(o?.ip, tt[1]?.ip)

        }
    })
    QUnit.test('IPString', (assert) => {
        function make(vals: Array<number> | IP | undefined, str: string, byt?: string, err?: any) {
            let ip: undefined | IP
            if (vals instanceof IP) {
                ip = vals
            } else if (Array.isArray(vals)) {
                ip = makeIP(...vals)
            }
            return {
                in: ip,
                str: str,
                byt: byt ? new TextEncoder().encode(byt) : undefined,
                error: err,
            }
        }
        const tests = [
            // IP.v4 address
            make(
                [192, 0, 2, 1],
                "192.0.2.1",
                "192.0.2.1",
                nil,
            ),
            make(
                [0, 0, 0, 0],
                "0.0.0.0",
                "0.0.0.0",
                nil,
            ),

            // IP.v4-mapped IPv6 address
            make(
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 192, 0, 2, 1],
                "192.0.2.1",
                "192.0.2.1",
                nil,
            ),
            make(
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 0, 0, 0, 0],
                "0.0.0.0",
                "0.0.0.0",
                nil,
            ),

            // IPv6 address
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0, 0x1, 0x23, 0, 0x12, 0, 0x1],
                "2001:db8::123:12:1",
                "2001:db8::123:12:1",
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x1],
                "2001:db8::1",
                "2001:db8::1",
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0x1, 0, 0, 0, 0x1, 0, 0, 0, 0x1],
                "2001:db8:0:1:0:1:0:1",
                "2001:db8:0:1:0:1:0:1",
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0x1, 0, 0, 0, 0x1, 0, 0, 0, 0x1, 0, 0],
                "2001:db8:1:0:1:0:1:0",
                ("2001:db8:1:0:1:0:1:0"),
                nil,
            ),
            make(
                [0x20, 0x1, 0, 0, 0, 0, 0, 0, 0, 0x1, 0, 0, 0, 0, 0, 0x1],
                "2001::1:0:0:1",
                ("2001::1:0:0:1"),
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0x1, 0, 0, 0, 0, 0, 0],
                "2001:db8:0:0:1::",
                ("2001:db8:0:0:1::"),
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0x1, 0, 0, 0, 0, 0, 0x1],
                "2001:db8::1:0:0:1",
                ("2001:db8::1:0:0:1"),
                nil,
            ),
            make(
                [0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0xa, 0, 0xb, 0, 0xc, 0, 0xd],
                "2001:db8::a:b:c:d",
                ("2001:db8::a:b:c:d"),
                nil,
            ),
            make(
                IP.v6unspecified,
                "::",
                ("::"),
                nil,
            ),

            // IP wildcard equivalent address in Dial/Listen API
            make(
                nil,
                "<undefined>",
                nil,
                nil,
            ),

            // Opaque byte sequence
            make(
                [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef],
                "?0123456789abcdef",
                nil,
                "invalid IP address",
            ),
        ]

        for (const tt of tests) {
            if (tt.in === undefined) {
                assert.equal("<undefined>", tt.str)
                assert.equal(undefined, tt.byt)
            } else {
                const str = tt.in.toString()
                assert.equal(str, tt.str)
            }
        }
    })
    QUnit.test('IPMask', (assert) => {
        function make(ip: IP, mask: IPMask, out: IP) {
            return {
                in: ip,
                mask: mask,
                out: out,
            }
        }
        const tests = [
            make(IP.v4(192, 168, 1, 127), IPMask.v4(255, 255, 255, 128), IP.v4(192, 168, 1, 0)),
            make(IP.v4(192, 168, 1, 127), new IPMask(IP.parse("255.255.255.192")!.ip), IP.v4(192, 168, 1, 64)),
            make(IP.v4(192, 168, 1, 127), new IPMask(IP.parse("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffe0")!.ip), IP.v4(192, 168, 1, 96)),
            make(IP.v4(192, 168, 1, 127), IPMask.v4(255, 0, 255, 0), IP.v4(192, 0, 1, 0)),
            make(IP.parse("2001:db8::1")!, new IPMask(IP.parse("ffff:ff80::")!.ip), IP.parse("2001:d80::")!),
            make(IP.parse("2001:db8::1")!, new IPMask(IP.parse("f0f0:0f0f::")!.ip), IP.parse("2000:d08::")!),

        ]

        for (const tt of tests) {
            const out = tt.in.mask(tt.mask)
            assert.true(out === undefined || tt.out.equal(out))
        }
    })
    QUnit.test('IPMaskString', (assert) => {
        function make(mask: IPMask, out: string) {
            return {
                in: mask,
                out: out,
            }
        }
        const tests = [
            make(IPMask.v4(255, 255, 255, 240), "fffffff0"),
            make(IPMask.v4(255, 0, 128, 0), "ff008000"),
            make(new IPMask(IP.parse("ffff:ff80::")!.ip), "ffffff80000000000000000000000000"),
            make(new IPMask(IP.parse("ef00:ff80::cafe:0")!.ip), "ef00ff800000000000000000cafe0000"),
        ]
        for (const tt of tests) {
            assert.equal(tt.in.toString(), tt.out)
        }
    })
    QUnit.test('IPMaskString', (assert) => {
        function make(mask: IPMask, out: string) {
            return {
                in: mask,
                out: out,
            }
        }
        const tests = [
            make(IPMask.v4(255, 255, 255, 240), "fffffff0"),
            make(IPMask.v4(255, 0, 128, 0), "ff008000"),
            make(new IPMask(IP.parse("ffff:ff80::")!.ip), "ffffff80000000000000000000000000"),
            make(new IPMask(IP.parse("ef00:ff80::cafe:0")!.ip), "ef00ff800000000000000000cafe0000"),
        ]
        for (const tt of tests) {
            assert.equal(tt.in.toString(), tt.out)
        }
    })
    QUnit.test("ParseCIDR", (assert) => {
        function make(v: string, ip?: IP, net?: IPNet, err?: any) {
            return {
                in: v,
                ip: ip,
                net: net,
                err: err,
            }
        }
        const tests = [
            make("135.104.0.0/32", IP.v4(135, 104, 0, 0), new IPNet(IP.v4(135, 104, 0, 0), IPMask.v4(255, 255, 255, 255)), nil),
            make("0.0.0.0/24", IP.v4(0, 0, 0, 0), new IPNet(IP.v4(0, 0, 0, 0), IPMask.v4(255, 255, 255, 0)), nil),
            make("135.104.0.0/24", IP.v4(135, 104, 0, 0), new IPNet(IP.v4(135, 104, 0, 0), IPMask.v4(255, 255, 255, 0)), nil),
            make("135.104.0.1/32", IP.v4(135, 104, 0, 1), new IPNet(IP.v4(135, 104, 0, 1), IPMask.v4(255, 255, 255, 255)), nil),
            make("135.104.0.1/24", IP.v4(135, 104, 0, 1), new IPNet(IP.v4(135, 104, 0, 0), IPMask.v4(255, 255, 255, 0)), nil),
            make("::1/128", IP.parse("::1"), new IPNet(IP.parse("::1")!, new IPMask(IP.parse("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff")!.ip)), nil),
            make("abcd:2345::/127", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe")!.ip)), nil),
            make("abcd:2345::/65", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff:ffff:ffff:8000::")!.ip)), nil),
            make("abcd:2345::/64", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff:ffff:ffff::")!.ip)), nil),
            make("abcd:2345::/63", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff:ffff:fffe::")!.ip)), nil),
            make("abcd:2345::/33", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff:8000::")!.ip)), nil),
            make("abcd:2345::/32", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2345::")!, new IPMask(IP.parse("ffff:ffff::")!.ip)), nil),
            make("abcd:2344::/31", IP.parse("abcd:2344::"), new IPNet(IP.parse("abcd:2344::")!, new IPMask(IP.parse("ffff:fffe::")!.ip)), nil),
            make("abcd:2300::/24", IP.parse("abcd:2300::"), new IPNet(IP.parse("abcd:2300::")!, new IPMask(IP.parse("ffff:ff00::")!.ip)), nil),
            make("abcd:2345::/24", IP.parse("abcd:2345::"), new IPNet(IP.parse("abcd:2300::")!, new IPMask(IP.parse("ffff:ff00::")!.ip)), nil),
            make("2001:DB8::/48", IP.parse("2001:DB8::"), new IPNet(IP.parse("2001:DB8::")!, new IPMask(IP.parse("ffff:ffff:ffff::")!.ip)), nil),
            make("2001:DB8::1/48", IP.parse("2001:DB8::1"), new IPNet(IP.parse("2001:DB8::")!, new IPMask(IP.parse("ffff:ffff:ffff::")!.ip)), nil),
            make("192.168.1.1/255.255.255.0", nil, nil, ParseError({ Type: "CIDR address", Text: "192.168.1.1/255.255.255.0" })),
            make("192.168.1.1/35", nil, nil, ParseError({ Type: "CIDR address", Text: "192.168.1.1/35" })),
            make("2001:db8::1/-1", nil, nil, ParseError({ Type: "CIDR address", Text: "2001:db8::1/-1" })),
            make("2001:db8::1/-0", nil, nil, ParseError({ Type: "CIDR address", Text: "2001:db8::1/-0" })),
            make("-0.0.0.0/32", nil, nil, ParseError({ Type: "CIDR address", Text: "-0.0.0.0/32" })),
            make("0.-1.0.0/32", nil, nil, ParseError({ Type: "CIDR address", Text: "0.-1.0.0/32" })),
            make("0.0.-2.0/32", nil, nil, ParseError({ Type: "CIDR address", Text: "0.0.-2.0/32" })),
            make("0.0.0.-3/32", nil, nil, ParseError({ Type: "CIDR address", Text: "0.0.0.-3/32" })),
            make("0.0.0.0/-0", nil, nil, ParseError({ Type: "CIDR address", Text: "0.0.0.0/-0" })),
            make("127.000.000.001/32", nil, nil, ParseError({ Type: "CIDR address", Text: "127.000.000.001/32" })),
            make("", nil, nil, ParseError({ Type: "CIDR address", Text: "" })),
        ]
        for (const tt of tests) {
            let ip: IP | undefined
            let net: IPNet | undefined
            const v = parseCIDR(tt.in)
            if (tt.err) {
                assert.equal(v, undefined)
            } else {
                assert.notEqual(v, undefined)
            }
            if (v) {
                [ip, net] = v

                assert.true(tt.ip!.equal(ip))
                assert.true(tt.net!.ip!.equal(net.ip))
                assert.deepEqual(tt.net!.mask, net.mask)
            }
        }
    })
    QUnit.test("IPNetContains", (assert) => {
        function make(ip: IP, net: IPNet, ok: boolean) {
            return {
                in: ip,
                net: net,
                ok: ok,
            }
        }
        const tests = [
            make(IP.v4(172, 16, 1, 1), new IPNet(IP.v4(172, 16, 0, 0), IPMask.cidr(12, 32)!), true),
            make(IP.v4(172, 24, 0, 1), new IPNet(IP.v4(172, 16, 0, 0), IPMask.cidr(13, 32)!), false),
            make(IP.v4(192, 168, 0, 3), new IPNet(IP.v4(192, 168, 0, 0), IPMask.v4(0, 0, 255, 252)), true),
            make(IP.v4(192, 168, 0, 4), new IPNet(IP.v4(192, 168, 0, 0), IPMask.v4(0, 255, 0, 252)), false),
            make(IP.parse("2001:db8:1:2::1")!, new IPNet(IP.parse("2001:db8:1::")!, IPMask.cidr(47, 128)!), true),
            make(IP.parse("2001:db8:1:2::1")!, new IPNet(IP.parse("2001:db8:2::")!, IPMask.cidr(47, 128)!), false),
            make(IP.parse("2001:db8:1:2::1")!, new IPNet(IP.parse("2001:db8:1::")!, new IPMask(IP.parse("ffff:0:ffff::")!.ip)), true),
            make(IP.parse("2001:db8:1:2::1")!, new IPNet(IP.parse("2001:db8:1::")!, new IPMask(IP.parse("0:0:0:ffff::")!.ip)), false),
        ]
        for (const tt of tests) {
            assert.equal(tt.net.contains(tt.in), tt.ok)
        }
    })
    QUnit.test("IPNetString", (assert) => {
        function make(net: IPNet, out: string) {
            return {
                in: net,
                out: out,
            }
        }
        const tests = [
            make(new IPNet(IP.v4(192, 168, 1, 0), IPMask.cidr(26, 32)!), "192.168.1.0/26"),
            make(new IPNet(IP.v4(192, 168, 1, 0), IPMask.v4(255, 0, 255, 0)), "192.168.1.0/ff00ff00"),
            make(new IPNet(IP.parse("2001:db8::")!, IPMask.cidr(55, 128)!), "2001:db8::/55"),
            make(new IPNet(IP.parse("2001:db8::")!, new IPMask(IP.parse("8000:f123:0:cafe::")!.ip)), "2001:db8::/8000f1230000cafe0000000000000000"),
        ]
        for (const tt of tests) {
            assert.equal(tt.in.toString(), tt.out)
        }
    })
    QUnit.test("CIDRMask", (assert) => {
        function make(ones: number, bits: number, out?: IPMask) {
            return {
                ones: ones,
                bits: bits,
                out: out,
            }
        }
        const tests = [
            make(0, 32, IPMask.v4(0, 0, 0, 0)),
            make(12, 32, IPMask.v4(255, 240, 0, 0)),
            make(24, 32, IPMask.v4(255, 255, 255, 0)),
            make(32, 32, IPMask.v4(255, 255, 255, 255)),
            make(0, 128, makeIPMask(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            make(4, 128, makeIPMask(0xf0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            make(48, 128, makeIPMask(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
            make(128, 128, makeIPMask(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
            make(33, 32, nil),
            make(32, 33, nil),
            make(-1, 128, nil),
            make(128, -1, nil),
        ]
        for (const tt of tests) {

            assert.deepEqual(IPMask.cidr(tt.ones, tt.bits), tt.out)
        }
    })
    const v4addr = makeIP(192, 168, 0, 1)
    const v4mappedv6addr = makeIP(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 192, 168, 0, 1)
    const v6addr = makeIP(0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0, 0x1, 0x23, 0, 0x12, 0, 0x1)
    const v4mask = makeIPMask(255, 255, 255, 0)
    const v4mappedv6mask = makeIPMask(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 255, 255, 255, 0)
    const v6mask = makeIPMask(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0, 0, 0, 0)
    const badaddr = makeIP(192, 168, 0)
    const badmask = makeIPMask(255, 255, 0)
    const v4maskzero = makeIPMask(0, 0, 0, 0)
    QUnit.test("NetworkNumberAndMask", (assert) => {
        function make(in0: IPNet, out?: IPNet) {
            return {
                in: in0,
                out: out,
            }
        }
        const tests = [
            make(new IPNet(v4addr, v4mask), new IPNet(v4addr, v4mask)),
            make(new IPNet(v4addr, v4mappedv6mask), new IPNet(v4addr, v4mask)),
            make(new IPNet(v4mappedv6addr, v4mappedv6mask), new IPNet(v4addr, v4mask)),
            make(new IPNet(v4mappedv6addr, v6mask), new IPNet(v4addr, v4maskzero)),
            make(new IPNet(v4addr, v6mask), new IPNet(v4addr, v4maskzero)),
            make(new IPNet(v6addr, v6mask), new IPNet(v6addr, v6mask)),
            make(new IPNet(v6addr, v4mappedv6mask), new IPNet(v6addr, v4mappedv6mask)),
            make(new IPNet(v6addr, v4mask)),
            make(new IPNet(v4addr, badmask)),
            make(new IPNet(v4mappedv6addr, badmask)),
            make(new IPNet(v6addr, badmask)),
            make(new IPNet(badaddr, v4mask)),
            make(new IPNet(badaddr, v4mappedv6mask)),
            make(new IPNet(badaddr, v6mask)),
            make(new IPNet(badaddr, badmask)),
        ]
        for (const tt of tests) {
            const out = networkNumberAndMask(tt.in)
            if (out) {
                const [ip, mask] = out
                assert.deepEqual(ip, tt.out!.ip)
                assert.deepEqual(mask, tt.out!.mask)
            } else {
                assert.equal(out, tt.out)
            }

        }
    })
    QUnit.test("IPAddrFamily", (assert) => {
        function make(ip: IP, af4: boolean, af6: boolean) {
            return {
                in: ip,
                af4: af4,
                af6: af6,
            }
        }
        const tests = [
            make(IP.v4bcast, true, false),
            make(IP.v4allsys, true, false),
            make(IP.v4allrouter, true, false),
            make(IP.v4zero, true, false),
            make(IP.v4(224, 0, 0, 1), true, false),
            make(IP.v4(127, 0, 0, 1), true, false),
            make(IP.v4(240, 0, 0, 1), true, false),
            make(IP.v6unspecified, false, true),
            make(IP.v6loopback, false, true),
            make(IP.v6interfacelocalallnodes, false, true),
            make(IP.v6linklocalallnodes, false, true),
            make(IP.v6linklocalallrouters, false, true),
            make(IP.parse("ff05::a:b:c:d")!, false, true),
            make(IP.parse("fe80::1:2:3:4")!, false, true),
            make(IP.parse("2001:db8::123:12:1")!, false, true),
        ]
        for (const tt of tests) {
            let af = tt.in.to4() !== undefined
            assert.equal(af, tt.af4)

            af = tt.in.length == IPv6len && tt.in.to4() === undefined
            assert.equal(af, tt.af6, `${tt.in}`)
        }
    })
    QUnit.test("IPAddrScope", (assert) => {
        const nilIP = new IP(new Uint8Array())
        function make(scope: (ip: IP) => boolean, ip: undefined | IP, ok: boolean) {
            return {
                scope: scope,
                in: ip ?? nilIP,
                ok: ok,
            }
        }

        const tests = [
            make((ip) => ip.isUnspecified, IP.v4zero, true),
            make((ip) => ip.isUnspecified, IP.v4(127, 0, 0, 1), false),
            make((ip) => ip.isUnspecified, IP.v6unspecified, true),
            make((ip) => ip.isUnspecified, IP.v6interfacelocalallnodes, false),
            make((ip) => ip.isUnspecified, nil, false),
            make((ip) => ip.isLoopback, IP.v4(127, 0, 0, 1), true),
            make((ip) => ip.isLoopback, IP.v4(127, 255, 255, 254), true),
            make((ip) => ip.isLoopback, IP.v4(128, 1, 2, 3), false),
            make((ip) => ip.isLoopback, IP.v6loopback, true),
            make((ip) => ip.isLoopback, IP.v6linklocalallrouters, false),
            make((ip) => ip.isLoopback, nil, false),
            make((ip) => ip.isMulticast, IP.v4(224, 0, 0, 0), true),
            make((ip) => ip.isMulticast, IP.v4(239, 0, 0, 0), true),
            make((ip) => ip.isMulticast, IP.v4(240, 0, 0, 0), false),
            make((ip) => ip.isMulticast, IP.v6linklocalallnodes, true),
            make((ip) => ip.isMulticast, makeIP(0xff, 0x05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), true),
            make((ip) => ip.isMulticast, makeIP(0xfe, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
            make((ip) => ip.isMulticast, nil, false),
            make((ip) => ip.isInterfaceLocalMulticast, IP.v4(224, 0, 0, 0), false),
            make((ip) => ip.isInterfaceLocalMulticast, IP.v4(0xff, 0x01, 0, 0), false),
            make((ip) => ip.isInterfaceLocalMulticast, IP.v6interfacelocalallnodes, true),
            make((ip) => ip.isInterfaceLocalMulticast, nil, false),
            make((ip) => ip.isLinkLocalMulticast, IP.v4(224, 0, 0, 0), true),
            make((ip) => ip.isLinkLocalMulticast, IP.v4(239, 0, 0, 0), false),
            make((ip) => ip.isLinkLocalMulticast, IP.v4(0xff, 0x02, 0, 0), false),
            make((ip) => ip.isLinkLocalMulticast, IP.v6linklocalallrouters, true),
            make((ip) => ip.isLinkLocalMulticast, makeIP(0xff, 0x05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
            make((ip) => ip.isLinkLocalMulticast, nil, false),
            make((ip) => ip.isLinkLocalUnicast, IP.v4(169, 254, 0, 0), true),
            make((ip) => ip.isLinkLocalUnicast, IP.v4(169, 255, 0, 0), false),
            make((ip) => ip.isLinkLocalUnicast, IP.v4(0xfe, 0x80, 0, 0), false),
            make((ip) => ip.isLinkLocalUnicast, makeIP(0xfe, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), true),
            make((ip) => ip.isLinkLocalUnicast, makeIP(0xfe, 0xc0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
            make((ip) => ip.isLinkLocalUnicast, nil, false),
            make((ip) => ip.isGlobalUnicast, IP.v4(240, 0, 0, 0), true),
            make((ip) => ip.isGlobalUnicast, IP.v4(232, 0, 0, 0), false),
            make((ip) => ip.isGlobalUnicast, IP.v4(169, 254, 0, 0), false),
            make((ip) => ip.isGlobalUnicast, IP.v4bcast, false),
            make((ip) => ip.isGlobalUnicast, makeIP(0x20, 0x1, 0xd, 0xb8, 0, 0, 0, 0, 0, 0, 0x1, 0x23, 0, 0x12, 0, 0x1), true),
            make((ip) => ip.isGlobalUnicast, makeIP(0xfe, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
            make((ip) => ip.isGlobalUnicast, makeIP(0xff, 0x05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
            make((ip) => ip.isGlobalUnicast, nil, false),
            make((ip) => ip.isPrivate, nil, false),
            make((ip) => ip.isPrivate, IP.v4(1, 1, 1, 1), false),
            make((ip) => ip.isPrivate, IP.v4(9, 255, 255, 255), false),
            make((ip) => ip.isPrivate, IP.v4(10, 0, 0, 0), true),
            make((ip) => ip.isPrivate, IP.v4(10, 255, 255, 255), true),
            make((ip) => ip.isPrivate, IP.v4(11, 0, 0, 0), false),
            make((ip) => ip.isPrivate, IP.v4(172, 15, 255, 255), false),
            make((ip) => ip.isPrivate, IP.v4(172, 16, 0, 0), true),
            make((ip) => ip.isPrivate, IP.v4(172, 16, 255, 255), true),
            make((ip) => ip.isPrivate, IP.v4(172, 23, 18, 255), true),
            make((ip) => ip.isPrivate, IP.v4(172, 31, 255, 255), true),
            make((ip) => ip.isPrivate, IP.v4(172, 31, 0, 0), true),
            make((ip) => ip.isPrivate, IP.v4(172, 32, 0, 0), false),
            make((ip) => ip.isPrivate, IP.v4(192, 167, 255, 255), false),
            make((ip) => ip.isPrivate, IP.v4(192, 168, 0, 0), true),
            make((ip) => ip.isPrivate, IP.v4(192, 168, 255, 255), true),
            make((ip) => ip.isPrivate, IP.v4(192, 169, 0, 0), false),
            make((ip) => ip.isPrivate, makeIP(0xfb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), false),
            make((ip) => ip.isPrivate, makeIP(0xfc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), true),
            make((ip) => ip.isPrivate, makeIP(0xfc, 0xff, 0x12, 0, 0, 0, 0, 0x44, 0, 0, 0, 0, 0, 0, 0, 0), true),
            make((ip) => ip.isPrivate, makeIP(0xfd, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), true),
            make((ip) => ip.isPrivate, makeIP(0xfe, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), false),
        ]
        for (const tt of tests) {
            assert.equal(tt.scope(tt.in), tt.ok, `${tt.in}`)

            const ip = tt.in.to4()
            if (ip) {
                assert.equal(tt.scope(ip), tt.ok)
            }
        }
    })
    QUnit.test("JoinHostPort", (assert) => {
        function make(host: string, port: string, hostPort: string) {
            return {
                host: host,
                port: port,
                hostPort: hostPort,
            }
        }
        const tests = [
            // Host name
            make("localhost", "http", "localhost:http"),
            make("localhost", "80", "localhost:80"),

            // Go-specific host name with zone identifier
            make("localhost%lo0", "http", "localhost%lo0:http"),
            make("localhost%lo0", "80", "localhost%lo0:80"),

            // IP literal
            make("127.0.0.1", "http", "127.0.0.1:http"),
            make("127.0.0.1", "80", "127.0.0.1:80"),
            make("::1", "http", "[::1]:http"),
            make("::1", "80", "[::1]:80"),

            // IP literal with zone identifier
            make("::1%lo0", "http", "[::1%lo0]:http"),
            make("::1%lo0", "80", "[::1%lo0]:80"),

            // Go-specific wildcard for host name
            make("", "http", ":http"), // Go 1 behavior
            make("", "80", ":80"),     // Go 1 behavior

            // Go-specific wildcard for service name or transport port number
            make("golang.org", "", "golang.org:"), // Go 1 behavior
            make("127.0.0.1", "", "127.0.0.1:"),   // Go 1 behavior
            make("::1", "", "[::1]:"),             // Go 1 behavior

            // Opaque service name
            make("golang.org", "https%foo", "golang.org:https%foo"), // Go 1 behavior
        ]
        for (const tt of tests) {
            assert.equal(joinHostPort(tt.host, tt.port), tt.hostPort)
        }
    })
    QUnit.test("SplitHostPort", (assert) => {
        function make(hostPort: string, host: string, port: string) {
            return {
                host: host,
                port: port,
                hostPort: hostPort,
            }
        }
        const tests = [
            // Host name
            make("localhost:http", "localhost", "http"),
            make("localhost:80", "localhost", "80"),

            // Go-specific host name with zone identifier
            make("localhost%lo0:http", "localhost%lo0", "http"),
            make("localhost%lo0:80", "localhost%lo0", "80"),
            make("[localhost%lo0]:http", "localhost%lo0", "http"), // Go 1 behavior
            make("[localhost%lo0]:80", "localhost%lo0", "80"),     // Go 1 behavior

            // IP literal
            make("127.0.0.1:http", "127.0.0.1", "http"),
            make("127.0.0.1:80", "127.0.0.1", "80"),
            make("[::1]:http", "::1", "http"),
            make("[::1]:80", "::1", "80"),

            // IP literal with zone identifier
            make("[::1%lo0]:http", "::1%lo0", "http"),
            make("[::1%lo0]:80", "::1%lo0", "80"),

            // Go-specific wildcard for host name
            make(":http", "", "http"), // Go 1 behavior
            make(":80", "", "80"),     // Go 1 behavior

            // Go-specific wildcard for service name or transport port number
            make("golang.org:", "golang.org", ""), // Go 1 behavior
            make("127.0.0.1:", "127.0.0.1", ""),   // Go 1 behavior
            make("[::1]:", "::1", ""),             // Go 1 behavior

            // Opaque service name
            make("golang.org:https%foo", "golang.org", "https%foo"), // Go 1 behavior
        ]
        for (const tt of tests) {
            const [host, port] = splitHostPort(tt.hostPort)
            assert.equal(host, tt.host)
            assert.equal(port, tt.port)
        }
        function err(hostPort: string, err: string) {
            return {
                err: err,
                hostPort: hostPort,
            }
        }
        const errs = [
            err("golang.org", "missing port in address"),
            err("127.0.0.1", "missing port in address"),
            err("[::1]", "missing port in address"),
            err("[fe80::1%lo0]", "missing port in address"),
            err("[localhost%lo0]", "missing port in address"),
            err("localhost%lo0", "missing port in address"),

            err("::1", "too many colons in address"),
            err("fe80::1%lo0", "too many colons in address"),
            err("fe80::1%lo0:80", "too many colons in address"),

            // Test cases that didn't fail in Go 1

            err("[foo:bar]", "missing port in address"),
            err("[foo:bar]baz", "missing port in address"),
            err("[foo]bar:baz", "missing port in address"),

            err("[foo]:[bar]:baz", "too many colons in address"),

            err("[foo]:[bar]baz", "unexpected '[' in address"),
            err("foo[bar]:baz", "unexpected '[' in address"),

            err("foo]bar:baz", "unexpected ']' in address"),
        ]
        for (const tt of errs) {
            try {
                splitHostPort(tt.hostPort)
                assert.true(false, tt.hostPort)
            } catch (e) {
                assert.true(e instanceof AddrError)
                if (e instanceof AddrError) {
                    assert.equal(e.err, tt.err)
                }
            }
        }
    })
})
