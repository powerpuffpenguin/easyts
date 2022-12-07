import { Exception, isError } from './exception'
import { IdentityException } from "./internal/identity";

class ClassA extends Exception {
    static __classid__ = -1
    static __classname__ = 'classA'
    constructor() {
        super()
    }
    get a(): string {
        return 'abc'
    }
}

QUnit.module('exception', hooks => {
    QUnit.test('Exception', assert => {
        const e = new Exception("abc")
        assert.true(e instanceof Exception)
        assert.true(e instanceof Error)

        assert.equal(e.name, 'Exception')
        assert.equal(e.classid, IdentityException.id)
        assert.equal(e.classname, IdentityException.name)

        const a = new ClassA()
        assert.true(a instanceof Exception)
        assert.true(a instanceof ClassA)
        assert.true(a instanceof Error)

        assert.equal(a.name, 'ClassA')
        assert.equal(a.classid, -1)
        assert.equal(a.classname, 'classA')

        assert.true(isError(e, Exception))
        assert.false(isError(e, ClassA))

        assert.false(isError(a, Exception))
        assert.true(isError(a, ClassA))

    })
})