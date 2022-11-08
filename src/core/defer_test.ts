import { Defer, DeferException } from "./defer"

QUnit.module('defer', hooks => {
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
        try {
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
        } catch (e) {
            assert.true(e instanceof DeferException && e.as(DeferException) ? true : false)
        }
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
            try {
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
            } catch (e) {
                assert.true(e instanceof DeferException && e.as(DeferException) ? true : false)
            }
            assert.equal(flag, 6)
            assert.equal(num, 6)
        })
    })
})