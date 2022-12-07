import { assert } from "qunit";
import { nopCallback } from "../core";
import { List, ListElement } from "./list";
function checkListPointers<T>(assert: Assert, l: List<T>, es: Array<ListElement<T>>) {
    const root = l._root()

    assert.equal(l.length, es.length)
    // zero length lists must be the zero value or properly initialized (sentinel circle)
    if (es.length == 0) {
        assert.false(
            (root.next_ != undefined && root.next_ != root)
            || (root.prev_ != undefined && root.prev_ != root)
        )
        return
    }

    // len(es) > 0

    // check internal and external prev/next connections
    for (let i = 0; i < es.length; i++) {
        const e = es[i]
        let prev = root
        let Prev: ListElement<T> | undefined
        if (i > 0) {
            prev = es[i - 1]
            Prev = prev
        }
        let p = e.prev_
        assert.equal(p, prev, 'prev')
        p = e.prev()
        assert.equal(p, Prev, 'Prev')

        let next = root
        let Next: ListElement<T> | undefined
        if (i < es.length - 1) {
            next = es[i + 1]
            Next = next
        }
        let n = e.next_
        assert.equal(n, next)
        n = e.next()
        assert.equal(n, Next)
    }
}
function checkList<T>(t: Assert, l: List<T>, es: Array<T>) {
    assert.equal(l.length, es.length)
    let i = 0
    for (let e = l.front(); e != undefined; e = e.next()) {
        const le = e.data
        assert.strictEqual(le, es[i])
        i++
    }

    i = 0
    for (const le of l) {
        assert.strictEqual(le, es[i])
        i++
    }
    i = es.length - 1
    for (const le of l.reverse) {
        assert.strictEqual(le, es[i])
        i--
    }
}
QUnit.module('container.list', hooks => {
    QUnit.test('basic', (assert) => {
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

    QUnit.test('list', (t) => {
        const l = new List<any>()
        checkListPointers(t, l, [])

        // Single element list
        let e = l.pushFront("a")
        checkListPointers(t, l, [e])
        l.moveToFront(e)
        checkListPointers(t, l, [e])
        l.moveToBack(e)
        checkListPointers(t, l, [e])
        l.remove(e)
        checkListPointers(t, l, [])

        // Bigger list
        let e2 = l.pushFront(2)
        const e1 = l.pushFront(1)
        const e3 = l.pushBack(3)
        const e4 = l.pushBack("banana")
        checkListPointers(t, l, [e1, e2, e3, e4])

        l.remove(e2)
        checkListPointers(t, l, [e1, e3, e4])

        l.moveToFront(e3) // move from middle
        checkListPointers(t, l, [e3, e1, e4])

        l.moveToFront(e1)
        l.moveToBack(e3) // move from middle
        checkListPointers(t, l, [e1, e4, e3])

        l.moveToFront(e3) // move from back
        checkListPointers(t, l, [e3, e1, e4])
        l.moveToFront(e3) // should be no-op
        checkListPointers(t, l, [e3, e1, e4])

        l.moveToBack(e3) // move from front
        checkListPointers(t, l, [e1, e4, e3])
        l.moveToBack(e3) // should be no-op
        checkListPointers(t, l, [e1, e4, e3])

        e2 = l.insertBefore(2, e1)! // insert before front
        checkListPointers(t, l, [e2, e1, e4, e3])
        l.remove(e2)
        e2 = l.insertBefore(2, e4)! // insert before middle
        checkListPointers(t, l, [e1, e2, e4, e3])
        l.remove(e2)
        e2 = l.insertBefore(2, e3)! // insert before back
        checkListPointers(t, l, [e1, e4, e2, e3])
        l.remove(e2)

        e2 = l.insertAfter(2, e1)!// insert after front
        checkListPointers(t, l, [e1, e2, e4, e3])
        l.remove(e2)
        e2 = l.insertAfter(2, e4)! // insert after middle
        checkListPointers(t, l, [e1, e4, e2, e3])
        l.remove(e2)
        e2 = l.insertAfter(2, e3)!// insert after back
        checkListPointers(t, l, [e1, e4, e3, e2])
        l.remove(e2)

        // Check standard iteration.
        let sum = 0
        for (let e = l.front(); e != undefined; e = e.next()) {
            if (typeof e.data === "number") {
                sum += e.data
            }
        }
        assert.equal(sum, 4)

        // Clear all elements by iterating
        var next: ListElement<any> | undefined
        for (let e = l.front(); e != undefined; e = next) {
            next = e.next()
            l.remove(e)
        }
        checkListPointers(t, l, [])
    })
    QUnit.test('extending', (t) => {
        const l1 = new List<number>()
        const l2 = new List<number>()

        l1.pushBack(1)
        l1.pushBack(2)
        l1.pushBack(3)

        l2.pushBack(4)
        l2.pushBack(5)

        let l3 = new List<number>()
        l3.pushBackList(l1)
        checkList(t, l3, [1, 2, 3])
        l3.pushBackList(l2)
        checkList(t, l3, [1, 2, 3, 4, 5])

        l3 = new List<number>()
        l3.pushFrontList(l2)
        checkList(t, l3, [4, 5])
        l3.pushFrontList(l1)
        checkList(t, l3, [1, 2, 3, 4, 5])

        checkList(t, l1, [1, 2, 3])
        checkList(t, l2, [4, 5])

        l3 = new List<number>()
        l3.pushBackList(l1)
        checkList(t, l3, [1, 2, 3])
        l3.pushBackList(l3)
        checkList(t, l3, [1, 2, 3, 1, 2, 3])

        l3 = new List<number>()
        l3.pushFrontList(l1)
        checkList(t, l3, [1, 2, 3])
        l3.pushFrontList(l3)
        checkList(t, l3, [1, 2, 3, 1, 2, 3])

        l3 = new List<number>()
        l1.pushBackList(l3)
        checkList(t, l1, [1, 2, 3])
        l1.pushFrontList(l3)
        checkList(t, l1, [1, 2, 3])
    })
    QUnit.test('remove', (t) => {
        const l = new List<number>()
        const e1 = l.pushBack(1)
        const e2 = l.pushBack(2)
        checkListPointers(t, l, [e1, e2])
        const e = l.front()!
        assert.true(l.remove(e))
        checkListPointers(t, l, [e2])
        assert.false(l.remove(e))
        checkListPointers(t, l, [e2])
    })
    QUnit.test('goIssue4103', (t) => {
        const l1 = new List<number>()
        l1.pushBack(1)
        l1.pushBack(2)

        const l2 = new List<number>()
        l2.pushBack(3)
        l2.pushBack(4)

        const e = l1.front()!
        l2.remove(e) // l2 should not change because e is not an element of l2
        assert.equal(l2.length, 2)

        l1.insertBefore(8, e)
        assert.equal(l1.length, 3)
    })
    QUnit.test('goIssue6349', (t) => {
        const l = new List<number>()
        l.pushBack(1)
        l.pushBack(2)

        const e = l.front()!
        l.remove(e)
        assert.strictEqual(1, e.data)
        assert.strictEqual(e.next(), undefined)
        assert.strictEqual(e.prev(), undefined)

    })
    QUnit.test('move', (t) => {
        const l = new List<number>()
        let e1 = l.pushBack(1)
        let e2 = l.pushBack(2)
        let e3 = l.pushBack(3)
        let e4 = l.pushBack(4)

        l.moveAfter(e3, e3)
        checkListPointers(t, l, [e1, e2, e3, e4])
        l.moveBefore(e2, e2)
        checkListPointers(t, l, [e1, e2, e3, e4])

        l.moveAfter(e3, e2)
        checkListPointers(t, l, [e1, e2, e3, e4])
        l.moveBefore(e2, e3)
        checkListPointers(t, l, [e1, e2, e3, e4])

        l.moveBefore(e2, e4)
        checkListPointers(t, l, [e1, e3, e2, e4]);
        [e2, e3] = [e3, e2]

        l.moveBefore(e4, e1)
        checkListPointers(t, l, [e4, e1, e2, e3]);
        [e1, e2, e3, e4] = [e4, e1, e2, e3]

        l.moveAfter(e4, e1)
        checkListPointers(t, l, [e1, e4, e2, e3]);
        [e2, e3, e4] = [e4, e2, e3]

        l.moveAfter(e2, e3)
        checkListPointers(t, l, [e1, e3, e2, e4])
    })
    QUnit.test('zeroList', (t) => {
        const l1 = new List<number>()

        l1.pushFront(1)
        checkList(t, l1, [1])

        const l2 = new List<number>()
        l2.pushBack(1)
        checkList(t, l2, [1])

        const l3 = new List<number>()
        l3.pushFrontList(l1)
        checkList(t, l3, [1])

        const l4 = new List<number>()
        l4.pushBackList(l2)
        checkList(t, l4, [1])
    })
    QUnit.test('insertBeforeUnknownMark', (t) => {
        const l = new List<number>()
        l.pushBack(1)
        l.pushBack(2)
        l.pushBack(3)
        l.insertBefore(1, ListElement.make())
        checkList(t, l, [1, 2, 3])
    })
    QUnit.test('insertAfterUnknownMark', (t) => {
        const l = new List<number>()
        l.pushBack(1)
        l.pushBack(2)
        l.pushBack(3)
        l.insertAfter(1, ListElement.make())
        checkList(t, l, [1, 2, 3])
    })
    QUnit.test('moveUnknownMark', (t) => {
        const l1 = new List<number>()
        const e1 = l1.pushBack(1)

        const l2 = new List<number>()
        const e2 = l2.pushBack(2)

        l1.moveAfter(e1, e2)
        checkList(t, l1, [1])
        checkList(t, l2, [2])

        l1.moveBefore(e1, e2)
        checkList(t, l1, [1])
        checkList(t, l2, [2])
    })
})
