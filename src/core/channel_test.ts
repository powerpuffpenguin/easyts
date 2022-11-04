import { Chan, selectChan } from "./channel"

QUnit.module('chan', hooks => {
    QUnit.test('no buffer', async (assert) => {
        const signals = assert.async(1)
        try {
            const ch = new Chan<number>()
            let flag = 0
            setTimeout(() => {
                assert.equal(flag, 1)
                flag = 2
                ch.write(1)
            }, 0)
            flag = 1
            assert.equal(flag, 1)
            const v = await ch.read()
            assert.equal(flag, 2)
            flag = 0;

            (async () => {
                assert.equal(flag, 0)
                flag = 1
                await ch.read()
            })()
            await ch.write(1)
            assert.equal(flag, 1)
            flag = 2

            // close
            flag = 0
            setTimeout(() => {
                assert.equal(flag, 0)
                flag = 1
                assert.true(ch.close())
            }, 0)
            await ch.read()
            assert.equal(flag, 1)
            flag = 2
            assert.false(ch.write(1))
        } finally {
            signals()
        }
    })

    QUnit.test('buffer', async (assert) => {
        const signals = assert.async(1)
        try {
            const ch = new Chan<number>(3)
            assert.true(ch.write(1))
            assert.true(ch.write(2))
            assert.true(ch.write(10))

            let flag = 0;
            let p: Promise<IteratorResult<number>> | undefined
            (() => {
                assert.equal(flag, 0)
                flag = 1
                let a: IteratorResult<number> = ch.read() as any
                assert.equal(a.value, 1)
                a = ch.read() as any
                assert.equal(a.value, 2)
                a = ch.read() as any
                assert.equal(a.value, 10)

                p = ch.read() as any
            })()
            await ch.write(3)
            assert.equal(flag, 1)
            flag = 2
            const val = await p
            assert.equal(val?.value, 3)

            assert.true(ch.write(100))
            assert.true(ch.write(200))
            let a: IteratorResult<number> = ch.read() as any
            assert.equal(a.value, 100)
            assert.true(ch.write(300))
            a = ch.read() as any
            assert.equal(a.value, 200)

            assert.true(ch.close())
            assert.false(ch.write(1))

            a = ch.read() as any
            assert.equal(a.value, 300)
            a = ch.read() as any
            assert.true(a.done)
        } finally {
            signals()
        }
    })

    QUnit.test('select', async (assert) => {
        const signals = assert.async(1)
        try {
            const ch0 = new Chan<number>()
            const ch1 = new Chan<number>()
            let r0 = ch0.readCase()
            assert.strictEqual(undefined, selectChan(r0, undefined))
            let w1 = ch1.writeCase(1)
            setTimeout(() => {
                assert.true(ch0.write(12))
            }, 0)
            assert.strictEqual(await selectChan(r0, w1), r0)
            assert.strictEqual(r0.read().value, 12)

            setTimeout(() => {
                ch1.close()
            }, 0)
            assert.strictEqual(await selectChan(w1), w1)
            assert.false(w1.write())
        } finally {
            signals()
        }
    })
    QUnit.test('rw', async (assert) => {
        const signals = assert.async(1)
        assert.true(true)
        try {
            const ch0 = new Chan<number>()
            let r0 = ch0.readCase()
            let w0 = ch0.writeCase(1)
            setTimeout(() => {
                assert.equal((ch0.read() as IteratorResult<any>).value, 1)
            }, 0)
            assert.equal(w0, await selectChan(r0, w0))
            assert.true(w0.write())

            setTimeout(() => {
                assert.true(ch0.write(100))
            }, 0)
            assert.equal(r0, await selectChan(r0, w0))
            assert.equal(r0.read().value, 100)

            assert.false(ch0.isClosed)
            assert.true(ch0.close())
            assert.true(ch0.isClosed)
            assert.false(ch0.close())
            let flag = 0x0
            while (flag != 3) {
                const s = selectChan(r0, w0)
                if (s == r0) {
                    flag |= 0x1
                    assert.true(s.read().done)
                } else if (s == w0) {
                    flag |= 0x2
                    assert.false(s.write())
                }
            }
        } finally {
            signals()
        }
    })
})

