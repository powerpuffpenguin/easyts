import { Slice, Bytes } from "./slice"

QUnit.module('slice', hooks => {
    QUnit.test('make', (assert) => {
        const s0 = Slice.make<number>(5, 10)
        assert.equal(s0.length, 5)
        assert.equal(s0.capacity, 10)
        const s1 = s0.slice(1)
        assert.equal(s1.length, 4)
        assert.equal(s1.capacity, 9)
        for (let i = 0; i < s0.length; i++) {
            s0.set(i, i)
        }
        assert.equal(s0.join(), '0,1,2,3,4')
        assert.equal(s1.join(), '1,2,3,4')
        const s2 = s1.append(5, 6)
        assert.equal(s2.length, 6)
        assert.equal(s2.capacity, 9)
        assert.equal(s2.join(), '1,2,3,4,5,6')
        const s3 = s2.slice(0, 1)
        assert.equal(s3.join(), '1')
    })
    QUnit.test('bytes', (assert) => {
        const str = '0測試'
        const b = Bytes.fromString(str)
        assert.equal(b.toString(), str)

        const b1 = b.append(97, 98)
        assert.equal(b1.toString(), str + 'ab')
        const b2 = b1.slice(0, b1.length - 1)
        assert.equal(b2.toString(), str + 'a')
        const view = b2.dateView()
        view.setUint8(b2.length - 1, 99)
        view.setUint8(0, 100)
        assert.equal(b1.toString(), 'd測試cb')
        assert.equal(b2.toString(), 'd測試c')
        assert.equal(b.toString(), str)
    })
})