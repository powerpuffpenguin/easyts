import { Defer } from "./defer"
import { defaultLogger } from "./log/logger"

QUnit.module('defer', hooks => {
    QUnit.test('disbale log', (assert) => {
        defaultLogger.opts.enable = false
        assert.true(true)
    })
    QUnit.test('sync', async (assert) => {
        let flag = 0
        const result = Defer.sync((d) => {
            assert.equal(flag, 0)
            flag = 1
            d.defer(() => {
                assert.equal(flag, 5)
                flag = 6
            })

            assert.equal(flag, 1)
            flag = 2
            d.defer(() => {
                assert.equal(flag, 4)
                flag = 5
            })

            assert.equal(flag, 2)
            flag = 3
            d.defer(() => {
                assert.equal(flag, 3)
                flag = 4
            })
            return flag
        })
        assert.equal(result, 3)
        assert.equal(flag, 6)
    })
    QUnit.test('sync throw', async (assert) => {
        let flag = 0
        let num = 0

        const result = Defer.sync((d) => {
            assert.equal(flag, 0)
            flag = 1
            d.defer(() => {
                num += 3
                assert.equal(flag, 5)
                flag = 6
            })

            assert.equal(flag, 1)
            flag = 2
            d.defer(() => {
                num += 2
                assert.equal(flag, 4)
                flag = 5
                throw new Error("test")
                num += 10
            })

            assert.equal(flag, 2)
            flag = 3
            d.defer(() => {
                num += 1
                assert.equal(flag, 3)
                flag = 4
            })
            return flag
        })
        assert.equal(result, 3)

        assert.equal(flag, 6)
        assert.equal(num, 6)
    })

    QUnit.test('async', async (assert) => {
        Defer.async(async (d) => {
            d.defer(assert.async(1))

            let flag = 0
            const result = Defer.sync((d) => {
                assert.equal(flag, 0)
                flag = 1
                d.defer(() => {
                    assert.equal(flag, 5)
                    flag = 6
                })

                assert.equal(flag, 1)
                flag = 2
                d.defer(() => {
                    assert.equal(flag, 4)
                    flag = 5
                })

                assert.equal(flag, 2)
                flag = 3
                d.defer(() => {
                    assert.equal(flag, 3)
                    flag = 4
                })
                return flag
            })
            assert.equal(result, 3)
            assert.equal(flag, 6)

        })
    })
    QUnit.test('async2', async (assert) => {
        Defer.async(async (d) => {
            d.defer(assert.async(1))

            let flag = 0
            const result = await Defer.async(async (d) => {
                assert.equal(flag, 0)
                flag = 1
                d.defer(async () => {
                    assert.equal(flag, 5)
                    flag = 6
                })

                assert.equal(flag, 1)
                flag = 2
                d.defer(async () => {
                    assert.equal(flag, 4)
                    flag = 5
                })

                assert.equal(flag, 2)
                flag = 3
                d.defer(() => {
                    assert.equal(flag, 3)
                    return new Promise<void>((resolve) => {

                        resolve()
                    }).then(() => {
                        flag = 4
                    })
                })
                return flag
            })
            assert.equal(result, 3)
            assert.equal(flag, 6)
        })
    })
    QUnit.test('async throw', async (assert) => {
        Defer.async(async (d) => {
            d.defer(assert.async(1))

            let flag = 0
            let num = 0

            const result = await Defer.async(async (d) => {
                assert.equal(flag, 0)
                flag = 1
                d.defer(async () => {
                    num += 3
                    assert.equal(flag, 5)
                    flag = 6
                })

                assert.equal(flag, 1)
                flag = 2
                d.defer(async () => {
                    num += 2
                    assert.equal(flag, 4)
                    flag = 5
                    throw new Error("123")
                    num += 10
                })

                assert.equal(flag, 2)
                flag = 3
                d.defer(() => {
                    num += 1
                    assert.equal(flag, 3)
                    return new Promise<void>((resolve) => {

                        resolve()
                    }).then(() => {
                        flag = 4
                    })
                })
                return flag
            })
            assert.equal(result, 3)

            assert.equal(flag, 6)
            assert.equal(num, 6)
        })
    })
    QUnit.test('defer sync try', async (assert) => {
        let v = 0
        try {
            Defer.sync((d) => {
                assert.equal(v, 0)
                v = 1
                d.defer(() => {
                    assert.equal(v, 1)
                    v = 2
                })
                throw 123
            })
        } catch (e) {
            assert.equal(e, 123)
        }
        assert.equal(v, 2)
    })
    QUnit.test('defer async try', async (assert) => {
        let v = 0
        try {
            await Defer.async(async (d) => {
                assert.equal(v, 0)
                v = 1
                d.defer(() => {
                    assert.equal(v, 1)
                    v = 2
                })
                throw 123
            })
        } catch (e) {
            assert.equal(e, 123)
        }
        assert.equal(v, 2)
    })
    QUnit.test('enable log', (assert) => {
        defaultLogger.opts.enable = true
        assert.true(true)
    })
})