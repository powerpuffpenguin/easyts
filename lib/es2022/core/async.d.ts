export declare class Completer<T> {
    private promise_;
    private resolve_;
    private reject_;
    private c_;
    get isCompleted(): boolean;
    constructor();
    get promise(): Promise<T>;
    resolve(value?: T | PromiseLike<T>): void;
    reject(reason?: any): void;
}
