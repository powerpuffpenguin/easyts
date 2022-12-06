import { Chan, ReadReturn, selectChan } from "./channel"

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
            let p: ReadReturn<number>
            (() => {
                assert.equal(flag, 0)
                flag = 1
                let a = ch.read()
                assert.equal(a, 1)
                a = ch.read()
                assert.equal(a, 2)
                a = ch.read()
                assert.equal(a, 10)

                p = ch.read()
            })()
            await ch.write(3)
            assert.equal(flag, 1)
            flag = 2
            const val = await p
            assert.equal(val, 3)

            assert.true(ch.write(100))
            assert.true(ch.write(200))
            let a = ch.read()
            assert.equal(a, 100)
            assert.true(ch.write(300))
            a = ch.read()
            assert.equal(a, 200)

            assert.true(ch.close())
            assert.false(ch.write(1))

            a = ch.read()
            assert.equal(a, 300)
            const [no, ok] = ch.readRaw() as any
            assert.false(ok)
            assert.equal(no, undefined)
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
            assert.strictEqual(undefined, selectChan(undefined, r0))
            let w1 = ch1.writeCase(1)
            setTimeout(() => {
                assert.true(ch0.write(12))
            }, 0)
            assert.strictEqual(await selectChan(r0, w1), r0)
            assert.strictEqual(r0.read(), 12)

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
        try {
            const ch0 = new Chan<number>()
            let r0 = ch0.readCase()
            let w0 = ch0.writeCase(1)
            setTimeout(() => {
                assert.equal(ch0.read(), 1)
            }, 0)
            assert.equal(w0, await selectChan(r0, w0))
            assert.true(w0.write())

            setTimeout(() => {
                assert.true(ch0.write(100))
            }, 0)
            assert.equal(r0, await selectChan(r0, w0))
            assert.equal(r0.read(), 100)

            assert.false(ch0.isClosed)
            assert.true(ch0.close())
            assert.true(ch0.isClosed)
            assert.false(ch0.close())
            let flag = 0x0
            while (flag != 3) {
                const s = selectChan(r0, w0)
                if (s == r0) {
                    flag |= 0x1
                    const [_, ok] = s.readRaw()
                    assert.false(ok)
                    assert.equal(r0.read(), undefined)
                } else if (s == w0) {
                    flag |= 0x2
                    assert.false(s.write())
                }
            }
        } finally {
            signals()
        }
    })
    QUnit.test('asyncIterator', async (assert) => {
        const signals = assert.async(1)
        try {
            let c0 = new Chan<number>()
            setTimeout(async () => {
                for (let i = 0; i < 3; i++) {
                    await c0.write(i + 1)
                }
                c0.close()
            }, 0)
            let sum = 0
            for await (const v of c0) {
                sum += v
            }
            assert.equal(sum, 1 + 2 + 3)

            c0 = new Chan<number>(2)
            setTimeout(async () => {
                for (let i = 0; i < 3; i++) {
                    await c0.write(i + 1)
                }
                c0.close()
            }, 0)
            sum = 0
            for await (const v of c0) {
                sum += v
            }
            assert.equal(sum, 1 + 2 + 3)
        } finally {
            signals()
        }
    })
})

