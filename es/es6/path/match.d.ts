/**
 * reports whether name matches the shell pattern.
 * @remarks
 * The pattern syntax is:
 * ```
 * 	pattern:
 * 		{ term }
 * 	term:
 * 		'*'         matches any sequence of non-/ characters
 * 		'?'         matches any single non-/ character
 * 		'[' [ '^' ] { character-range } ']'
 * 		            character class (must be non-empty)
 * 		c           matches character c (c != '*', '?', '\\', '[')
 * 		'\\' c      matches character c
 *
 * 	character-range:
 * 		c           matches character c (c != '\\', '-', ']')
 * 		'\\' c      matches character c
 * 		lo '-' hi   matches character c for lo <= c <= hi
 * ```
 * Match requires pattern to match all of name, not just a substring.
 * The only possible throw error is ErrBadPattern, when pattern is malformed.
 *
 * @throws {@link errBadPattern}
 *
 * @example
 * ```
 * consoloe.log(match("abc", "abc")) // true
 * consoloe.log(match("a*", "abc")) // true
 * consoloe.log(match("a*\/b", "a/c/b")) // false
 * ```
 */
export declare function match(pattern: string, name: string): boolean;
