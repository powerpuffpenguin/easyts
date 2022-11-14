import { Exception } from "../../core";
import {
    Encode, shouldEscape, resolvePath,
    EscapeException, pathEscape, pathUnescape, queryEscape, queryUnescape,
    Values,
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
QUnit.module('url', hooks => {
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
})
