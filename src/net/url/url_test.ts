import { Exception } from "../../core";
import {
    Encode, shouldEscape, resolvePath,
    EscapeException, pathEscape, pathUnescape, queryEscape, queryUnescape,
    Values, URL, Userinfo,
} from "./url";

interface EscapeTest {
    in: string
    out: string
    err: Exception | undefined
}
function escapeTest(input: string, out: string, err?: Exception): EscapeTest {
    return {
        in: input,
        out: out,
        err: err,
    }
}
interface ShouldEscapeTest {
    in: string
    mode: Encode
    escape: boolean
}
function shouldEscapeTest(input: string, mode: Encode, escape: boolean): ShouldEscapeTest {
    return {
        in: input,
        mode: mode,
        escape: escape,
    }
}
interface ResolvePathTest {
    base: string
    ref: string
    expected: string
}
function resolvePathTest(base: string, ref: string, expected: string): ResolvePathTest {
    return {
        base: base,
        ref: ref,
        expected: expected,
    }
}
interface ParseTest {
    query: string
    out: Values
    ok: boolean
}
interface EncodeQueryTest {
    m: Values
    expected: string
}
interface URLTest {
    in: string
    out: URL   // expected parse
    roundtrip: string // expected result of reserializing the URL; empty means same as "in".
}
function assertDeepEqual(assert: Assert, l: URL, r: URL) {
    assert.strictEqual(JSON.stringify(l, undefined, '    '), JSON.stringify(r, undefined, '    '))
    // assert.strictEqual(l.scheme, r.scheme, 'scheme')
    // assert.strictEqual(l.opaque, r.opaque, 'opaque')
    // if (l.user === undefined) {
    //     assert.strictEqual(l.user, r.user, 'user')
    // } else if (r.user === undefined) {
    //     assert.strictEqual(l.user, r.user, 'user')
    // } else {
    //     const lu = l.user
    //     const ru = r.user
    //     assert.strictEqual(lu.username, ru.username, 'user.username')
    //     assert.strictEqual(lu.password, ru.password, 'user.password')
    // }
    // assert.strictEqual(l.host, r.host, 'host')
    // assert.strictEqual(l.path, r.path, 'path')
    // assert.strictEqual(l.rawPath, r.rawPath, 'rawPath')
    // assert.strictEqual(l.forceQuery, r.forceQuery, 'forceQuery')
    // assert.strictEqual(l.rawQuery, r.rawQuery, 'rawQuery')
    // assert.strictEqual(l.fragment, r.fragment, 'fragment')
    // assert.strictEqual(l.rawFragment, r.rawFragment, 'rawFragment')
}
function URLObject(obj: {
    [key: string]: any
}): URL {
    const u = new URL()
    u.scheme = obj.Scheme ?? ''
    u.opaque = obj.Opaque ?? ''
    u.host = obj.Host ?? ''
    u.path = obj.Path ?? ''
    u.rawPath = obj.RawPath ?? ''
    u.forceQuery = obj.ForceQuery ?? false
    u.rawQuery = obj.RawQuery ?? ''
    u.fragment = obj.Fragment ?? ''
    u.rawFragment = obj.RawFragment ?? ''
    if (obj.User) {
        u.user = new Userinfo(obj.User.Username, obj.User.Password)
    }
    return u
}
function User(name: string): any {
    return {
        Username: name
    }
}
function UserPassword(name: string, password: string): any {
    return {
        Username: name,
        Password: password,
    }
}
const urltests: Array<URLTest> = [
    // no path
    {
        in: "http://www.google.com",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
        }),
        roundtrip: "",
    },
    // path
    {
        in: "http://www.google.com/",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
        }),
        roundtrip: "",
    },
    // path with hex escaping
    {
        in: "http://www.google.com/file%20one%26two",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/file one&two",
            RawPath: "/file%20one%26two",
        }),
        roundtrip: "",
    },
    // fragment with hex escaping
    {
        in: "http://www.google.com/#file%20one%26two",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            Fragment: "file one&two",
            RawFragment: "file%20one%26two",
        }),
        roundtrip: "",
    },
    // user
    {
        in: "ftp://webmaster@www.google.com/",
        out: URLObject({
            Scheme: "ftp",
            User: User("webmaster"),
            Host: "www.google.com",
            Path: "/",
        }),
        roundtrip: "",
    },
    // escape sequence in username
    {
        in: "ftp://john%20doe@www.google.com/",
        out: URLObject({
            Scheme: "ftp",
            User: User("john doe"),
            Host: "www.google.com",
            Path: "/",
        }),
        roundtrip: "ftp://john%20doe@www.google.com/",
    },
    // empty query
    {
        in: "http://www.google.com/?",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            ForceQuery: true,
        }),
        roundtrip: "",
    },
    // query ending in question mark (Issue 14573)
    {
        in: "http://www.google.com/?foo=bar?",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "foo=bar?",
        }),
        roundtrip: "",
    },
    // query
    {
        in: "http://www.google.com/?q=go+language",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "q=go+language",
        }),
        roundtrip: "",
    },
    // query with hex escaping: NOT parsed
    {
        in: "http://www.google.com/?q=go%20language",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "q=go%20language",
        }),
        roundtrip: "",
    },
    // %20 outside query
    {
        in: "http://www.google.com/a%20b?q=c+d",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/a b",
            RawQuery: "q=c+d",
        }),
        roundtrip: "",
    },
    // path without leading /, so no parsing
    {
        in: "http:www.google.com/?q=go+language",
        out: URLObject({
            Scheme: "http",
            Opaque: "www.google.com/",
            RawQuery: "q=go+language",
        }),
        roundtrip: "http:www.google.com/?q=go+language",
    },
    // path without leading /, so no parsing
    {
        in: "http:%2f%2fwww.google.com/?q=go+language",
        out: URLObject({
            Scheme: "http",
            Opaque: "%2f%2fwww.google.com/",
            RawQuery: "q=go+language",
        }),
        roundtrip: "http:%2f%2fwww.google.com/?q=go+language",
    },
    // non-authority with path
    {
        in: "mailto:/webmaster@golang.org",
        out: URLObject({
            Scheme: "mailto",
            Path: "/webmaster@golang.org",
        }),
        roundtrip: "mailto:///webmaster@golang.org", // unfortunate compromise
    },
    // non-authority
    {
        in: "mailto:webmaster@golang.org",
        out: URLObject({
            Scheme: "mailto",
            Opaque: "webmaster@golang.org",
        }),
        roundtrip: "",
    },
    // unescaped :// in query should not create a scheme
    {
        in: "/foo?query=http://bad",
        out: URLObject({
            Path: "/foo",
            RawQuery: "query=http://bad",
        }),
        roundtrip: "",
    },
    // leading // without scheme should create an authority
    {
        in: "//foo",
        out: URLObject({
            Host: "foo",
        }),
        roundtrip: "",
    },
    // leading // without scheme, with userinfo, path, and query
    {
        in: "//user@foo/path?a=b",
        out: URLObject({
            User: User("user"),
            Host: "foo",
            Path: "/path",
            RawQuery: "a=b",
        }),
        roundtrip: "",
    },
    // Three leading slashes isn't an authority, but doesn't return an error.
    // (We can't return an error, as this code is also used via
    // ServeHTTP -> ReadRequest -> Parse, which is arguably a
    // different URL parsing context, but currently shares the
    // same codepath)
    {
        in: "///threeslashes",
        out: URLObject({
            Path: "///threeslashes",
        }),
        roundtrip: "",
    },
    {
        in: "http://user:password@google.com",
        out: URLObject({
            Scheme: "http",
            User: UserPassword("user", "password"),
            Host: "google.com",
        }),
        roundtrip: "http://user:password@google.com",
    },
    // unescaped @ in username should not confuse host
    {
        in: "http://j@ne:password@google.com",
        out: URLObject({
            Scheme: "http",
            User: UserPassword("j@ne", "password"),
            Host: "google.com",
        }),
        roundtrip: "http://j%40ne:password@google.com",
    },
    // unescaped @ in password should not confuse host
    {
        in: "http://jane:p@ssword@google.com",
        out: URLObject({
            Scheme: "http",
            User: UserPassword("jane", "p@ssword"),
            Host: "google.com",
        }),
        roundtrip: "http://jane:p%40ssword@google.com",
    },
    {
        in: "http://j@ne:password@google.com/p@th?q=@go",
        out: URLObject({
            Scheme: "http",
            User: UserPassword("j@ne", "password"),
            Host: "google.com",
            Path: "/p@th",
            RawQuery: "q=@go",
        }),
        roundtrip: "http://j%40ne:password@google.com/p@th?q=@go",
    },
    {
        in: "http://www.google.com/?q=go+language#foo",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "q=go+language",
            Fragment: "foo",
        }),
        roundtrip: "",
    },
    {
        in: "http://www.google.com/?q=go+language#foo&bar",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "q=go+language",
            Fragment: "foo&bar",
        }),
        roundtrip: "http://www.google.com/?q=go+language#foo&bar",
    },
    {
        in: "http://www.google.com/?q=go+language#foo%26bar",
        out: URLObject({
            Scheme: "http",
            Host: "www.google.com",
            Path: "/",
            RawQuery: "q=go+language",
            Fragment: "foo&bar",
            RawFragment: "foo%26bar",
        }),
        roundtrip: "http://www.google.com/?q=go+language#foo%26bar",
    },
    {
        in: "file:///home/adg/rabbits",
        out: URLObject({
            Scheme: "file",
            Host: "",
            Path: "/home/adg/rabbits",
        }),
        roundtrip: "file:///home/adg/rabbits",
    },
    // "Windows" paths are no exception to the rule.
    // See golang.org/issue/6027, especially comment #9.
    {
        in: "file:///C:/FooBar/Baz.txt",
        out: URLObject({
            Scheme: "file",
            Host: "",
            Path: "/C:/FooBar/Baz.txt",
        }),
        roundtrip: "file:///C:/FooBar/Baz.txt",
    },
    // case-insensitive scheme
    {
        in: "MaIlTo:webmaster@golang.org",
        out: URLObject({
            Scheme: "mailto",
            Opaque: "webmaster@golang.org",
        }),
        roundtrip: "mailto:webmaster@golang.org",
    },
    // Relative path
    {
        in: "a/b/c",
        out: URLObject({
            Path: "a/b/c",
        }),
        roundtrip: "a/b/c",
    },
    // escaped '?' in username and password
    {
        in: "http://%3Fam:pa%3Fsword@google.com",
        out: URLObject({
            Scheme: "http",
            User: UserPassword("?am", "pa?sword"),
            Host: "google.com",
        }),
        roundtrip: "",
    },
    // host subcomponent; IPv4 address in RFC 3986
    {
        in: "http://192.168.0.1/",
        out: URLObject({
            Scheme: "http",
            Host: "192.168.0.1",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host and port subcomponents; IPv4 address in RFC 3986
    {
        in: "http://192.168.0.1:8080/",
        out: URLObject({
            Scheme: "http",
            Host: "192.168.0.1:8080",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host subcomponent; IPv6 address in RFC 3986
    {
        in: "http://[fe80::1]/",
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1]",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host and port subcomponents; IPv6 address in RFC 3986
    {
        in: "http://[fe80::1]:8080/",
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1]:8080",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host subcomponent; IPv6 address with zone identifier in RFC 6874
    {
        in: "http://[fe80::1%25en0]/", // alphanum zone identifier
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1%en0]",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host and port subcomponents; IPv6 address with zone identifier in RFC 6874
    {
        in: "http://[fe80::1%25en0]:8080/", // alphanum zone identifier
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1%en0]:8080",
            Path: "/",
        }),
        roundtrip: "",
    },
    // host subcomponent; IPv6 address with zone identifier in RFC 6874
    {
        in: "http://[fe80::1%25%65%6e%301-._~]/", // percent-encoded+unreserved zone identifier
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1%en01-._~]",
            Path: "/",
        }),
        roundtrip: "http://[fe80::1%25en01-._~]/",
    },
    // host and port subcomponents; IPv6 address with zone identifier in RFC 6874
    {
        in: "http://[fe80::1%25%65%6e%301-._~]:8080/", // percent-encoded+unreserved zone identifier
        out: URLObject({
            Scheme: "http",
            Host: "[fe80::1%en01-._~]:8080",
            Path: "/",
        }),
        roundtrip: "http://[fe80::1%25en01-._~]:8080/",
    },
    // alternate escapings of path survive round trip
    {
        in: "http://rest.rsc.io/foo%2fbar/baz%2Fquux?alt=media",
        out: URLObject({
            Scheme: "http",
            Host: "rest.rsc.io",
            Path: "/foo/bar/baz/quux",
            RawPath: "/foo%2fbar/baz%2Fquux",
            RawQuery: "alt=media",
        }),
        roundtrip: "",
    },
    // issue 12036
    {
        in: "mysql://a,b,c/bar",
        out: URLObject({
            Scheme: "mysql",
            Host: "a,b,c",
            Path: "/bar",
        }),
        roundtrip: "",
    },
    // worst case host, still round trips
    {
        in: "scheme://!$&'()*+,;=hello!:1/path",
        out: URLObject({
            Scheme: "scheme",
            Host: "!$&'()*+,;=hello!:1",
            Path: "/path",
        }),
        roundtrip: "",
    },
    // worst case path, still round trips
    {
        in: "http://host/!$&'()*+,;=:@[hello]",
        out: URLObject({
            Scheme: "http",
            Host: "host",
            Path: "/!$&'()*+,;=:@[hello]",
            RawPath: "/!$&'()*+,;=:@[hello]",
        }),
        roundtrip: "",
    },
    // golang.org/issue/5684
    {
        in: "http://example.com/oid/[order_id]",
        out: URLObject({
            Scheme: "http",
            Host: "example.com",
            Path: "/oid/[order_id]",
            RawPath: "/oid/[order_id]",
        }),
        roundtrip: "",
    },
    // golang.org/issue/12200 (colon with empty port)
    {
        in: "http://192.168.0.2:8080/foo",
        out: URLObject({
            Scheme: "http",
            Host: "192.168.0.2:8080",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    {
        in: "http://192.168.0.2:/foo",
        out: URLObject({
            Scheme: "http",
            Host: "192.168.0.2:",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    {
        // Malformed IPv6 but still accepted.
        in: "http://2b01:e34:ef40:7730:8e70:5aff:fefe:edac:8080/foo",
        out: URLObject({
            Scheme: "http",
            Host: "2b01:e34:ef40:7730:8e70:5aff:fefe:edac:8080",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    {
        // Malformed IPv6 but still accepted.
        in: "http://2b01:e34:ef40:7730:8e70:5aff:fefe:edac:/foo",
        out: URLObject({
            Scheme: "http",
            Host: "2b01:e34:ef40:7730:8e70:5aff:fefe:edac:",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    {
        in: "http://[2b01:e34:ef40:7730:8e70:5aff:fefe:edac]:8080/foo",
        out: URLObject({
            Scheme: "http",
            Host: "[2b01:e34:ef40:7730:8e70:5aff:fefe:edac]:8080",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    {
        in: "http://[2b01:e34:ef40:7730:8e70:5aff:fefe:edac]:/foo",
        out: URLObject({
            Scheme: "http",
            Host: "[2b01:e34:ef40:7730:8e70:5aff:fefe:edac]:",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    // golang.org/issue/7991 and golang.org/issue/12719 (non-ascii %-encoded in host)
    {
        in: "http://hello.世界.com/foo",
        out: URLObject({
            Scheme: "http",
            Host: "hello.世界.com",
            Path: "/foo",
        }),
        roundtrip: "http://hello.%E4%B8%96%E7%95%8C.com/foo",
    },
    {
        in: "http://hello.%e4%b8%96%e7%95%8c.com/foo",
        out: URLObject({
            Scheme: "http",
            Host: "hello.世界.com",
            Path: "/foo",
        }),
        roundtrip: "http://hello.%E4%B8%96%E7%95%8C.com/foo",
    },
    {
        in: "http://hello.%E4%B8%96%E7%95%8C.com/foo",
        out: URLObject({
            Scheme: "http",
            Host: "hello.世界.com",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    // golang.org/issue/10433 (path beginning with //)
    {
        in: "http://example.com//foo",
        out: URLObject({
            Scheme: "http",
            Host: "example.com",
            Path: "//foo",
        }),
        roundtrip: "",
    },
    // test that we can reparse the host names we accept.
    {
        in: "myscheme://authority<\"hi\">/foo",
        out: URLObject({
            Scheme: "myscheme",
            Host: "authority<\"hi\">",
            Path: "/foo",
        }),
        roundtrip: "",
    },
    // spaces in hosts are disallowed but escaped spaces in IPv6 scope IDs are grudgingly OK.
    // This happens on Windows.
    // golang.org/issue/14002
    {
        in: "tcp://[2020::2020:20:2020:2020%25Windows%20Loves%20Spaces]:2020",
        out: URLObject({
            Scheme: "tcp",
            Host: "[2020::2020:20:2020:2020%Windows Loves Spaces]:2020",
        }),
        roundtrip: "",
    },
    // test we can roundtrip magnet url
    // fix issue https://golang.org/issue/20054
    {
        in: "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn",
        out: URLObject({
            Scheme: "magnet",
            Host: "",
            Path: "",
            RawQuery: "xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn",
        }),
        roundtrip: "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn",
    },
    {
        in: "mailto:?subject=hi",
        out: URLObject({
            Scheme: "mailto",
            Host: "",
            Path: "",
            RawQuery: "subject=hi",
        }),
        roundtrip: "mailto:?subject=hi",
    },
];
QUnit.module('url', hooks => {
    QUnit.test('URL.parse', (assert) => {
        for (const test of urltests) {
            const u = URL.parse(test.in)
            assertDeepEqual(assert, u, test.out)
        }
    })
    QUnit.test('URL.parseRequestURI', (assert) => {
        const pathThatLooksSchemeRelative = "//not.a.user@not.a.host/just/a/path"
        function make(url: string, expectedValid: boolean) {
            return {
                url: url,
                expectedValid: expectedValid,
            }
        }
        const tests = [
            make("http://foo.com", true),
            make("http://foo.com/", true),
            make("http://foo.com/path", true),
            make("/", true),
            make(pathThatLooksSchemeRelative, true),
            make("//not.a.user@%66%6f%6f.com/just/a/path/also", true),
            make("*", true),
            make("http://192.168.0.1/", true),
            make("http://192.168.0.1:8080/", true),
            make("http://[fe80::1]/", true),
            make("http://[fe80::1]:8080/", true),

            // Tests exercising RFC 6874 compliance:
            make("http://[fe80::1%25en0]/", true),                 // with alphanum zone identifier
            make("http://[fe80::1%25en0]:8080/", true),            // with alphanum zone identifier
            make("http://[fe80::1%25%65%6e%301-._~]/", true),      // with percent-encoded+unreserved zone identifier
            make("http://[fe80::1%25%65%6e%301-._~]:8080/", true), // with percent-encoded+unreserved zone identifier

            make("foo.html", false),
            make("../dir/", false),
            make(" http://foo.com", false),
            make("http://192.168.0.%31/", false),
            make("http://192.168.0.%31:8080/", false),
            make("http://[fe80::%31]/", false),
            make("http://[fe80::%31]:8080/", false),
            make("http://[fe80::%31%25en0]/", false),
            make("http://[fe80::%31%25en0]:8080/", false),

            // These two cases are valid as textual representations as
            // described in RFC 4007, but are not valid as address
            // literals with IPv6 zone identifiers in URIs as described in
            // RFC 6874.
            make("http://[fe80::1%en0]/", false),
            make("http://[fe80::1%en0]:8080/", false),
        ]
        for (const test of tests) {
            if (test.expectedValid) {
                URL.parseRequestURI(test.url)
            } else {
                assert.throws(() => {
                    URL.parseRequestURI(test.url)
                })
            }
        }
        const u = URL.parseRequestURI(pathThatLooksSchemeRelative)
        assert.strictEqual(u.path, pathThatLooksSchemeRelative)
    })
    QUnit.test('URL.toString', (assert) => {
        for (const test of urltests) {
            const u = URL.parse(test.in)
            const expected = test.roundtrip == '' ? test.in : test.roundtrip
            const s = u.toString()

            assert.strictEqual(s, expected)
        }

        const tests = [
            // No leading slash on path should prepend slash on String() call
            {
                url: URLObject({
                    Scheme: "http",
                    Host: "www.google.com",
                    Path: "search",
                }),
                want: "http://www.google.com/search",
            },
            // Relative path with first element containing ":" should be prepended with "./", golang.org/issue/17184
            {
                url: URLObject({
                    Path: "this:that",
                }),
                want: "./this:that",
            },
            // Relative path with second element containing ":" should not be prepended with "./"
            {
                url: URLObject({
                    Path: "here/this:that",
                }),
                want: "here/this:that",
            },
            // Non-relative path with first element containing ":" should not be prepended with "./"
            {
                url: URLObject({
                    Scheme: "http",
                    Host: "www.google.com",
                    Path: "this:that",
                }),
                want: "http://www.google.com/this:that",
            },
        ]
        for (const test of tests) {
            assert.equal(test.url.toString(), test.want)
        }
    })
    QUnit.test('URL.toString Redacted', (assert) => {
        const tests = [
            {
                name: "non-blank Password",
                url: URLObject({
                    Scheme: "http",
                    Host: "host.tld",
                    Path: "this:that",
                    User: UserPassword("user", "password"),
                }),
                want: "http://user:xxxxx@host.tld/this:that",
            },
            {
                name: "blank Password",
                url: URLObject({
                    Scheme: "http",
                    Host: "host.tld",
                    Path: "this:that",
                    User: User("user"),
                }),
                want: "http://user@host.tld/this:that",
            },
            {
                name: "nil User",
                url: URLObject({
                    Scheme: "http",
                    Host: "host.tld",
                    Path: "this:that",
                    User: UserPassword("", "password"),
                }),
                want: "http://:xxxxx@host.tld/this:that",
            },
            {
                name: "blank Username, blank Password",
                url: URLObject({
                    Scheme: "http",
                    Host: "host.tld",
                    Path: "this:that",
                }),
                want: "http://host.tld/this:that",
            },
            {
                name: "empty URL",
                url: URLObject({}),
                want: "",
            },
            // {
            //     name: "nil URL",
            //     url:  nil,
            //     want: "",
            // },
        ]
        for (const test of tests) {
            const s = test.url.toString(true)
            assert.strictEqual(s, test.want)
        }
    })
    QUnit.test('unescape', (assert) => {
        const tests = [
            escapeTest("", ""),
            escapeTest("abc", "abc"),
            escapeTest("1%41", "1A"),
            escapeTest("1%41%42%43", "1ABC"),
            escapeTest("%4a", "J"),
            escapeTest("%6F", "o"),
            escapeTest(
                "%", // not enough characters after %
                "",
                EscapeException.make("%")
            ),
            escapeTest(
                "%a", // not enough characters after %
                "",
                EscapeException.make("%a"),
            ),
            escapeTest(
                "%1", // not enough characters after %
                "",
                EscapeException.make("%1"),
            ),
            escapeTest(
                "123%45%6", // not enough characters after %
                "",
                EscapeException.make("%6"),
            ),
            escapeTest(
                "%zzzzz", // invalid hex digits
                "",
                EscapeException.make("%zz"),
            ),
            escapeTest("a+b", "a b"),
            escapeTest("a%20b", "a b"),
        ]
        for (const test of tests) {
            try {
                const actual = queryUnescape(test.in)
                assert.equal(actual, test.out)
            } catch (e) {
                if (e instanceof Exception) {
                    assert.equal(e.error(), test.err!.error())
                } else {
                    assert.false(true, `${test.in} not throw Exception`)
                }
            }

            let input = test.in
            let out = test.out
            if (input.indexOf("+") != -1) {
                input = input.replace(/\+/g, "%20")
                try {
                    let actual = pathUnescape(input)
                    assert.equal(actual, test.out)
                } catch (e) {
                    if (e instanceof Exception) {
                        assert.equal(e.error(), test.err!.error())
                    } else {
                        assert.false(true, `${test.in} not throw Exception`)
                    }
                }
                if (!test.err) {
                    try {
                        let s = queryUnescape(test.in.replace(/\+/g, 'XXX'))
                        input = test.in
                        out = s.replace(/XXX/g, "+")
                    } catch (_) {
                        continue
                    }
                }
            }


            try {
                let actual = pathUnescape(input)
                assert.equal(actual, out)
            } catch (e) {
                if (e instanceof Exception) {
                    assert.equal(e.error(), test.err!.error())
                } else {
                    assert.false(true, `${test.in} not throw Exception`)
                }
            }
        }
    })
    QUnit.test('queryEscape', (assert) => {
        const tests = [
            escapeTest("", ""),
            escapeTest("abc", "abc",),
            escapeTest("one two", "one+two"),
            escapeTest("10%", "10%25"),
            escapeTest(
                " ?&=#+%!<>#\"{}|\\^[]`☺\t:/@$'()*,;",
                "+%3F%26%3D%23%2B%25%21%3C%3E%23%22%7B%7D%7C%5C%5E%5B%5D%60%E2%98%BA%09%3A%2F%40%24%27%28%29%2A%2C%3B",
            ),
        ]
        for (const test of tests) {
            const v = queryEscape(test.in)
            assert.equal(v, test.out, test.in)
        }
    })
    QUnit.test('pathEscape', (assert) => {
        const tests = [
            escapeTest("", ""),
            escapeTest("abc", "abc"),
            escapeTest("abc+def", "abc+def"),
            escapeTest("a/b", "a%2Fb"),
            escapeTest("one two", "one%20two"),
            escapeTest("10%", "10%25"),
            escapeTest(
                " ?&=#+%!<>#\"{}|\\^[]`☺\t:/@$'()*,;",
                "%20%3F&=%23+%25%21%3C%3E%23%22%7B%7D%7C%5C%5E%5B%5D%60%E2%98%BA%09:%2F@$%27%28%29%2A%2C%3B",
            ),
        ]
        for (const test of tests) {
            const v = pathEscape(test.in)
            assert.equal(v, test.out, test.in)
        }
    })
    QUnit.test('encode query', (assert) => {
        const tests: Array<EncodeQueryTest> = [
            {
                m: new Values(),
                expected: ''
            },
            {
                m: Values.fromObject({
                    q: 'puppies',
                    oe: 'utf8',
                }),
                expected: 'oe=utf8&q=puppies'
            },
            {
                m: Values.fromObject({
                    q: ['dogs', '&', '7'],
                }),
                expected: 'q=dogs&q=%26&q=7'
            },
            {
                m: Values.fromObject({
                    a: ["a1", "a2", "a3"],
                    b: ["b1", "b2", "b3"],
                    c: ["c1", "c2", "c3"],
                }),
                expected: 'a=a1&a=a2&a=a3&b=b1&b=b2&b=b3&c=c1&c=c2&c=c3'
            },
        ]
        for (const test of tests) {
            assert.equal(test.m.encode(true), test.expected)
        }
    })
    QUnit.test('resolvePath', (assert) => {
        const tests = [
            resolvePathTest("a/b", ".", "/a/"),
            resolvePathTest("a/b", "c", "/a/c"),
            resolvePathTest("a/b", "..", "/"),
            resolvePathTest("a/", "..", "/"),
            resolvePathTest("a/", "../..", "/"),
            resolvePathTest("a/b/c", "..", "/a/"),
            resolvePathTest("a/b/c", "../d", "/a/d"),
            resolvePathTest("a/b/c", ".././d", "/a/d"),
            resolvePathTest("a/b", "./..", "/"),
            resolvePathTest("a/./b", ".", "/a/"),
            resolvePathTest("a/../", ".", "/"),
            resolvePathTest("a/.././b", "c", "/c"),
        ]
        for (const test of tests) {
            const v = resolvePath(test.base, test.ref)
            assert.equal(v, test.expected, test.base)
        }
    })
    QUnit.test('resolveReference', (assert) => {
        function make(base: string, rel: string, expected: string) {
            return {
                base: base,
                rel: rel,
                expected: expected,
            }
        }
        const tests = [
            make("http://foo.com?a=b", "https://bar.com/", "https://bar.com/"),
            make("http://foo.com/", "https://bar.com/?a=b", "https://bar.com/?a=b"),
            make("http://foo.com/", "https://bar.com/?", "https://bar.com/?"),
            make("http://foo.com/bar", "mailto:foo@example.com", "mailto:foo@example.com"),

            // Path-absolute references
            make("http://foo.com/bar", "/baz", "http://foo.com/baz"),
            make("http://foo.com/bar?a=b#f", "/baz", "http://foo.com/baz"),
            make("http://foo.com/bar?a=b", "/baz?", "http://foo.com/baz?"),
            make("http://foo.com/bar?a=b", "/baz?c=d", "http://foo.com/baz?c=d"),

            // Multiple slashes
            make("http://foo.com/bar", "http://foo.com//baz", "http://foo.com//baz"),
            make("http://foo.com/bar", "http://foo.com///baz/quux", "http://foo.com///baz/quux"),

            // Scheme-relative
            make("https://foo.com/bar?a=b", "//bar.com/quux", "https://bar.com/quux"),

            // Path-relative references:

            // ... current directory
            make("http://foo.com", ".", "http://foo.com/"),
            make("http://foo.com/bar", ".", "http://foo.com/"),
            make("http://foo.com/bar/", ".", "http://foo.com/bar/"),

            // ... going down
            make("http://foo.com", "bar", "http://foo.com/bar"),
            make("http://foo.com/", "bar", "http://foo.com/bar"),
            make("http://foo.com/bar/baz", "quux", "http://foo.com/bar/quux"),

            // ... going up
            make("http://foo.com/bar/baz", "../quux", "http://foo.com/quux"),
            make("http://foo.com/bar/baz", "../../../../../quux", "http://foo.com/quux"),
            make("http://foo.com/bar", "..", "http://foo.com/"),
            make("http://foo.com/bar/baz", "./..", "http://foo.com/"),
            // ".." in the middle (issue 3560)
            make("http://foo.com/bar/baz", "quux/dotdot/../tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/../tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/.././tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/./../tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/dotdot/././../../tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/dotdot/./.././../tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/dotdot/dotdot/./../../.././././tail", "http://foo.com/bar/quux/tail"),
            make("http://foo.com/bar/baz", "quux/./dotdot/../dotdot/../dot/./tail/..", "http://foo.com/bar/quux/dot/"),

            // Remove any dot-segments prior to forming the target URI.
            // https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4
            make("http://foo.com/dot/./dotdot/../foo/bar", "../baz", "http://foo.com/dot/baz"),

            // Triple dot isn't special
            make("http://foo.com/bar", "...", "http://foo.com/..."),

            // Fragment
            make("http://foo.com/bar", ".#frag", "http://foo.com/#frag"),
            make("http://example.org/", "#!$&%27()*+,;=", "http://example.org/#!$&%27()*+,;="),

            // Paths with escaping (issue 16947).
            make("http://foo.com/foo%2fbar/", "../baz", "http://foo.com/baz"),
            make("http://foo.com/1/2%2f/3%2f4/5", "../../a/b/c", "http://foo.com/1/a/b/c"),
            make("http://foo.com/1/2/3", "./a%2f../../b/..%2fc", "http://foo.com/1/2/b/..%2fc"),
            make("http://foo.com/1/2%2f/3%2f4/5", "./a%2f../b/../c", "http://foo.com/1/2%2f/3%2f4/a%2f../c"),
            make("http://foo.com/foo%20bar/", "../baz", "http://foo.com/baz"),
            make("http://foo.com/foo", "../bar%2fbaz", "http://foo.com/bar%2fbaz"),
            make("http://foo.com/foo%2dbar/", "./baz-quux", "http://foo.com/foo%2dbar/baz-quux"),

            // RFC 3986: Normal Examples
            // https://datatracker.ietf.org/doc/html/rfc3986#section-5.4.1
            make("http://a/b/c/d;p?q", "g:h", "g:h"),
            make("http://a/b/c/d;p?q", "g", "http://a/b/c/g"),
            make("http://a/b/c/d;p?q", "./g", "http://a/b/c/g"),
            make("http://a/b/c/d;p?q", "g/", "http://a/b/c/g/"),
            make("http://a/b/c/d;p?q", "/g", "http://a/g"),
            make("http://a/b/c/d;p?q", "//g", "http://g"),
            make("http://a/b/c/d;p?q", "?y", "http://a/b/c/d;p?y"),
            make("http://a/b/c/d;p?q", "g?y", "http://a/b/c/g?y"),
            make("http://a/b/c/d;p?q", "#s", "http://a/b/c/d;p?q#s"),
            make("http://a/b/c/d;p?q", "g#s", "http://a/b/c/g#s"),
            make("http://a/b/c/d;p?q", "g?y#s", "http://a/b/c/g?y#s"),
            make("http://a/b/c/d;p?q", ";x", "http://a/b/c/;x"),
            make("http://a/b/c/d;p?q", "g;x", "http://a/b/c/g;x"),
            make("http://a/b/c/d;p?q", "g;x?y#s", "http://a/b/c/g;x?y#s"),
            make("http://a/b/c/d;p?q", "", "http://a/b/c/d;p?q"),
            make("http://a/b/c/d;p?q", ".", "http://a/b/c/"),
            make("http://a/b/c/d;p?q", "./", "http://a/b/c/"),
            make("http://a/b/c/d;p?q", "..", "http://a/b/"),
            make("http://a/b/c/d;p?q", "../", "http://a/b/"),
            make("http://a/b/c/d;p?q", "../g", "http://a/b/g"),
            make("http://a/b/c/d;p?q", "../..", "http://a/"),
            make("http://a/b/c/d;p?q", "../../", "http://a/"),
            make("http://a/b/c/d;p?q", "../../g", "http://a/g"),

            // RFC 3986: Abnormal Examples
            // https://datatracker.ietf.org/doc/html/rfc3986#section-5.4.2
            make("http://a/b/c/d;p?q", "../../../g", "http://a/g"),
            make("http://a/b/c/d;p?q", "../../../../g", "http://a/g"),
            make("http://a/b/c/d;p?q", "/./g", "http://a/g"),
            make("http://a/b/c/d;p?q", "/../g", "http://a/g"),
            make("http://a/b/c/d;p?q", "g.", "http://a/b/c/g."),
            make("http://a/b/c/d;p?q", ".g", "http://a/b/c/.g"),
            make("http://a/b/c/d;p?q", "g..", "http://a/b/c/g.."),
            make("http://a/b/c/d;p?q", "..g", "http://a/b/c/..g"),
            make("http://a/b/c/d;p?q", "./../g", "http://a/b/g"),
            make("http://a/b/c/d;p?q", "./g/.", "http://a/b/c/g/"),
            make("http://a/b/c/d;p?q", "g/./h", "http://a/b/c/g/h"),
            make("http://a/b/c/d;p?q", "g/../h", "http://a/b/c/h"),
            make("http://a/b/c/d;p?q", "g;x=1/./y", "http://a/b/c/g;x=1/y"),
            make("http://a/b/c/d;p?q", "g;x=1/../y", "http://a/b/c/y"),
            make("http://a/b/c/d;p?q", "g?y/./x", "http://a/b/c/g?y/./x"),
            make("http://a/b/c/d;p?q", "g?y/../x", "http://a/b/c/g?y/../x"),
            make("http://a/b/c/d;p?q", "g#s/./x", "http://a/b/c/g#s/./x"),
            make("http://a/b/c/d;p?q", "g#s/../x", "http://a/b/c/g#s/../x"),

            // Extras.
            make("https://a/b/c/d;p?q", "//g?q", "https://g?q"),
            make("https://a/b/c/d;p?q", "//g#s", "https://g#s"),
            make("https://a/b/c/d;p?q", "//g/d/e/f?y#s", "https://g/d/e/f?y#s"),
            make("https://a/b/c/d;p#s", "?y", "https://a/b/c/d;p?y"),
            make("https://a/b/c/d;p?q#s", "?y", "https://a/b/c/d;p?y"),

            // Empty path and query but with ForceQuery (issue 46033).
            make("https://a/b/c/d;p?q#s", "?", "https://a/b/c/d;p?"),
        ]
        const opaque = URLObject({ Scheme: "scheme", Opaque: "opaque" })
        for (const test of tests) {
            const base = URL.parse(test.base)
            const rel = URL.parse(test.rel)
            let url = base.resolveReference(rel)
            assert.equal(url.toString(), test.expected)
            // Ensure that new instances are returned.
            assert.notEqual(base, url)
            // Test the convenience wrapper too.
            url = base.parse(test.rel)
            assert.equal(url.toString(), test.expected)
            assert.notEqual(base, url)
            // Ensure Opaque resets the URL.
            url = base.resolveReference(opaque)
            assertDeepEqual(assert, url, opaque)
            // Test the convenience wrapper with an opaque URL too.
            url = base.parse("scheme:opaque")
            assertDeepEqual(assert, url, opaque)
            assert.notEqual(base, url)
        }
    })
    QUnit.test('queryValues', (assert) => {
        const u = URL.parse("http://x.com?foo=bar&bar=1&bar=2&baz")
        const v = u.query()
        assert.equal(v.length, 3)
        assert.equal(v.get('foo'), 'bar')

        // Case sensitive:
        assert.equal(v.get('Foo'), '')
        assert.equal(v.get('bar'), '1')
        assert.equal(v.get('baz'), '')

        assert.true(v.has("foo"))
        assert.true(v.has("bar"))
        assert.true(v.has("baz"))
        assert.false(v.has("noexist"))
        v.del('bar')
        assert.false(v.has("bar"))
    })
    QUnit.test('parse query', (assert) => {
        const tests: Array<ParseTest> = [
            {
                query: "a=1",
                out: Values.fromObject({ "a": "1" }),
                ok: true,
            },
            {
                query: "a=1&b=2",
                out: Values.fromObject({ "a": "1", "b": "2" }),
                ok: true,
            },
            {
                query: "a=1&a=2&a=banana",
                out: Values.fromObject({ "a": ["1", "2", "banana"] }),
                ok: true,
            },
            {
                query: "ascii=%3Ckey%3A+0x90%3E",
                out: Values.fromObject({ "ascii": "<key: 0x90>" }),
                ok: true,
            },
            {
                query: "a=1;b=2",
                out: new Values(),
                ok: false,
            },
            {
                query: "a;b=1",
                out: new Values(),
                ok: false,
            },
            {
                query: "a=%3B", // hex encoding for semicolon
                out: Values.fromObject({ "a": ";" }),
                ok: true,
            },
            {
                query: "a%3Bb=1",
                out: Values.fromObject({ "a;b": "1" }),
                ok: true,
            },
            {
                query: "a=1&a=2;a=banana",
                out: Values.fromObject({ "a": "1" }),
                ok: false,
            },
            {
                query: "a;b&c=1",
                out: Values.fromObject({ "c": "1" }),
                ok: false,
            },
            {
                query: "a=1&b=2;a=3&c=4",
                out: Values.fromObject({ "a": "1", "c": "4" }),
                ok: false,
            },
            {
                query: "a=1&b=2;c=3",
                out: Values.fromObject({ "a": "1" }),
                ok: false,
            },
            {
                query: ";",
                out: new Values(),
                ok: false,
            },
            {
                query: "a=1;",
                out: new Values(),
                ok: false,
            },
            {
                query: "a=1&;",
                out: Values.fromObject({ "a": "1" }),
                ok: false,
            },
            {
                query: ";a=1&b=2",
                out: Values.fromObject({ "b": "2" }),
                ok: false,
            },
            {
                query: "a=1&b=2;",
                out: Values.fromObject({ "a": "1" }),
                ok: false,
            },
        ]
        for (const test of tests) {
            const errs = new Array<Exception>()
            const form = Values.parse(test.query, errs)
            assert.strictEqual(test.ok, errs.length == 0, test.query)

            assert.equal(form.length, test.out.length)

            test.out.m.forEach((evs, k) => {
                const vs = form.m.get(k)
                assert.true(Array.isArray(vs))
                if (vs) {
                    assert.strictEqual(vs.length, evs.length)
                    for (let i = 0; i < vs.length; i++) {
                        assert.strictEqual(vs[i], evs[i])
                    }
                }
            })
        }
    })
    QUnit.test('requestURI', (assert) => {
        function make(obj: any, out: string) {
            return {
                url: URLObject(obj),
                out: out,
            }
        }
        const tests = [
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "",
                },
                "/",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/a b",
                },
                "/a%20b",
            ),
            // golang.org/issue/4860 variant 1
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Opaque: "/%2F/%2F/",
                },
                "/%2F/%2F/",
            ),
            // golang.org/issue/4860 variant 2
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Opaque: "//other.example.com/%2F/%2F/",
                },
                "http://other.example.com/%2F/%2F/",
            ),
            // better fix for issue 4860
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/////",
                    RawPath: "/%2F/%2F/",
                },
                "/%2F/%2F/",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/////",
                    RawPath: "/WRONG/", // ignored because doesn't match Path
                },
                "/////",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/a b",
                    RawQuery: "q=go+language",
                },
                "/a%20b?q=go+language",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/a b",
                    RawPath: "/a b", // ignored because invalid
                    RawQuery: "q=go+language",
                },
                "/a%20b?q=go+language",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/a?b",
                    RawPath: "/a?b", // ignored because invalid
                    RawQuery: "q=go+language",
                },
                "/a%3Fb?q=go+language",
            ),
            make(
                {
                    Scheme: "myschema",
                    Opaque: "opaque",
                },
                "opaque",
            ),
            make(
                {
                    Scheme: "myschema",
                    Opaque: "opaque",
                    RawQuery: "q=go+language",
                },
                "opaque?q=go+language",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "//foo",
                },
                "//foo",
            ),
            make(
                {
                    Scheme: "http",
                    Host: "example.com",
                    Path: "/foo",
                    ForceQuery: true,
                },
                "/foo?",
            ),
        ]
        for (const test of tests) {
            const s = test.url.requestURI()
            assert.strictEqual(s, test.out)
        }
    })
    QUnit.test('parseFailure', (assert) => {
        const url = "%gh&%ij"
        const errs = new Array<Exception>()

        Values.parse(url, errs)
        assert.equal(errs.length, 1)
        const msg = errs[0]!.error()

        assert.true(msg.indexOf('%gh') >= 0)
    })
    QUnit.test('parseErrors', (assert) => {
        function make(input: string, wantErr: boolean) {
            return {
                in: input,
                wantErr: wantErr,
            }
        }
        const tests = [
            // make("http://[::1]", false),
            // make("http://[::1]:80", false),
            // make("http://[::1]:namedport", true), // rfc3986 3.2.3
            // make("http://x:namedport", true),     // rfc3986 3.2.3
            // make("http://[::1]/", false),
            // make("http://[::1]a", true),
            // make("http://[::1]%23", true),
            // make("http://[::1%25en0]", false),    // valid zone id
            // make("http://[::1]:", false),         // colon, but no port OK
            // make("http://x:", false),             // colon, but no port OK
            // make("http://[::1]:%38%30", true),    // not allowed: % encoding only for non-ASCII
            // make("http://[::1%25%41]", false),    // RFC 6874 allows over-escaping in zone
            // make("http://[%10::1]", true),        // no %xx escapes in IP address
            // make("http://[::1]/%48", false),      // %xx in path is fine
            // make("http://%41:8080/", true),       // not allowed: % encoding only for non-ASCII
            // make("mysql://x@y(z:123)/foo", true), // not well-formed per RFC 3986, golang.org/issue/33646
            // make("mysql://x@y(1.2.3.4:123)/foo", true),

            // make(" http://foo.com", true),  // invalid character in schema
            // make("ht tp://foo.com", true),  // invalid character in schema
            // make("ahttp://foo.com", false), // valid schema characters
            // make("1http://foo.com", true),  // invalid character in schema

            // make("http://[]%20%48%54%54%50%2f%31%2e%31%0a%4d%79%48%65%61%64%65%72%3a%20%31%32%33%0a%0a/", true), // golang.org/issue/11208
            // make("http://a b.com/", true),    // no space in host name please
            // make("cache_object://foo", true), // scheme cannot have _, relative path cannot have : in first segment
            // make("cache_object:foo", true),
            make("cache_object:foo/bar", true),
            // make("cache_object/:foo/bar", false),
        ]
        for (const test of tests) {
            if (test.wantErr) {
                assert.throws(() => {
                    URL.parse(test.in)
                })
            } else {
                URL.parse(test.in)
            }
        }
    })
    QUnit.test('starRequest', (assert) => {
        const u = URL.parse('*')
        assert.equal(u.requestURI(), '*')
    })

    QUnit.test('shouldEscape', (assert) => {
        const tests = [
            // Unreserved characters (§2.3)
            shouldEscapeTest('a', Encode.Path, false),
            shouldEscapeTest('a', Encode.UserPassword, false),
            shouldEscapeTest('a', Encode.QueryComponent, false),
            shouldEscapeTest('a', Encode.Fragment, false),
            shouldEscapeTest('a', Encode.Host, false),
            shouldEscapeTest('z', Encode.Path, false),
            shouldEscapeTest('A', Encode.Path, false),
            shouldEscapeTest('Z', Encode.Path, false),
            shouldEscapeTest('0', Encode.Path, false),
            shouldEscapeTest('9', Encode.Path, false),
            shouldEscapeTest('-', Encode.Path, false),
            shouldEscapeTest('-', Encode.UserPassword, false),
            shouldEscapeTest('-', Encode.QueryComponent, false),
            shouldEscapeTest('-', Encode.Fragment, false),
            shouldEscapeTest('.', Encode.Path, false),
            shouldEscapeTest('_', Encode.Path, false),
            shouldEscapeTest('~', Encode.Path, false),

            // User information (§3.2.1)
            shouldEscapeTest(':', Encode.UserPassword, true),
            shouldEscapeTest('/', Encode.UserPassword, true),
            shouldEscapeTest('?', Encode.UserPassword, true),
            shouldEscapeTest('@', Encode.UserPassword, true),
            shouldEscapeTest('$', Encode.UserPassword, false),
            shouldEscapeTest('&', Encode.UserPassword, false),
            shouldEscapeTest('+', Encode.UserPassword, false),
            shouldEscapeTest(',', Encode.UserPassword, false),
            shouldEscapeTest(';', Encode.UserPassword, false),
            shouldEscapeTest('=', Encode.UserPassword, false),

            // Host (IP address, IPv6 address, registered name, port suffix; §3.2.2)
            shouldEscapeTest('!', Encode.Host, false),
            shouldEscapeTest('$', Encode.Host, false),
            shouldEscapeTest('&', Encode.Host, false),
            shouldEscapeTest('\'', Encode.Host, false),
            shouldEscapeTest('(', Encode.Host, false),
            shouldEscapeTest(')', Encode.Host, false),
            shouldEscapeTest('*', Encode.Host, false),
            shouldEscapeTest('+', Encode.Host, false),
            shouldEscapeTest(',', Encode.Host, false),
            shouldEscapeTest(';', Encode.Host, false),
            shouldEscapeTest('=', Encode.Host, false),
            shouldEscapeTest(':', Encode.Host, false),
            shouldEscapeTest('[', Encode.Host, false),
            shouldEscapeTest(']', Encode.Host, false),
            shouldEscapeTest('0', Encode.Host, false),
            shouldEscapeTest('9', Encode.Host, false),
            shouldEscapeTest('A', Encode.Host, false),
            shouldEscapeTest('z', Encode.Host, false),
            shouldEscapeTest('_', Encode.Host, false),
            shouldEscapeTest('-', Encode.Host, false),
            shouldEscapeTest('.', Encode.Host, false),
        ]
        for (const test of tests) {
            const v = shouldEscape(test.in.charCodeAt(0), test.mode)
            assert.equal(v, test.escape, test.in)
        }
    })

    QUnit.test('URLHostnameAndPort', (assert) => {
        function make(input: string, host: string, port: string) {
            return {
                in: input,
                host: host,
                port: port,
            }
        }
        const tests = [
            make("foo.com:80", "foo.com", "80"),
            make("foo.com", "foo.com", ""),
            make("foo.com:", "foo.com", ""),
            make("FOO.COM", "FOO.COM", ""), // no canonicalization
            make("1.2.3.4", "1.2.3.4", ""),
            make("1.2.3.4:80", "1.2.3.4", "80"),
            make("[1:2:3:4]", "1:2:3:4", ""),
            make("[1:2:3:4]:80", "1:2:3:4", "80"),
            make("[::1]:80", "::1", "80"),
            make("[::1]", "::1", ""),
            make("[::1]:", "::1", ""),
            make("localhost", "localhost", ""),
            make("localhost:443", "localhost", "443"),
            make("some.super.long.domain.example.org:8080", "some.super.long.domain.example.org", "8080"),
            make("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:17000", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", "17000"),
            make("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", ""),

            // Ensure that even when not valid, Host is one of "Hostname",
            // "Hostname:Port", "[Hostname]" or "[Hostname]:Port".
            // See https://golang.org/issue/29098.
            make("[google.com]:80", "google.com", "80"),
            make("google.com]:80", "google.com]", "80"),
            make("google.com:80_invalid_port", "google.com:80_invalid_port", ""),
            make("[::1]extra]:80", "::1]extra", "80"),
            make("google.com]extra:extra", "google.com]extra:extra", ""),
        ]
        for (const test of tests) {
            const u = new URL()
            u.host = test.in
            assert.strictEqual(u.hostname(), test.host, test.in)
            assert.strictEqual(u.port() ?? '', test.port, test.in)
        }
    })
})
