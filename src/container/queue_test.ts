
import { Queue } from "./queue";

QUnit.module('container.queue', hooks => {
    QUnit.test('basic', async (assert) => {
        const q = new Queue<number>(5)
        assert.true(q.pushBack(3))
        assert.true(q.pushBack(4))
        assert.true(q.pushBack(5))
        assert.true(q.pushFront(2))
        assert.true(q.pushFront(1))

        assert.false(q.pushFront(1))
        assert.false(q.pushBack(1))

        assert.equal(q.join(','), '1,2,3,4,5')

        assert.equal(q.popFront(), 1)
        assert.equal(q.popBack(), 5)
        assert.equal(q.length, 3)
        assert.equal(q.join(','), '2,3,4')
        assert.equal(q.map((v) => v, true).join(','), '4,3,2')

        assert.true(q.pushBack(5))
        assert.true(q.pushBack(6))
        assert.equal(q.join(','), '2,3,4,5,6')
        assert.equal(q.popBack(), 6)
        assert.equal(q.popBack(), 5)
        assert.equal(q.join(','), '2,3,4')

        assert.true(q.pushFront(1))
        assert.true(q.pushFront(0))
        assert.equal(q.join(','), '0,1,2,3,4')
        assert.equal(q.popFront(), 0)
        assert.equal(q.popFront(), 1)
        assert.equal(q.join(','), '2,3,4')
    })
})