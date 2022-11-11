import { clean, join, ext, base, dir, split, isAbs } from "./path";


QUnit.module('path', hooks => {
    QUnit.test('clean', (assert) => {
        const tests = [
            // Already clean
            ["", "."],
            ["abc", "abc"],
            ["abc/def", "abc/def"],
            ["a/b/c", "a/b/c"],
            [".", "."],
            ["..", ".."],
            ["../..", "../.."],
            ["../../abc", "../../abc"],
            ["/abc", "/abc"],
            ["/", "/"],

            // Remove trailing slash
            ["abc/", "abc"],
            ["abc/def/", "abc/def"],
            ["a/b/c/", "a/b/c"],
            ["./", "."],
            ["../", ".."],
            ["../../", "../.."],
            ["/abc/", "/abc"],

            // Remove doubled slash
            ["abc//def//ghi", "abc/def/ghi"],
            ["//abc", "/abc"],
            ["///abc", "/abc"],
            ["//abc//", "/abc"],
            ["abc//", "abc"],

            // Remove . elements
            ["abc/./def", "abc/def"],
            ["/./abc/def", "/abc/def"],
            ["abc/.", "abc"],

            // Remove .. elements
            ["abc/def/ghi/../jkl", "abc/def/jkl"],
            ["abc/def/../ghi/../jkl", "abc/jkl"],
            ["abc/def/..", "abc"],
            ["abc/def/../..", "."],
            ["/abc/def/../..", "/"],
            ["abc/def/../../..", ".."],
            ["/abc/def/../../..", "/"],
            ["abc/def/../../../ghi/jkl/../../../mno", "../../mno"],

            // Combinations
            ["abc/./../def", "def"],
            ["abc//./../def", "def"],
            ["abc/../../././../def", "../../def"],
        ]
        for (const test of tests) {
            const v0 = clean(test[0])
            assert.equal(v0, test[1], test[0])
            const v1 = clean(test[1])
            assert.equal(v1, test[1], test[1])
        }
    })
    QUnit.test('join', (assert) => {
        const tests = [
            // zero parameters
            [[], ""],

            // one parameter
            [[""], ""],
            [["a"], "a"],

            // two parameters
            [["a", "b"], "a/b"],
            [["a", ""], "a"],
            [["", "b"], "b"],
            [["/", "a"], "/a"],
            [["/", ""], "/"],
            [["a/", "b"], "a/b"],
            [["a/", ""], "a"],
            [["", ""], ""],
        ]
        for (const test of tests) {
            const v = join(...test[0])
            assert.equal(v, test[1], JSON.stringify(test[0]))
        }
    })
    QUnit.test('ext', (assert) => {
        const tests = [
            ["path.go", ".go"],
            ["path.pb.go", ".go"],
            ["a.dir/b", ""],
            ["a.dir/b.go", ".go"],
            ["a.dir/", ""],
        ]
        for (const test of tests) {
            const v = ext(test[0])
            assert.equal(v, test[1], test[0])
        }
    })
    QUnit.test('base', (assert) => {
        const tests = [
            // Already clean
            ["", "."],
            [".", "."],
            ["/.", "."],
            ["/", "/"],
            ["////", "/"],
            ["x/", "x"],
            ["abc", "abc"],
            ["abc/def", "def"],
            ["a/b/.x", ".x"],
            ["a/b/c.", "c."],
            ["a/b/c.x", "c.x"],
        ]
        for (const test of tests) {
            const v = base(test[0])
            assert.equal(v, test[1], test[0])
        }
    })
    QUnit.test('dir', (assert) => {
        const tests = [
            // Already clean
            ["", "."],
            [".", "."],
            ["/.", "/"],
            ["/", "/"],
            ["////", "/"],
            ["/foo", "/"],
            ["x/", "x"],
            ["abc", "."],
            ["abc/def", "abc"],
            ["abc////def", "abc"],
            ["a/b/.x", "a/b"],
            ["a/b/c.", "a/b"],
            ["a/b/c.x", "a/b"],
        ]
        for (const test of tests) {
            const v = dir(test[0])
            assert.equal(v, test[1], test[0])
        }

        for (const test of tests) {
            const v = split(test[0])
            assert.equal(v.dir + v.file, test[0], test[0])
        }
    })
    QUnit.test('isAbs', (assert) => {
        const tests = [
            ["", false],
            ["/", true],
            ["/usr/bin/gcc", true],
            ["..", false],
            ["/a/../bb", true],
            [".", false],
            ["./", false],
            ["lala", false],

        ]
        for (const test of tests) {
            const v = isAbs(test[0] as string)
            assert.equal(v, test[1], test[0] as string)
        }
    })
})