import { sleep, Timer } from "./time";
QUnit.module('time', hooks => {
    QUnit.test('sleep', async (assert) => {
        const signals = assert.async(1)
        try {
            let flag = 0
            sleep(10).then(() => {
                assert.equal(flag, 1)
                flag = 2
            })
            assert.equal(flag, 0)
            flag = 1
            assert.equal(flag, 1)

            await sleep(20)
            assert.equal(flag, 2)
            flag = 3
        } finally {
            signals()
        }
    })
    QUnit.test('timer', async (assert) => {
        const signals = assert.async(1)
        try {
            let flag = 0
            const t = new Timer(10)
            Promise.resolve().then(() => {
                assert.equal(flag, 0)
                flag = 1
            })
            t.reset(1)
            await t.c.read()
            assert.equal(flag, 1)
            flag = 2
            assert.strictEqual(t.c.tryRead(), undefined)

            t.reset(1)
            assert.true(t.stop())
            await sleep(2)
            assert.strictEqual(t.c.tryRead(), undefined)

            t.reset(1)
            await sleep(2)
            assert.false(t.stop())
            const v = t.c.tryRead()
            assert.true(v?.value ? true : false)
            assert.false(v?.done ?? false)
        } finally {
            signals()
        }
    })
})