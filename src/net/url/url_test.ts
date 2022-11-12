import { Exception } from "../../core";
import { pathEscape, queryEscape } from "./url";

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
})