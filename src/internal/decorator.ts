

import { ValueCallback, Constructor, ValidCallback, CompareCallback, compare, MapCallback } from "../types";
export interface ForEach<T> {
    iterator(reverse?: boolean): Iterator<T>
    readonly length: number
}
function notImplement(c: string, f: string) {
    return `class "${c}" not implemented function "${f}"`
}
export class ClassForEach<T> implements ForEach<T> {

    private __name__: string;
    constructor() {
        this.__name__ = new.target.name
    }
    /**
     * @virtual
     */
    iterator(reverse?: boolean): Iterator<T> {
        throw new EvalError(notImplement(this.__name__,
            "iterator(reverse?: boolean): Iterator<T>"
        ))
    }
    /**
     * @virtual
     */
    get length(): number {
        throw new EvalError(notImplement(this.__name__,
            "get length(): number"
        ))
    }
    /**
     * call callback on each element in the container in turn
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     * 
     * @virtual
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void {
        throw new EvalError(notImplement(this.__name__,
            "forEach(callback: ValueCallback<T>, reverse?: boolean): void"
        ))
    }
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     * 
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     * 
     * @virtual
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean {
        throw new EvalError(notImplement(this.__name__,
            "find(callback: ValidCallback<T>, reverse?: boolean): boolean"
        ))
    }
    /**
     * Returns whether the data data exists in the container
     * 
     * @virtual
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean {
        throw new EvalError(notImplement(this.__name__,
            "has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean"
        ))
    }
    /**
     * Convert container to array
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     * 
     * @virtual
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO> {
        throw new EvalError(notImplement(this.__name__,
            "map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>"
        ))
    }
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     * @param callback 
     * @param reverse If true, traverse the container in reverse order
     */
    join<TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string {
        throw new EvalError(notImplement(this.__name__,
            "join<TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string"
        ))
    }
}
export function classForEach<T extends ForEach<any>>(c: Constructor<T>) {
    c.prototype.forEach = function (callback: ValueCallback<T>, reverse?: boolean | undefined) {
        const self = (this as ForEach<T>);
        if (self.length < 1) {
            return
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse) } }
        for (const v of vals) {
            callback(v)
        }
    }
    c.prototype.find = function (callback: ValidCallback<T>, reverse?: boolean): boolean {
        const self = (this as ForEach<T>);
        if (self.length < 1) {
            return false
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse) } }
        for (const v of vals) {
            if (callback(v)) {
                return true
            }
        }
        return false
    }
    c.prototype.has = function (data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean {
        const self = (this as ForEach<T>);
        if (self.length < 1) {
            return false
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse) } }
        for (const v of vals) {
            if (compare(data, v, callback) == 0) {
                return true
            }
        }
        return false
    }
    c.prototype.map = function <TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO> {
        const self = (this as ForEach<T>);
        if (self.length < 1) {
            return []
        }
        const vals = { [Symbol.iterator]() { return self.iterator(reverse) } }
        const result = new Array<TO>(self.length)
        let i = 0
        for (const v of vals) {
            result[i++] = callback(v)
        }
        return result
    }
    c.prototype.join = function <TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string {
        const c = callback ?? ((v: any) => `${v}`)
        return (this as any).map(c, reverse).join(separator)
    }
}

