import { Exception } from "../../core";
import { CompareCallback } from "../../core/types";
export declare class InvalidHostException extends Exception {
    private constructor();
}
export declare class EscapeException extends Exception {
    private constructor();
}
/**
 * escapes the string so it can be safely placed inside a URL query.
 */
export declare function queryEscape(s: string): string;
/**
 * escapes the string so it can be safely placed inside a URL path segment, replacing special characters (including /) with %XX sequences as needed.
 */
export declare function pathEscape(s: string): string;
/**
 * QueryUnescape does the inverse transformation of QueryEscape, converting each 3-byte encoded substring of the form "%AB" into the hex-decoded byte 0xAB.
 *
 * It throw an error if any % is not followed by two hexadecimal digits.
 *
 * @throws {@link EscapeException}
 */
export declare function queryUnescape(s: string): string;
/**
 * pathUnescape does the inverse transformation of pathEscape, converting each 3-byte encoded substring of the form "%AB" into the  hex-decoded byte 0xAB. It throw an error if any % is not followed  by two hexadecimal digits.
 *
 * pathUnescape is identical to queryUnescape except that it does not  unescape '+' to ' ' (space).
 *
 * @throws {@link EscapeException}
 */
export declare function pathUnescape(s: string): string;
/**
 * It is typically used for query parameters and form values.
 * the keys in a Values map are case-sensitive.
 */
export declare class Values {
    readonly m: Map<string, Array<string>>;
    constructor(m?: Map<string, Array<string>>);
    /**
     * gets the first value associated with the given key.
     * to access multiple values, use the map directly.
     */
    get(key: string): string;
    /**
     * sets the key to vals. It replaces any existing
     */
    set(key: string, ...vals: Array<string>): void;
    /**
     * adds the value to key. It appends to any existing values associated with key.
     */
    add(key: string, ...vals: Array<string>): void;
    /**
     * deletes the values associated with key.
     */
    del(key: string): void;
    /**
     * checks whether a given key is set.
     */
    has(key: string): boolean;
    /**
     * encodes the values into ``URL encoded'' form ("bar=baz&foo=quux") sorted by key.
     */
    encode(sortKey?: CompareCallback<string> | boolean): string;
    private _encode;
}
