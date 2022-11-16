import { Exception } from "../core/exception";
export declare const errBadPattern: Exception;
/**
 *
 * @param pattern
 * @param name
 * @returns
 * @throws {@link errBadPattern}
 */
export declare function match(pattern: string, name: string): boolean;
