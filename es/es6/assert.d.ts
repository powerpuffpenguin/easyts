export interface Value {
    val: any;
    name?: string;
    message?: string;
}
export interface NumberValue extends Value {
    min?: number;
    max?: number;
    notMin?: boolean;
    notMax?: boolean;
}
/**
 * @throws {@link TypeError}
 */
export declare function throwType(val: Value, typeName: string): never;
/**
 * @throws {@link RangeError}
 */
export declare function throwNumber(val: NumberValue, typeName: string, min: boolean): never;
export declare type AssertCallback = (val: Assert) => void;
export declare class Assert {
    static default: Assert;
    /**
     * Whether to enable assertion, the default is enabled, it is recommended to enable it during development to ensure that the code is correct, and disable it during release to improve efficiency
     */
    enable: boolean;
    /**
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    isNumber(...vals: Array<NumberValue>): void;
    /**
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    isInt(...vals: Array<NumberValue>): void;
    /**
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    isUInt(...vals: Array<NumberValue>): void;
    /**
     * @throws {@link TypeError}
     * @throws {@link RangeError}
     */
    isAny(assert: AssertCallback, ...vals: Array<Assert>): void;
}
export declare const defaultAssert: Assert;
