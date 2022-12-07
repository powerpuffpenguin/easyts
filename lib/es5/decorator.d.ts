export interface GetIterator<T> {
    iterator(reverse?: boolean): Iterator<T>;
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
export declare function methodForEach<T>(prot: any, name: string, desc: PropertyDescriptor): void;
