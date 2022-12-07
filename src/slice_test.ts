import { Slice } from "./slice"
import { Constructor } from './types'
import { MaxInt64 } from './number'
QUnit.module('slice', hooks => {
    QUnit.test('make errs', (assert) => {
        const tests: Array<[number, number, string, Constructor<any>]> = [
            [0, -1, "capacity", TypeError],
            [-1, -1, "length", TypeError],
            [2, 0, "capacity", RangeError],
            [2, 1, "capacity", RangeError],
        ]
        for (const tt of tests) {
            try {
                Slice.make(tt[0], tt[1])
                assert.false(true, `${tt} not throw`)
            } catch (e) {
                assert.true(e instanceof tt[3], `${tt} not instanceof `)
                const msg: string = (e as any).message
                assert.true(msg.indexOf(tt[2]) >= 0, `${tt} not indexof, msg=${msg}`)
            }
        }
    })
    QUnit.test('attach errs', (assert) => {
        const tests: Array<[number, number, number, string, Constructor<any>]> = [
            [3, 0, -1, "end", TypeError],
            [3, -1, -1, "start", TypeError],
            [3, 2, 4, "end", RangeError],
            [3, 4, 3, "start", RangeError],
            [0, 0, 1, "end", RangeError],
        ]
        for (const tt of tests) {
            try {
                Slice.attach(new Array(tt[0]), tt[1], tt[2])
                assert.false(true, `${tt} not throw`)
            } catch (e) {
                assert.true(e instanceof tt[4], `${tt} not instanceof `)
                const msg: string = (e as any).message
                assert.true(msg.indexOf(tt[3]) >= 0, `${tt} not indexof, msg=${msg}`)
            }
        }
    })
    QUnit.test('make', (assert) => {
        function make(len: number, cap: undefined | number, l: number, c: number) {
            return {
                len: len,
                cap: cap,
                l: l,
                c: c,
            }
        }
        const tests = [
            make(0, 0, 0, 0),
            make(0, undefined, 0, 0),
            make(0, 3, 0, 3),
            make(1, 3, 1, 3),
            make(1, undefined, 1, 1),
        ]
        for (const tt of tests) {
            const s = Slice.make(tt.len, tt.cap)
            assert.equal(s.length, tt.l, `${JSON.stringify(tt)} not len`)
            assert.equal(s.capacity, tt.c, `${JSON.stringify(tt)} not cap`)
        }

    })
    QUnit.test('attach', (assert) => {
        function make(arr: number, start: number | undefined, end: undefined | number, l: number, c: number) {
            return {
                arr: new Array(arr),
                start: start,
                end: end,
                l: l,
                c: c,
            }
        }
        const tests = [
            make(0, 0, 0, 0, 0),
            make(0, undefined, 0, 0, 0),
            make(3, 0, 0, 0, 3),
            make(3, 0, 1, 1, 3),
            make(3, 0, 3, 3, 3),
            make(3, 1, 2, 1, 2),
            make(3, 1, 3, 2, 2),
            make(3, undefined, undefined, 3, 3),
            make(3, 1, undefined, 2, 2),
        ]
        for (const tt of tests) {
            const s = Slice.attach(tt.arr, tt.start, tt.end)
            assert.equal(s.length, tt.l, `${JSON.stringify(tt)} not len`)
            assert.equal(s.capacity, tt.c, `${JSON.stringify(tt)} not cap`)
        }

        // const s = Slice.attach([1, 2, 3])
        // s.forEach((v) => console.log(v))
        // s.forEach((v) => console.log(v), true)
    })
    //     QUnit.test('make', (assert) => {
    //         const s0 = Slice.make<number>(5, 10)
    //         assert.equal(s0.length, 5)
    //         assert.equal(s0.capacity, 10)
    //         const s1 = s0.slice(1)
    //         assert.equal(s1.length, 4)
    //         assert.equal(s1.capacity, 9)
    //         for (let i = 0; i < s0.length; i++) {
    //             s0.set(i, i)
    //         }
    //         assert.equal(s0.join(), '0,1,2,3,4')
    //         assert.equal(s1.join(), '1,2,3,4')
    //         const s2 = s1.append(5, 6)
    //         assert.equal(s2.length, 6)
    //         assert.equal(s2.capacity, 9)
    //         assert.equal(s2.join(), '1,2,3,4,5,6')
    //         const s3 = s2.slice(0, 1)
    //         assert.equal(s3.join(), '1')
    //     })
    //     QUnit.test('bytes', (assert) => {
    //         const str = '0測試'
    //         const b = Bytes.fromString(str)
    //         assert.equal(b.toString(), str)

    //         const b1 = b.append(97, 98)
    //         assert.equal(b1.toString(), str + 'ab')
    //         const b2 = b1.slice(0, b1.length - 1)
    //         assert.equal(b2.toString(), str + 'a')
    //         const view = b2.dateView()
    //         view.setUint8(b2.length - 1, 99)
    //         view.setUint8(0, 100)
    //         assert.equal(b1.toString(), 'd測試cb')
    //         assert.equal(b2.toString(), 'd測試c')
    //         assert.equal(b.toString(), str)
    //     })
})