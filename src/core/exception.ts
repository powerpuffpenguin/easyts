export class Exception {
    constructor(public readonly message: string) { }
    error(): string {
        return this.message
    }
}