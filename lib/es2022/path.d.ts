/**
 * Join joins any number of path elements into a single path,  separating them with slashes. Empty elements are ignored. The result is Cleaned. However, if the argument list is  empty or all its elements are empty, Join returns an empty string.
 */
export declare function join(...elem: Array<string>): string;
/**
 * returns the shortest path name equivalent to path  by purely lexical processing.
 */
export declare function clean(path: string): string;
/**
 * returns the file name extension used by path
 */
export declare function ext(path: string): string;
/**
 * returns the last element of path. Trailing slashes are removed before extracting the last element.
 * @returns If the path is empty, Base returns ".". If the path consists entirely of slashes, Base returns "/".
 */
export declare function base(path: string): string;
/**
 * splits path immediately following the final slash, separating it into a directory and file name component.  If there is no slash in path, Split returns an empty dir and file set to path.
 * @returns [dir,file] The returned values have the property that path = dir+file.
 */
export declare function split(path: string): Array<string>;
/**
 * returns all but the last element of path, typically the path's directory.
 *
 * @remarks
 * After dropping the final element using Split, the path is Cleaned and trailing slashes are removed.
 * If the path is empty, Dir returns ".".
 * If the path consists entirely of slashes followed by non-slash bytes, Dir returns a single slash. In any other case, the returned path does not end in a slash.
 */
export declare function dir(path: string): string;
/**
 * reports whether the path is absolute.
 */
export declare function isAbs(path: string): boolean;
