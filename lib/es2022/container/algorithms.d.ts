import { ExpandIterator } from './types';
/**
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
export declare function after<T>(position: ExpandIterator<T>, begin: ExpandIterator<T>, end?: ExpandIterator<T>): void;
/**
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 * {@link errBadAdd}
 */
export declare function before<T>(position: ExpandIterator<T>, begin: ExpandIterator<T>, end?: ExpandIterator<T>): void;
/**
 * Call the callback in turn for each data in the container
 *
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 */
export declare function forEach<T>(callback: (data: T) => void, begin: ExpandIterator<T>, end?: ExpandIterator<T>): void;
/**
 * convert iterator to array
 * @throws
 * {@link errRangeNotMatched}
 * {@link errIteratorInvalid}
 * {@link errBadRange}
 */
export declare function map<T, To>(callback: (data: T) => To, begin: ExpandIterator<T>, end?: ExpandIterator<T>): Array<To>;
