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
export interface ValuesObject {
    [key: string]: Array<string> | string;
}
/**
 * It is typically used for query parameters and form values.
 * the keys in a Values map are case-sensitive.
 */
export declare class Values {
    /**
     * parses the URL-encoded query string and returns a map listing the values specified for each key.
     * @param errs set errors encountered to this array
     * @param first If true then errs will only log the first error encountered
     * @returns always returns a non-nil map containing all the valid query parameters found
     */
    static parse(query: string, errs?: Array<Exception>, first?: boolean): Values;
    /**
     * convert Object to Values
     */
    static fromObject(obj: ValuesObject): Values;
    /**
     * map listing
     */
    readonly m: Map<string, Array<string>>;
    constructor(m?: Map<string, Array<string>>);
    /**
     * return keys.length
     */
    get length(): number;
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
     * sets the key to vals. It replaces any existing
     */
    setObject(obj: ValuesObject): void;
    /**
     * adds the value to key. It appends to any existing values associated with key.
     */
    add(key: string, ...vals: Array<string>): void;
    /**
     * adds the value to key. It appends to any existing values associated with key.
     */
    addObject(obj: ValuesObject): void;
    /**
     * convert Values to Object
     */
    object(): ValuesObject;
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
/**
 * The Userinfo type is an immutable encapsulation of username and password details for a URL. An existing Userinfo value is guaranteed to have a username set (potentially empty, as allowed by RFC 2396), and optionally a password.
 */
export declare class Userinfo {
    readonly username: string;
    readonly password?: string | undefined;
    constructor(username: string, password?: string | undefined);
    toString(): string;
}
export declare class URL {
    /**
     * parses a raw url into a URL class.
     *
     * @remarks
     * The url may be relative (a path, without a host) or absolute (starting with a scheme). Trying to parse a hostname and path without a scheme is invalid but may not necessarily return an error, due to parsing ambiguities.
     *
     * @throws {@link URLException}
     * @throws {@link Exception}
     */
    static parse(rawURL: string): URL;
    /**
     * parses a raw url into a URL class.
     *
     * @remarks
     * It assumes that url was received in an HTTP request, so the url is interpreted only as an absolute URI or an absolute path.
     * The string url is assumed not to have a #fragment suffix.
     * (Web browsers strip #fragment before sending the URL to a web server.)
     *
     * @throws {@link URLException}
     * @throws {@link Exception}
     */
    static parseRequestURI(rawURL: string): URL;
    private static _parse;
    private constructor();
    scheme: string;
    /**
     * encoded opaque data
     */
    opaque: string;
    user?: Userinfo;
    host: string;
    path: string;
    rawPath?: string;
    forceQuery: boolean;
    rawQuery?: string;
    fragment: string;
    rawFragment?: string;
    setFragment(f: string): void;
}
