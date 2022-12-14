import { CodeException } from "./exception";
export declare enum ErrorCode {
    /**
     * write to closed channel
     */
    Closed = 1,
    /**
     *  read case not ready
     */
    ReadCase = 2,
    /**
     * write case not ready
     */
    WriteCase = 3
}
export declare class ChannelException extends CodeException {
}
export declare type ReadReturn<T> = undefined | T | Promise<undefined | T>;
export declare type ReadRawReturn<T> = [undefined, false] | [T, true] | Promise<[undefined, false] | [T, true]>;
/**
 * a read-only channel
 */
export interface ReadChannel<T> {
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read(): ReadReturn<T>;
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    readRaw(): ReadRawReturn<T>;
    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    tryRead(): IteratorResult<T> | undefined;
    /**
     * Returns whether the channel is closed
     */
    readonly isClosed: boolean;
    /**
     * Create a case for select to read
     */
    readCase(): ReadCase<T>;
    /**
     * Returns the channel buffer size
     */
    readonly length: number;
    /**
     * Returns how much data the channel has buffered
     */
    readonly capacity: number;
    /**
     * Implement asynchronous iterators
     */
    [Symbol.asyncIterator](): AsyncGenerator<T>;
    /**
     * Wait for chan to close, no data will be read from chan
     */
    wait(): undefined | Promise<void>;
}
/**
 * a write-only channel
 */
export interface WriteChannel<T> {
    /**
      * Writes a value to the channel, blocking if the channel is not writable until the channel is writable or closed
      * @param val value to write
      * @param exception If set to true, writing to a closed channel will throw an exception
      * @returns Returns true if the write is successful, false otherwise this is usually because the channel has been closed
      *
      * @throws ChannelException
      * Writing a value to a closed channel will throw errChannelClosed
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean>;
    /**
     * Attempt to write a value to the channel
     * @param val value to write
     * @param exception If set to true, writing to a closed channel will throw an exception
    * @returns Returns true if the write is successful
    *
    * @throws ChannelException
    * Writing a value to a closed channel will throw errChannelClosed
    */
    tryWrite(val: T, exception?: boolean): boolean;
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    close(): boolean;
    /**
     * Returns whether the channel is closed
     */
    readonly isClosed: boolean;
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    *
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val: T, exception?: boolean): WriteCase<T>;
    /**
     * Returns the channel buffer size
     */
    readonly length: number;
    /**
     * Returns how much data the channel has buffered
     */
    readonly capacity: number;
}
/**
 * Read-write bidirectional channel
 */
export interface Channel<T> extends ReadChannel<T>, WriteChannel<T> {
}
/**
 * The concrete realization of Channel
 * @sealed
 *
 * @example use
 * ```
 * function sum(s: Array<number>, c: WriteChannel<number>) {
 *     let sum = 0
 *     for (const v of s) {
 *         sum += v
 *     }
 *     c.write(sum) // send sum to c
 * }
 * async function main() {
 *     const s = [7, 2, 8, -9, 4, 0]
 *     const c = new Chan<number>()
 *     sum(s.slice(0, s.length / 2), c)
 *     sum(s.slice(s.length / 2), c)
 *
 *     const [x, y] = [await c.read(), await c.read()] // receive from c
 *
 *     console.log(x, y, x + y)
 * }
 * main()
 * ```
 *
 * @example buffered
 * ```
 *     const ch = new Chan<number>(2)
 *     ch.write(1)
 *     ch.write(2)
 *     let [v,ok]= ch.readRaw()
 *     console.log(v,ok)
 *     v = ch.read()
 *     console.log(v)
 * ```
 */
