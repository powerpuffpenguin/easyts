

import { ValueCallback, Constructor } from "./types";
export interface GetIterator<T> {
    iterator(reverse?: boolean): Iterator<T>
}
/**
 * Add foreach method to GetIterator interface
 * 
 * ```
 * class X<T> {
 *  iterator(reverse?: boolean): Iterator<T>
 *  @methodForEach
 *  forEach(callback: ValueCallback<T>, reverse?: boolean): void
 * }
 * ```
 */
export function methodForEach<T>(prot: any, name: string, desc: PropertyDescriptor) {
    desc.value = function (callback: ValueCallback<T>, reverse: boolean) {
        const c: GetIterator<T> = (this as any)
        const it = c.iterator(reverse)
        const vals = {
            [Symbol.iterator]() {
                return it
            }
        }
        for (const v of vals) {
            callback(v)
        }
    }
}
interface C<T> {
    iterator(reverse?: boolean): Iterator<T>
}

class A<T> implements C<T> {
    iterator(reverse?: boolean): Iterator<T> {
        throw 1
    }
    forEach(callback: ValueCallback<T>, reverse?: boolean): void {
        throw 2
    }
}


class B<T> extends A<T>{
    id = 1
    static make() {
        return new B()
    }
    constructor() {
        super()
        classDecorator(B)

    }
    iterator(reverse?: boolean): Iterator<T> {
        let a: any = '123'
        return a
    }
}


function classDecorator<T extends C<any>>(c: Constructor<T>) {
    c.prototype.forEach = function (callback: ValueCallback<T>, reverse?: boolean | undefined) {
        console.log('foreach', this)
    }
}


// function classDecorator<T extends { new(...args: any[]): C<T> }>(constructor: T) {
//     return class extends constructor {
//         forEach(callback: ValueCallback<T>, reverse?: boolean | undefined): void {
//             console.log(this.iterator())
//         }
//     }
// }

class D<T> extends B<T>{
    constructor() {
        super()
    }
    forEach() {
        console.log("d")
    }
}
const b = B.make()
const c = B.make()
b.forEach(() => { })
b.id = 2
b.forEach(() => { })
c.forEach(() => { })

const d = new D<number>()
d.forEach()