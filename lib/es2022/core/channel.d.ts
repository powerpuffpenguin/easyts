import { Exception } from "./exception";
export declare class ChannelException extends Exception {
}
export declare const errClosed: ChannelException;
export declare const errNotChan: ChannelException;
export declare const errWriterEmpty: ChannelException;
export declare const errReaderEmpty: ChannelException;
export declare const errWriteCase: ChannelException;
export declare const errReadCase: ChannelException;
/**
 * 一個只讀的通道
 */
export interface ReadChannel<T> {
    /**
     * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
     */
    read(): IteratorResult<T> | Promise<IteratorResult<T>>;
    /**
   * 嘗試從管道中讀取一個值，如果沒有值可讀將返回 undefined,，如果管道已經關閉將返回 {done:true}
   * @returns
   */
    tryRead(): IteratorResult<T> | undefined;
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean;
    /**
     * 創建一個供 select 讀取的 case
     */
    readCase(): Case<T>;
    /**
     * 返回已緩衝數量
     */
    readonly length: number;
    /**
     * 返回緩衝大小
     */
    readonly capacity: number;
    /**
     * 實現異步迭代器
     */
    [Symbol.asyncIterator](): AsyncGenerator<T>;
}
/**
 * 一個只寫的通道
 */
export interface WriteChannel<T> {
    /**
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean>;
    /**
      * 嘗試向通道寫入一個值,如果通道不可寫則返回 false
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false
      * @returns 是否寫入成功，通道關閉或不可寫都會返回 false
      */
    tryWrite(val: T, exception?: boolean): boolean;
    /**
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     * @returns 如果通道已經被關閉返回false，否則關閉通道並返回true
     */
    close(): boolean;
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean;
    /**
     * 創建一個供 select 寫入的 case
     * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
     */
    writeCase(val: T, exception?: boolean): Case<T>;
    /**
     * 返回已緩衝數量
     */
    readonly length: number;
    /**
     * 返回緩衝大小
     */
    readonly capacity: number;
}
export interface Channel<T> extends ReadChannel<T>, WriteChannel<T> {
}
export declare class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
    private rw_;
    /**
     *
     * @param buf 緩衝大小，如果大於0 則爲 通道啓用緩衝
     */
    constructor(buf?: number);
    /**
    * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
    */
    read(): IteratorResult<T> | Promise<IteratorResult<T>>;
    /**
     * 嘗試從管道中讀取一個值，如果沒有值可讀將返回 undefined,，如果管道已經關閉將返回 {done:true}
     * @returns
     */
    tryRead(): IteratorResult<T> | undefined;
    /**
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean>;
    /**
     * 嘗試向通道寫入一個值,如果通道不可寫則返回 false
     * @param val
     * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false
     * @returns 是否寫入成功，通道關閉或不可寫都會返回 false
     */
    tryWrite(val: T, exception?: boolean): boolean;
    /**
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     */
    close(): boolean;
    /**
    * 返回通道是否被關閉
    */
    get isClosed(): boolean;
    /**
     * 創建一個供 select 讀取的 case
     */
    readCase(): Case<T>;
    /**
     * 創建一個供 select 寫入的 case
    * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
     */
    writeCase(val: T, exception?: boolean): Case<T>;
    /**
     * 返回已緩衝數量
     */
    get length(): number;
    /**
     * 返回緩衝大小
     */
    get capacity(): number;
    /**
     * 實現 異步 讀取 迭代器
     */
    [Symbol.asyncIterator](): AsyncGenerator<T>;
}
export interface CaseLike {
    toString(): string;
    /**
     * 返回 case 讀取到的值，如果 case 沒有就緒或者這不是一個 讀取 case 將拋出 異常
     * @returns
     */
    read(): IteratorResult<any>;
    /**
     * 返回 case 是否寫入成功，如果 case 沒有就緒或者這不是一個 寫入 case 將拋出異常
     * @returns
     */
    write(): boolean;
    /**
     * 返回 此 case 是否就緒
     */
    readonly isReady: boolean;
}
export declare class Case<T> {
    private readonly ch;
    private readonly r;
    private readonly val?;
    private readonly exception?;
    private constructor();
    toString(): string;
    private _tryWrite;
    private _tryRead;
    private read_?;
    /**
     * 返回 case 讀取到的值，如果 case 沒有就緒或者這不是一個 讀取 case 將拋出 異常
     * @returns
     */
    read(): IteratorResult<T>;
    private write_?;
    /**
     * 返回 case 是否寫入成功，如果 case 沒有就緒或者這不是一個 寫入 case 將拋出異常
     * @returns
     */
    write(): boolean;
    /**
     * 返回 此 case 是否就緒
     */
    get isReady(): boolean;
}
/**
 * 等待一個 case 完成
 * @param cases
 * @returns 返回就緒的 case，如果傳入了 undefined，則當沒有任何 case 就緒時返回 undefined ，如果沒有傳入 undefined 且 沒有 case 就緒 則返回 Promise 用於等待第一個就緒的 case
 */
export declare function selectChan(...cases: Array<CaseLike | undefined>): Promise<CaseLike> | CaseLike | undefined;
