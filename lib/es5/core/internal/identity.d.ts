export declare type IdentityType = number | bigint | string;
export declare class Identity {
    readonly id: IdentityType;
    readonly message: string;
    constructor(id: IdentityType, message: string);
}
export declare const IdentityException: {
    id: number;
    name: string;
};
