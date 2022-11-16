import { Exception } from "../../core";
import { CompareCallback } from "../../core/types";
export declare class InvalidHostException extends Exception {
    private constructor();
}
export declare class EscapeException extends Exception {
    private constructor();
}
export declare class URLException extends Exception {
    op: string;
    url: string;
    err: any;
    constructor(op: string, url: string, err: any);
    unwrap(): undefined | Exception;
    error(): string;
    timeout(): boolean;
    temporary(): boolean;
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
     * @returns always returns a map containing all the valid query parameters found
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
    readonly password: string;
    constructor(username: string, password?: string);
    /**
     *
     * @param redacted If true replaces any password with "xxxxx".
     * @returns
     */
    toString(redacted?: boolean): string;
}
export declare class URL {
    /**
     * parses a raw url into a URL class.
     *
     * @remarks
     * The url may be relative (a path, without a host) or absolute (starting with a scheme). Trying to parse a hostname and path without a scheme is invalid but may not necessarily return an error, due to parsing ambiguities.
     *
     * @throws {@link URLException}
     * @throws {@link core.Exception}
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
     * @throws {@link core.Exception}
     */
    static parseRequestURI(rawURL: string): URL;
    private static _parse;
    constructor();
    scheme: string;
    /**
     * encoded opaque data
     */
    opaque: string;
    user?: Userinfo;
    host: string;
    path: string;
    rawPath: string;
    forceQuery: boolean;
    rawQuery: string;
    fragment: string;
    rawFragment: string;
    /**
     * @throws {@link EscapeException}
     */
    private _setFragment;
    /**
     * @throws {@link EscapeException}
     */
    private _setPath;
    /**
     * returns the escaped form of this.fragment.
     *
     * @remarks
     * In general there are multiple possible escaped forms of any fragment.
     * escapedFragment() returns this.rawFragment when it is a valid escaping of this.fragment.
     * Otherwise escapedFragment() ignores this.rawFragment and computes an escaped form on its own.
     *
     * The toString method uses escapedFragment() to construct its result.
     * In general, code should call EscapedFragment instead of reading this.rawFragment directly.
     */
    escapedFragment(): string;
    /**
     * returns the escaped form of this.path.
     *
     * @remarks
     * In general there are multiple possible escaped forms of any path.
     * escapedPath() returns this.rawPath when it is a valid escaping of this.path.
     * Otherwise escapedPath() ignores this.rawPath and computes an escaped form on its own.
     *
     * The toString and RequestURI method uses escapedPath() to construct its result.
     * In general, code should call escapedPath instead of reading this.rawPath directly.
     */
    escapedPath(): string;
    /**
     * returns this.host, stripping any valid port number if present.
     * @remarks
     * If the result is enclosed in square brackets, as literal IPv6 addresses are, the square brackets are removed from the result.
     */
    hostname(): string;
    /**
     * returns the port part of this.host, without the leading colon.
     * @remarks
     * If this.host doesn't contain a valid numeric port, Port returns an undefined.
     */
    port(): undefined | string;
    get isAbs(): boolean;
    /**
     * parses rawQuery and returns the corresponding values.
     * @param errs set errors encountered to this array
     * @param first If true then errs will only log the first error encountered
     * @returns always returns a map containing all the valid query parameters found
     */
    query(errs?: Array<Exception>, first?: boolean): Values;
    /**
     * returns the encoded path?query or opaque?query string
     */
    requestURI(): string;
    /**
     * reassembles the URL into a valid URL string.
     *
     * @remarks
     * The general form of the result is one of:
     *
     * 1. scheme:opaque?query#fragment
     * 2. scheme://userinfo@host/path?query#fragment
     *
     * If this.opaque is non-empty, toString uses the first form; otherwise it uses the second form.
     * Any non-ASCII characters in host are escaped.
     * To obtain the path, toString uses this.escapedPath().
     *
     * In the second form, the following rules apply:
     * - if this.scheme is empty, scheme: is omitted.
     * - if this.user is nil, userinfo@ is omitted.
     * - if this.host is empty, host/ is omitted.
     * - if this.scheme and u.Host are empty and u.User is nil, the entire scheme://userinfo@host/ is omitted.
     * - if this.host is non-empty and u.Path begins with a /, the form host/path does not add its own /.
     * - if this.rawQuery is empty, ?query is omitted.
     * - if this.fragment is empty, #fragment is omitted.
     *
     * @param redacted If true replaces any password with "xxxxx".
     */
    toString(redacted?: boolean): string;
    /**
     * resolves a URI reference to an absolute URI from an absolute base URI this, per RFC 3986 Section 5.2.
     *
     * @remarks
     * The URI reference may be relative or absolute. resolveReference always returns a new URL instance, even if the returned URL is identical to either the base or reference.
     * If ref is an absolute URL, then resolveReference ignores base and returns a copy of ref.
     */
    resolveReference(ref: URL): URL;
    /**
     * return this.resolveReference(URL.parse(ref))
     */
    parse(ref: string): URL;
    /**
     * Create a full copy of the URL
     */
    clone(): URL;
    /**
     * marshal to binary
     */
    marshalBinary(): Uint8Array;
    /**
     * unmarshal from binary
     */
    unmarshalBinary(input: BufferSource): void;
}
