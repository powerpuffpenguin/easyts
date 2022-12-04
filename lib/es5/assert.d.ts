export interface Assert {
    val: any;
    name?: string;
    message?: string;
}
export interface AssertNumber extends Assert {
    min?: number;
    max?: number;
}
export declare function throwType(val: Assert, typeName: string): never;
export declare function throwNumber(val: AssertNumber, typeName: string, min: boolean): never;
export declare function assertNumber(...vals: Array<AssertNumber>): void;
export declare function assertInt(...vals: Array<AssertNumber>): void;
export declare function assertUInt(...vals: Array<AssertNumber>): void;
export declare type AssertCallback = (val: Assert) => void;
export declare function assertAny(assert: AssertCallback, ...vals: Array<Assert>): void;
