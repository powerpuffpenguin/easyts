export declare class Completer<T> {
    private promise_;
    private resolve_;
    private reject_;
    constructor();
    get promise(): Promise<T>;
    resolve(value?: T | PromiseLike<T>): void;
    reject(reason?: any): void;
}
