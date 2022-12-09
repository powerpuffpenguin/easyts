import { ValueCallback, Constructor, ValidCallback, CompareCallback, MapCallback } from "../types";
export interface ForEach<T> {
    iterator(reverse?: boolean): Iterator<T>;
    readonly length: number;
}
export declare function notImplement(c: string, f: string): string;
export declare class ClassForEach<T> implements ForEach<T> {
    /**
     * @virtual
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * @virtual
     */
    get length(): number;
    /**
     * call callback on each element in the container in turn
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    forEach(callback: ValueCallback<T>, reverse?: boolean): void;
    /**
     * Traverse the container looking for elements until the callback returns true, then stop looking
     *
     * @param callback Determine whether it is the element to be found
     * @param reverse If true, traverse the container in reverse order
     * @returns whether the element was found
     *
     * @virtual
     */
    find(callback: ValidCallback<T>, reverse?: boolean): boolean;
    /**
     * Returns whether the data data exists in the container
     *
     * @virtual
     */
    has(data: T, reverse?: boolean, callback?: CompareCallback<T>): boolean;
    /**
     * Convert container to array
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     *
     * @virtual
     */
    map<TO>(callback: MapCallback<T, TO>, reverse?: boolean): Array<TO>;
    /**
     * Adds all the elements of an container into a string, separated by the specified separator string.
     * @param separator A string used to separate one element of the container from the next in the resulting string. If omitted, the array elements are separated with a comma.
     * @param callback
     * @param reverse If true, traverse the container in reverse order
     */
    join<TO>(separator?: string, callback?: MapCallback<T, TO>, reverse?: boolean): string;
}
export declare function classForEach<T extends ForEach<any>>(c: Constructor<T>): void;
