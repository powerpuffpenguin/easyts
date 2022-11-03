import { makeSlot, Signals } from './signals'
import { FilterCombiner, SumCombiner } from './signals_combiners'
QUnit.module('signals', hooks => {
    QUnit.test('signals', assert => {
        const signals = new Signals<number, void>()
        signals.signal(1)
        assert.equal(0, signals.length)
        let flag = 0
        signals.connect(makeSlot((v) => {
            flag += 1
        }), 1)
        assert.equal(1, signals.length)
        const c10 = signals.connect(makeSlot((v) => {
            flag += 10
        }), 10)
        const s100 = makeSlot((v) => {
            flag += 100
        })
        signals.connect(s100, 100)
        // tag 1 10 100
        assert.equal(3, signals.length)
        signals.signal(1)
        assert.equal(flag, 1 + 10 + 100)

        c10.disconnect()
        // tag 1 100
        flag = 0
        signals.signal(2)
        assert.equal(flag, 1 + 100)


        flag = 0
        signals.connect(s100)
        // tag 1 100 undefined
        signals.signal(2)
        assert.equal(flag, 1 + 100 * 2)

        signals.disconnectSlot(s100)
        // tag 1
        flag = 0
        signals.signal(2)
        assert.equal(flag, 1)

        signals.connect(makeSlot((v) => {
            flag += 10
        }), 1)
        // tag 1*2
        flag = 0
        signals.signal(2)
        assert.equal(flag, 1 + 10)

        signals.connect(makeSlot((v) => {
            flag += 100
        }))
        // tag 1*2 undefined
        flag = 0
        signals.signal(4)
        assert.equal(flag, 1 + 10 + 100)

        signals.disconnectTag('1')
        // tag 1*2 undefined
        flag = 0
        signals.signal(4)
        assert.equal(flag, 1 + 10 + 100)

        signals.disconnectTag(1)
        //  tag 1 * 2 undefined
        flag = 0
        signals.signal(4)
        assert.equal(flag, 100)
    })
    QUnit.test('combiner', assert => {
        const combiner = new SumCombiner()
        const signals = new Signals<number, number>(combiner)
        signals.connectSlot((val) => val)
        signals.connectSlot((val) => val * 10)
        signals.connectSlot((val) => val * 100)
        signals.signal(5)
        assert.equal(combiner.value, 555)
        signals.signal(-3)
        assert.equal(combiner.value, -333)

        signals.reset()
        assert.equal(0, signals.length)

        signals.connectSlot((val) => {
            assert.equal(4, val)
            return val
        })
        signals.connectSlot((val) => {
            assert.equal(16, val)
            return val
        })
        signals.connectSlot((val) => {
            // never execute
            assert.true(false)
            return val
        })
        signals.signal(2, new FilterCombiner<number>((v) => {
            v.value *= v.value
            v.next = v.value < 16
        }))
    })
})
