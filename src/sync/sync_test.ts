import { Completer } from "../core";
import { Once } from "./once";
import { WaitGroup } from "./waitgroup";
import { errMutexUnlock, Mutex } from "./mutex";
import { errRWMutexRUnlock, RWMutex } from "./rwmutex";
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
            console.log("call unlock")
            m.unlock()
            assert.throws(() => m.unlock(), errMutexUnlock)
        } finally {
            signals()
        }
    })
    QUnit.test('RWMutex', async (assert) => {
        const signals = assert.async(1)
        try {
            const m = new RWMutex()
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
            assert.throws(() => m.unlock(), errMutexUnlock)
        } finally {
            signals()
        }
    })

    QUnit.test('RWMutex 2', async (assert) => {
        const signals = assert.async(1)
        try {
            const m = new RWMutex()
            assert.true(m.tryReadLock())
            assert.true(m.tryReadLock())
            assert.false(m.tryLock())
            m.readUnlock()
            assert.false(m.tryLock())
            m.readUnlock()

            assert.true(m.tryLock())
            assert.false(m.tryReadLock())
            let flag = 0
            m.readLock()!.then((l) => {
                flag += 1
                l.readUnlock()
            })
            m.readLock()!.then((l) => {
                flag += 2
                l.readUnlock()
            })
            await Promise.resolve(0)
            assert.equal(flag, 0)
            m.unlock()
            await Promise.resolve(0)
            await m.lock()
            assert.equal(flag, 3)
            flag = 10

            assert.throws(() => m.readUnlock(), errRWMutexRUnlock)

            m.unlock()

            assert.throws(() => m.unlock(), errMutexUnlock)

        } finally {
            signals()
        }
    })
})
