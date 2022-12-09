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
 * @throws TypeError
 */
export declare function throwType(val: Value, typeName: string): never;
/**
 * @throws RangeError
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
     * @throws TypeError
     * @throws RangeError
     */
    isNumber(...vals: Array<NumberValue>): void;
    /**
     * @throws TypeError
     * @throws RangeError
     */
    isInt(...vals: Array<NumberValue>): void;
    /**
     * @throws TypeError
     * @throws RangeError
     */
    isUInt(...vals: Array<NumberValue>): void;
    /**
     * @throws TypeError
     * @throws RangeError
     */
    isAny(assert: AssertCallback, ...vals: Array<Assert>): void;
}
export declare const defaultAssert: Assert;
