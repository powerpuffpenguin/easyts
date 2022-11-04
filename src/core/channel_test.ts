import { Chan } from "./channel"

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
})