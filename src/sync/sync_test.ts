import { Completer } from "../core";
import { Once } from "./once";
import { WaitGroup } from "./waitgroup";
import { Mutex } from "./mutex";
QUnit.module('sync', hooks => {
    QUnit.test('Once', async (assert) => {
        const o = new Once()
        let sum = 0
        for (let i = 0; i < 10; i++) {
            o.do(() => {
                sum++
            })
        }
        assert.equal(sum, 1)
    })
    QUnit.test('WaitGroup', async (assert) => {
        const signals = assert.async(1)
        try {
            const w = new WaitGroup()
            assert.throws(() => { w.done() })
            assert.true(undefined === w.wait())
            const p0 = w.add(1)
            assert.false(undefined === w.wait())
            w.done()
            assert.true(undefined === w.wait())
            await p0

            w.do(() => { })
            assert.true(undefined === w.wait())
            const c = new Completer()
            w.do(() => {
                return c.promise
            })
            const p1 = w.wait()
            assert.false(undefined === p1)
            assert.notEqual(p0, p1)
            const p2 = w.wait()
            assert.equal(p1, p2)
            let flag = 0
            setTimeout(() => {
                assert.equal(flag, 0)
                flag = 1
                c.resolve()
            }, 1)
            await p1
            assert.equal(flag, 1)
            flag = 2

        } finally {
            signals()
        }
    })
    QUnit.test('Mutex', async (assert) => {
        const signals = assert.async(1)
        try {
            const m = new Mutex()
            assert.true(m.tryLock())
            assert.false(m.tryLock())

            let flag = 0
            setTimeout(() => {
                assert.equal(flag, 0)
                flag = 1
                m.unlock()
            }, 1)
            await m.lock()
            assert.equal(flag, 1)
            flag = 2

            assert.false(m.tryLock())
            m.unlock()
            assert.throws(() => {
                m.unlock()
            })
        } finally {
            signals()
        }
    })
})