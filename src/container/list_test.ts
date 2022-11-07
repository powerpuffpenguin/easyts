import { nopCallback } from "../core";
import { List } from "./list";
QUnit.module('container.list', hooks => {
    QUnit.test('basic', async (assert) => {
        const l = new List<number>()
        for (let i = 0; i < 2; i++) {
            assert.true(l.isEmpty)
            l.pushBackList([4, 5, 6])
            assert.true(l.isNotEmpty)
            assert.equal(l.length, 3)
            l.pushFrontList([1, 2, 3])
            assert.equal(l.length, 6)

            const c = l.clone()
            assert.equal(l.length, 6)
            assert.equal(c.length, 6)
            assert.true(c.compareTo(l) == 0);

            assert.equal(l.join(), '1,2,3,4,5,6')
            c.back()!.data = 10
            assert.equal(l.join(), '1,2,3,4,5,6')
            assert.equal(c.join(), '1,2,3,4,5,10')

            assert.true(l.compareTo(c) < 0)

            const v6 = l.back()!
            const v7 = l.pushBack(7)
            assert.equal(l.join(), '1,2,3,4,5,6,7')
            let flag = false
            assert.true(l.remove(v6, (v) => {
                assert.equal(v, 6)
                flag = true
            }))
            assert.true(flag)
            assert.equal(l.join(), '1,2,3,4,5,7')
            assert.false(l.remove(v6, (v) => {
                assert.equal(v, 6)
                flag = false
            }))
            assert.true(flag)

            assert.false(l.moveToBack(v7))
            assert.true(l.moveToFront(v7))
            assert.equal(l.join(), '7,1,2,3,4,5')
            l.insertAfter(0, v7)
            assert.false(l.moveToFront(v7))
            l.insertBefore(-1, v7)
            assert.true(l.moveToBack(v7))
            assert.equal(l.join(), '-1,0,1,2,3,4,5,7')

            l.clear(nopCallback)
        }
    })
})
