import { background } from "./context";
import { Chan } from "../channel";
import { sleep } from "../time/time";

QUnit.module('context', hooks => {
    QUnit.test('empty', (assert) => {
        const ctx = background()
        assert.equal(ctx.done, Chan.never)
        assert.equal(ctx.deadline, undefined)
    })
    QUnit.test('value', (assert) => {
        const c0 = background()
        class k1 { }
        class k2 { }
        const c1 = c0.withValue(k1, 1)
        const c2 = c1.withValue(k2, 2)
        const c3 = c2.withValue(k1, 3)
        assert.equal(c0.get(k1), undefined)
        assert.equal(c0.getRaw(k1)[1], false)

        assert.equal(c1.get(k1), 1)
        assert.equal(c1.getRaw(k1)[0], 1)
        assert.equal(c1.getRaw(k1)[1], true)

        assert.equal(c2.get(k1), 1)
        assert.equal(c2.get(k2), 2)

        assert.equal(c3.get(k1), 3)
        assert.equal(c3.get(k2), 2)
    })
    QUnit.test('cancel', (assert) => {
        const c0 = background().withCancel()
        const c1 = c0.withCancel()
        assert.strictEqual(c0.err, undefined)
        assert.strictEqual(c1.err, undefined)

        c1.cancel()
        assert.strictEqual(c0.err, undefined)
        assert.strictEqual(c1.err?.canceled, true)

        assert.false(c0.done.isClosed)
        assert.true(c1.done.isClosed)

        const c2 = c1.withCancel()
        assert.true(c2.done.isClosed)
        assert.strictEqual(c2.err?.canceled, true)

        const c3 = c0.withCancel()
        assert.false(c3.done.isClosed)
        const done = c3.done
        assert.false(done.isClosed)
        c0.cancel()
        assert.strictEqual(c3.done, done)
        assert.true(c0.done.isClosed)
        assert.true(c3.done.isClosed)
        assert.strictEqual(c0.err?.canceled, true)
        assert.strictEqual(c3.err?.canceled, true)

    })
    QUnit.test('cancel reason', (assert) => {
        {
            const c0 = background().withCancel()
            const c1 = c0.withTimeout(5)
            c1.cancel(456)
            c0.cancel(123)
            assert.equal(c0.err, 123)
            assert.equal(c1.err, 456)
        }
        {
            const c0 = background().withCancel()
            const c1 = c0.withTimeout(5)
            c0.cancel(123)
            c1.cancel(456)
            assert.equal(c0.err, 123)
            assert.equal(c1.err, 123)
        }
    })
    QUnit.test('timeout', async (assert) => {
        const s = assert.async(1)
        try {
            const c0 = background().withCancel()

            const c1 = c0.withTimeout(-1)
            assert.true(c1.done.isClosed)
            assert.strictEqual(c1.err?.timeout, true)

            const c2 = c1.withTimeout(1)
            assert.strictEqual(c2.err?.timeout, true)

            const c3 = c0.withTimeout(5)
            assert.strictEqual(c3.err, undefined)
            assert.false(c3.done.isClosed)
            await sleep(8)
            assert.strictEqual(c3.err?.timeout, true)
            assert.true(c3.done.isClosed)

            const c4 = c0.withTimeout(5)
            assert.strictEqual(c0.err, undefined)
            assert.false(c0.done.isClosed)
            assert.strictEqual(c4.err, undefined)
            assert.false(c4.done.isClosed)
            c0.cancel()
            assert.strictEqual(c4.err?.canceled, true)
            assert.true(c4.done.isClosed)
            assert.strictEqual(c0.err?.canceled, true)
            assert.true(c0.done.isClosed)

        } finally {
            s()
        }
    })
})
