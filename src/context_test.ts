import { background, errCanceled, errDeadlineExceeded } from "./context";
import { Chan } from "./core/channel";
import { sleep } from "./time";

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
        assert.true(c0.get(k1).done)

        assert.equal(c1.get(k1).value, 1)

        assert.equal(c2.get(k1).value, 1)
        assert.equal(c2.get(k2).value, 2)

        assert.equal(c3.get(k1).value, 3)
        assert.equal(c3.get(k2).value, 2)
    })
    QUnit.test('cancel', (assert) => {
        const c0 = background().withCancel()
        const c1 = c0.withCancel()
        assert.strictEqual(c0.err, undefined)
        assert.strictEqual(c1.err, undefined)

        c1.cancel()
        assert.strictEqual(c0.err, undefined)
        assert.strictEqual(c1.err, errCanceled)

        assert.false(c0.done.isClosed)
        assert.true(c1.done.isClosed)

        const c2 = c1.withCancel()
        assert.true(c2.done.isClosed)
        assert.strictEqual(c2.err, errCanceled)

        const c3 = c0.withCancel()
        assert.false(c3.done.isClosed)
        const done = c3.done
        assert.false(done.isClosed)
        c0.cancel()
        assert.strictEqual(c3.done, done)
        assert.true(c0.done.isClosed)
        assert.true(c3.done.isClosed)
        assert.strictEqual(c0.err, errCanceled)
        assert.strictEqual(c3.err, errCanceled)

    })
    QUnit.test('cancel reason', (assert) => {
        {
            const c0 = background().withCancel()
            const c1 = c0.withTimeout(1)
            c1.cancel(456)
            c0.cancel(123)
            assert.equal(c0.err, 123)
            assert.equal(c1.err, 456)
        }
        {
            const c0 = background().withCancel()
            const c1 = c0.withTimeout(1)
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
            assert.strictEqual(c1.err, errDeadlineExceeded)

            const c2 = c1.withTimeout(1)
            assert.strictEqual(c2.err, errDeadlineExceeded)

            const c3 = c0.withTimeout(1)
            assert.strictEqual(c3.err, undefined)
            assert.false(c3.done.isClosed)
            await sleep(5)
            assert.strictEqual(c3.err, errDeadlineExceeded)
            assert.true(c3.done.isClosed)

            const c4 = c0.withTimeout(1)
            assert.strictEqual(c0.err, undefined)
            assert.false(c0.done.isClosed)
            assert.strictEqual(c4.err, undefined)
            assert.false(c4.done.isClosed)
            c0.cancel()
            assert.strictEqual(c4.err, errCanceled)
            assert.true(c4.done.isClosed)
            assert.strictEqual(c0.err, errCanceled)
            assert.true(c0.done.isClosed)

        } finally {
            s()
        }
    })
})