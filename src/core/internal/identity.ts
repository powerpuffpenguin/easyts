
export type IdentityType = number | bigint | string

export class Identity {
    constructor(readonly id: IdentityType, readonly message: string) { }
}

export const IdentityException = { id: 1, name: 'Exception' }
