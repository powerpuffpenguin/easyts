import { Exception } from "../core";
import { match, errBadPattern } from "./match";


QUnit.module('path', hooks => {
    QUnit.test('match', (assert) => {
        function make(pattern: string, s: string, match: boolean, err?: Exception) {
            return {
                pattern: pattern,
                s: s,
                match: match,
                err: err,
            }
        }
        const tests = [
            make("abc", "abc", true, undefined),
            make("*", "abc", true, undefined),
            make("*c", "abc", true, undefined),
            make("a*", "a", true, undefined),
            make("a*", "abc", true, undefined),
            make("a*", "ab/c", false, undefined),
            make("a*/b", "abc/b", true, undefined),
            make("a*/b", "a/c/b", false, undefined),
            make("a*b*c*d*e*/f", "axbxcxdxe/f", true, undefined),
            make("a*b*c*d*e*/f", "axbxcxdxexxx/f", true, undefined),
            make("a*b*c*d*e*/f", "axbxcxdxe/xxx/f", false, undefined),
            make("a*b*c*d*e*/f", "axbxcxdxexxx/fff", false, undefined),
            make("a*b?c*x", "abxbbxdbxebxczzx", true, undefined),
            make("a*b?c*x", "abxbbxdbxebxczzy", false, undefined),
            make("ab[c]", "abc", true, undefined),
            make("ab[b-d]", "abc", true, undefined),
            make("ab[e-g]", "abc", false, undefined),
            make("ab[^c]", "abc", false, undefined),
            make("ab[^b-d]", "abc", false, undefined),
            make("ab[^e-g]", "abc", true, undefined),
            make("a\\*b", "a*b", true, undefined),
            make("a\\*b", "ab", false, undefined),
            make("a?b", "a☺b", true, undefined),
            make("a[^a]b", "a☺b", true, undefined),
            make("a???b", "a☺b", false, undefined),
            make("a[^a][^a][^a]b", "a☺b", false, undefined),
            make("[a-ζ]*", "α", true, undefined),
            make("*[a-ζ]", "A", false, undefined),
            make("a?b", "a/b", false, undefined),
            make("a*b", "a/b", false, undefined),
            make("[\\]a]", "]", true, undefined),
            make("[\\-]", "-", true, undefined),
            make("[x\\-]", "x", true, undefined),
            make("[x\\-]", "-", true, undefined),
            make("[x\\-]", "z", false, undefined),
            make("[\\-x]", "x", true, undefined),
            make("[\\-x]", "-", true, undefined),
            make("[\\-x]", "a", false, undefined),
            make("[]a]", "]", false, errBadPattern),
            make("[-]", "-", false, errBadPattern),
            make("[x-]", "x", false, errBadPattern),
            make("[x-]", "-", false, errBadPattern),
            make("[x-]", "z", false, errBadPattern),
            make("[-x]", "x", false, errBadPattern),
            make("[-x]", "-", false, errBadPattern),
            make("[-x]", "a", false, errBadPattern),
            make("\\", "a", false, errBadPattern),
            make("[a-b-c]", "a", false, errBadPattern),
            make("[", "a", false, errBadPattern),
            make("[^", "a", false, errBadPattern),
            make("[^bc", "a", false, errBadPattern),
            make("a[", "a", false, errBadPattern),
            make("a[", "ab", false, errBadPattern),
            make("a[", "x", false, errBadPattern),
            make("a/b[", "x", false, errBadPattern),
            make("*x", "xxx", true, undefined),
            make("中文", "中文", true, undefined),
            make("?文", "中文", true, undefined),
            make("?中", "中文", false, undefined),
        ]
        for (const test of tests) {
            if (test.err) {
                assert.throws(() => {
                    match(test.pattern, test.s)
                }, test.err, test.pattern)
            } else {
                assert.strictEqual(match(test.pattern, test.s), test.match, test.pattern)
            }
        }
    })
})