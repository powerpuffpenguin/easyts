
import { Heap, heapify, pop, push, remove } from "./heap";
function random(count: number, max = 10000): Array<number> {
    const arrs = new Array<number>(count)
    for (let i = 0; i < count; i++) {
        arrs[i] = Math.floor(Math.random() * max)
    }
    return arrs
}
function checkHeap(assert: Assert, h: Array<number>, less: boolean, cf?: (l: number, r: number) => number) {
    let max = -1
    let i = 0
    while (h.length != 0) {
        const v = pop(h, cf)
        if (max == -1) {
            max = v
            continue
        }

        if (less) {
            assert.true(max <= v)
            max = v
        } else {
            assert.true(max >= v, `max=${max},v=${v},i=${i}`)
            max = v
        }
        // console.log(`get(${i}) = ${v}`)
    }

    h = random(100)
}
QUnit.module('container.heap', hooks => {
    QUnit.test('func', async (assert) => {
        let h = random(100)
        heapify(h)
        checkHeap(assert, h, true)

        for (let i = 0; i < 3; i++) {
            random(100)
            for (const v of random(100)) {
                push(h, v)
            }
            const count = Math.floor(Math.random() * 10)
            for (let j = 0; j < count; j++) {
                remove(h, Math.floor(Math.random() * h.length))
            }

            checkHeap(assert, h, true)
        }
    })
    QUnit.test('class', async (assert) => {
        const h = new Heap<number>()
        h.pushList(random(100))
        checkHeap(assert, h.map((v) => v), true)

        for (let i = 0; i < 3; i++) {
            h.push(...random(100))

            const count = Math.floor(Math.random() * 10)
            for (let j = 0; j < count; j++) {
                h.remove(Math.floor(Math.random() * h.length))
            }

            checkHeap(assert, h.map((v) => v), true)
        }
    })
    QUnit.test('max', async (assert) => {
        const cf = (l: number, r: number) => r - l
        const h = new Heap<number>({
            compare: cf
        })
        const v = [
            6247, 2823, 7701,
            3833, 7142, 2041,
            3831, 3796, 564,
            7575
        ]
        h.pushList(random(100))
        checkHeap(assert, h.map((v) => v), false, (l, r) => r - l)

        for (let i = 0; i < 3; i++) {
            h.clear()
            h.push(...random(100))

            const count = Math.floor(Math.random() * 10)
            for (let j = 0; j < count; j++) {
                h.remove(Math.floor(Math.random() * h.length))
            }

            checkHeap(assert, h.map((v) => v), false, cf)
        }
    })
})
