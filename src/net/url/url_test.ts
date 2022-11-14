import { Exception } from "../../core";
import { EscapeException, pathEscape, pathUnescape, queryEscape, queryUnescape } from "./url";

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


QUnit.module('url', hooks => {
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
})