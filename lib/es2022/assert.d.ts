export interface Assert {
    val: any;
    name?: string;
    message?: string;
}
export interface AssertNumber extends Assert {
    min?: number;
    max?: number;
    notMin?: boolean;
    notMax?: boolean;
}
/**
 * @throws {@link TypeError}
 */
export declare function throwType(val: Assert, typeName: string): never;
/**
 * @throws {@link RangeError}
 */
export declare function throwNumber(val: AssertNumber, typeName: string, min: boolean): never;
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export declare function assertNumber(...vals: Array<AssertNumber>): void;
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export declare function assertInt(...vals: Array<AssertNumber>): void;
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export declare function assertUInt(...vals: Array<AssertNumber>): void;
export declare type AssertCallback = (val: Assert) => void;
/**
 * @throws {@link TypeError}
 * @throws {@link RangeError}
 */
export declare function assertAny(assert: AssertCallback, ...vals: Array<Assert>): void;