export declare class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
    private static never_;
    /**
     * Returns a chan that will never have a value, usually used as some token
     */
    static get never(): ReadChannel<any>;
    private static closed_;
    /**
     * Returns a alreay closed chan, usually used as some token
     */
    static get closed(): Chan<any>;
    /**
     *
     * @params buffered size, if greater than 0 enable buffering for the channel
     */
    constructor(buf?: number);
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read(): ReadReturn<T>;
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    readRaw(): ReadRawReturn<T>;
    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    tryRead(): IteratorResult<T> | undefined;
    /**
      * Writes a value to the channel, blocking if the channel is not writable until the channel is writable or closed
      * @param val value to write
      * @param exception If set to true, writing to a closed channel will throw an exception
      * @returns Returns true if the write is successful, false otherwise this is usually because the channel has been closed
      *
      * @throws ChannelException
      * Writing a value to a closed channel will throw errChannelClosed
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean>;
    /**
     * Attempt to write a value to the channel
     * @param val value to write
     * @param exception If set to true, writing to a closed channel will throw an exception
    * @returns Returns true if the write is successful
    *
    * @throws ChannelException
    * Writing a value to a closed channel will throw errChannelClosed
    */
    tryWrite(val: T, exception?: boolean): boolean;
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    close(): boolean;
    /**
     * Wait for chan to close, no data will be read from chan
     */
    wait(): undefined | Promise<void>;
    /**
     * Create a case for select to read
     */
    readCase(): ReadCase<T>;
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    *
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val: T, exception?: boolean): WriteCase<T>;
    /**
     * Returns whether the channel is closed
     */
    get isClosed(): boolean;
    /**
     * Returns the channel buffer size
     */
    get length(): number;
    /**
     * Returns how much data the channel has buffered
     */
    get capacity(): number;
    /**
     * Implement asynchronous iterators
     */
    [Symbol.asyncIterator](): AsyncGenerator<T>;
}
export declare type CaseLike = ReadCaseLike | WriteCaseLike;
export interface ReadCaseLike {
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throws {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    read(): undefined | any;
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throws {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    readRaw(): [undefined, false] | [any, true];
    /**
     * Returns whether this case is ready
     */
    readonly isReady: boolean;
}
export interface WriteCaseLike {
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.WriteCase
     */
    write(): boolean;
    /**
     * Returns whether this case is ready
     */
    readonly isReady: boolean;
}
/**
 *
 * @sealed
 */
export declare class ReadCase<T> implements ReadCaseLike {
    private readonly ch;
    private constructor();
    private read_?;
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    read(): undefined | T;
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    readRaw(): [undefined, false] | [T, true];
    /**
     * Returns whether this case is ready
     */
    get isReady(): boolean;
}
/**
 *
 * @sealed
 */
export declare class WriteCase<T> implements WriteCaseLike {
    private readonly ch;
    private readonly val;
    private readonly exception?;
    private constructor();
    private write_?;
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
     *
     * @throw {@link ChannelException}
     * - ChannelCause.WriteCase
     */
    write(): boolean;
    /**
     * Returns whether this case is ready
     */
    get isReady(): boolean;
}
/**
 * wait for a case to complete
 *
 * @remarks Return a ready case, return undefined when no case is ready
 *
 * @example
 * ```
 * const c0 = a.readCase()
 * const c1= b.writeCase()
 * const c2 = c.readCase()
 * switch (await selectChan(c0, c1,c2)) {
 *     case c0:
 *         break
 *     case c1:
 *         break
 *     case c2:
 *         break
 * }
 * ```
 *
 * @example default
 * ```
 * const c0 = c.readCase()
 * switch (selectChan(0, c0)) {
 *     case c0:
 *         break
 *     case 0:
 *         break
 * }
 * ```
 */
export declare function selectChan(def: 0, ...cases: Array<CaseLike>): CaseLike | 0;
/**
 * wait for a case to complete
 *
 * @remarks Return a ready case, if no case is ready, return Promise to wait for the first ready case
 */
export declare function selectChan(...cases: Array<CaseLike>): Promise<CaseLike> | CaseLike;
/**
 * returns an Promise that waits forever
 */
export declare function selectChan(): Promise<any>;
