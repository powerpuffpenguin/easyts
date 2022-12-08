import { Completer } from './completer.ts'
import { CodeException } from './exception.ts'
import { neverPromise, noResult } from './values.ts'

export enum ErrorCode {
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
    WriteCase = 3,

}
export class ChannelException extends CodeException { }
const ReaderEmpty = 100
const WriterEmpty = 101

export type ReadReturn<T> = undefined | T | Promise<undefined | T>
export type ReadRawReturn<T> = [undefined, false] | [T, true] | Promise<[undefined, false] | [T, true]>
/**
 * a read-only channel
 */
export interface ReadChannel<T> {
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read(): ReadReturn<T>
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    readRaw(): ReadRawReturn<T>


    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    tryRead(): IteratorResult<T> | undefined
    /**
     * Returns whether the channel is closed
     */
    readonly isClosed: boolean

    /**
     * Create a case for select to read
     */
    readCase(): ReadCase<T>
    /**
     * Returns the channel buffer size
     */
    readonly length: number
    /**
     * Returns how much data the channel has buffered
     */
    readonly capacity: number

    /**
     * Implement asynchronous iterators
     */
    [Symbol.asyncIterator](): AsyncGenerator<T>

    /**
     * Wait for chan to close, no data will be read from chan
     */
    wait(): undefined | Promise<void>
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
    write(val: T, exception?: boolean): boolean | Promise<boolean>
    /**
     * Attempt to write a value to the channel
     * @param val value to write
     * @param exception If set to true, writing to a closed channel will throw an exception
    * @returns Returns true if the write is successful
    * 
    * @throws ChannelException
    * Writing a value to a closed channel will throw errChannelClosed
    */
    tryWrite(val: T, exception?: boolean): boolean
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    close(): boolean
    /**
     * Returns whether the channel is closed
     */
    readonly isClosed: boolean
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    * 
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val: T, exception?: boolean): WriteCase<T>
    /**
     * Returns the channel buffer size
     */
    readonly length: number
    /**
     * Returns how much data the channel has buffered
     */
    readonly capacity: number
}
/**
 * Read-write bidirectional channel
 */
export interface Channel<T> extends ReadChannel<T>, WriteChannel<T> { }
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
export class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
    private static never_: undefined | Chan<any>
    /**
     * Returns a chan that will never have a value, usually used as some token
     */
    static get never(): ReadChannel<any> {
        return Chan.never_ || (Chan.never_ = new Chan<any>())
    }
    private static closed_: undefined | Chan<any>
    /**
     * Returns a alreay closed chan, usually used as some token
     */
    static get closed(): Chan<any> {
        if (!Chan.closed_) {
            Chan.closed_ = new Chan<any>()
            Chan.closed_.close()
        }
        return Chan.closed_
    }

    /**
     * Low-level read and write implementation
     * @internal
     */
    private rw_: RW<T>
    /**
    * @internal
    */
    get rw(): RW<T> {
        return this.rw_
    }
    /**
     * 
     * @params buffered size, if greater than 0 enable buffering for the channel
     */
    constructor(buf = 0) {
        this.rw_ = new RW<T>(Math.floor(buf))
    }
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read(): ReadReturn<T> {
        const rw = this.rw_
        const val = rw.tryRead()
        if (val === undefined) {
            // chan 已經關閉
            return undefined
        } else if (!val.done) {
            // 返回讀取到的值
            return val.value
        }
        return new Promise((resolve) => {
            rw.read((val) => {
                resolve(val.done ? undefined : val.value)
            })
        })
    }
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    readRaw(): ReadRawReturn<T> {
        const rw = this.rw_
        const val = rw.tryRead()
        if (val === undefined) {
            // chan 已經關閉
            return [undefined, false]
        } else if (!val.done) {
            // 返回讀取到的值
            return [val.value, true]
        }
        return new Promise((resolve) => {
            rw.read((val) => {
                resolve(val.done ? [undefined, false] : [val.value, true])
            })
        })
    }
    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    tryRead(): IteratorResult<T> | undefined {
        const rw = this.rw_
        const val = rw.tryRead()
        if (val === undefined) {
            // chan 已經關閉
            return noResult
        } else if (!val.done) {
            // 返回讀取到的值
            return val
        }
        return undefined
    }
    /**
      * Writes a value to the channel, blocking if the channel is not writable until the channel is writable or closed
      * @param val value to write
      * @param exception If set to true, writing to a closed channel will throw an exception
      * @returns Returns true if the write is successful, false otherwise this is usually because the channel has been closed
      *       
      * @throws ChannelException
      * Writing a value to a closed channel will throw errChannelClosed
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean> {
        const rw = this.rw_
        const result = rw.tryWrite(val)
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw new ChannelException(ErrorCode.Closed, 'channel already closed')
            }
            return false
        } else if (result) {
            // 寫入 chan 成功
            return true
        }
        return new Promise((resolve, reject) => {
            rw.write(resolve, exception ? reject : undefined, val)
        })
    }
    /**
     * Attempt to write a value to the channel
     * @param val value to write
     * @param exception If set to true, writing to a closed channel will throw an exception
    * @returns Returns true if the write is successful
    * 
    * @throws ChannelException
    * Writing a value to a closed channel will throw errChannelClosed
    */
    tryWrite(val: T, exception?: boolean): boolean {
        const rw = this.rw_
        const result = rw.tryWrite(val)
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw new ChannelException(ErrorCode.Closed, 'channel already closed')
            }
            return false
        } else if (result) {
            // 寫入 chan 成功
            return true
        }
        // 目前不可寫
        return false
    }
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    close(): boolean {
        return this.rw_.close()
    }
    /**
     * Wait for chan to close, no data will be read from chan
     */
    wait(): undefined | Promise<void> {
        return this.rw.wait()
    }
    /**
     * Create a case for select to read
     */
    readCase(): ReadCase<T> {
        return ReadCase.make(this)
    }
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    * 
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val: T, exception?: boolean): WriteCase<T> {
        return WriteCase.make(this, val, exception)
    }
    /**
     * Returns whether the channel is closed
     */
    get isClosed(): boolean {
        return this.rw_.isClosed
    }
    /**
     * Returns the channel buffer size
     */
    get length(): number {
        return this.rw.length
    }
    /**
     * Returns how much data the channel has buffered
     */
    get capacity(): number {
        return this.rw.capacity
    }
    /**
     * Implement asynchronous iterators
     */
    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
        while (true) {
            const [val, ok] = await this.readRaw()
            if (!ok) {
                break
            }
            yield val
        }
    }
}
/**
 * a ring buffer
 * 
 * @internal
 */
class Ring<T> {
    private offset_ = 0
    private size_ = 0
    constructor(private readonly arrs: Array<T>) {
    }
    get length(): number {
        return this.size_
    }
    get capacity(): number {
        return this.arrs.length
    }
    push(val: T): boolean {
        const arrs = this.arrs
        const size = this.size_
        if (size == arrs.length) {
            return false
        }
        arrs[(this.offset_ + size) % arrs.length] = val
        this.size_++
        return true
    }
    pop(): IteratorResult<T> {
        const size = this.size_
        if (size == 0) {
            return noResult
        }
        const val = this.arrs[this.offset_++]
        if (this.offset_ == this.arrs.length) {
            this.offset_ = 0
        }
        this.size_--
        return {
            value: val,
        }
    }
}
/**
 * @internal
 */
class RW<T>{
    private list: Ring<T> | undefined
    constructor(buf: number) {
        if (buf > 0) {
            this.list = new Ring<T>(new Array<T>(buf))
        }
    }
    private r_ = new Reader()
    private w_ = new Writer()
    tryRead(): IteratorResult<any> | undefined {
        // 讀取緩存
        const list = this.list
        if (list) {
            const result = list.pop()
            if (!result.done) {
                return result
            }
        }

        // 是否關閉
        if (this.isClosed) {
            return
        }
        // 讀取 writer
        const w = this.w_
        if (w.isEmpty) { // 沒有寫入者
            return noResult
        }
        return {
            value: w.invoke(),
        }
    }
    read(callback: ReadCallback): ReadValue {
        // 設置待讀
        return this.r_.connect(callback)
    }
    tryWrite(val: T): boolean | undefined {
        if (this.isClosed) {
            return
        }
        const r = this.r_
        if (r.isEmpty) { // 沒有讀取者
            // 寫入緩存
            return this.list?.push(val) ?? false
        }
        r.invoke({
            value: val,
        })
        return true
    }
    write(callback: WriteCallback, reject: RejectCallback, val: T): WirteValue {
        // 設置待寫
        return this.w_.connect(callback, reject, val)
    }
    close(): boolean {
        if (this.isClosed) {
            return false
        }
        this.isClosed = true
        this.w_.close()
        this.r_.close()
        const closed = this.closed_
        if (closed) {
            this.closed_ = undefined
            closed.resolve()
        }
        return true
    }
    wait(): undefined | Promise<void> {
        if (this.isClosed) {
            return
        }
        let closed = this.closed_
        if (closed) {
            return closed.promise
        }
        closed = new Completer<void>()
        this.closed_ = closed
        return closed.promise
    }
    private closed_: Completer<void> | undefined
    isClosed = false
    get length(): number {
        return this.list?.length ?? 0
    }
    get capacity(): number {
        return this.list?.capacity ?? 0
    }
}
/**
 * shuffle the array
 * @param arrs 
 * @returns 
 */
function shuffle(arrs: Array<any>, c: number) {
    let r
    while (c != 0) {
        r = Math.floor(Math.random() * c)
        c--
        // swap
        [arrs[c], arrs[r]] = [arrs[r], arrs[c]]
    }
    return arrs
}


type ReadCallback = (val: IteratorResult<any>) => void

class Reader {
    private closed_ = false
    private vals = new Array<ReadValue>()
    get isEmpty(): boolean {
        return this.vals.length == 0
    }
    invoke(val: IteratorResult<any>) {
        const vals = this.vals
        switch (vals.length) {
            case 0:
                throw new ChannelException(ReaderEmpty, 'reader empty')
            case 1:
                vals.pop()!.invoke(val)
                return
        }
        const last = vals.length - 1
        const i = Math.floor(Math.random() * vals.length)
        if (i != last) { //swap to end
            [vals[i], vals[last]] = [vals[last], vals[i]]
        }
        vals.pop()!.invoke(val)
    }
    close() {
        if (this.closed_) {
            return
        }
        this.closed_ = true
        const vals = this.vals
        if (vals.length != 0) {
            for (const val of vals) {
                val.invoke(noResult)
            }
            vals.splice(0)
        }
    }
    connect(callback: ReadCallback): ReadValue {
        const val = new ReadValue(this, callback)
        this.vals.push(val)
        return val
    }
    disconet(val: ReadValue) {
        const vals = this.vals
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1)
                break
            }
        }
    }
}

interface Connection {
    disconet(): void
}
class ReadValue {
    constructor(private readonly p: Reader, private readonly callback: ReadCallback) { }
    invoke(val: IteratorResult<any>) {
        this.callback(val)
    }
    disconet() {
        this.p.disconet(this)
    }
}
type WriteCallback = (val: boolean) => void
type RejectCallback = ((reason: any) => void) | undefined
class Writer {
    private closed_ = false
    private vals = new Array<WirteValue>()
    get isEmpty(): boolean {
        return this.vals.length == 0
    }
    invoke() {
        const vals = this.vals
        switch (vals.length) {
            case 0:
                throw new ChannelException(WriterEmpty, "writer empty")
            case 1:
                const p = vals.pop()!
                p.invoke()
                return p.value
        }
        const last = vals.length - 1
        const i = Math.floor(Math.random() * vals.length)
        if (i != last) { //swap to end
            [vals[i], vals[last]] = [vals[last], vals[i]]
        }
        const p = vals.pop()!
        p.invoke()
        return p.value
    }
    close() {
        if (this.closed_) {
            return
        }
        this.closed_ = true
        const vals = this.vals
        if (vals.length != 0) {
            for (const val of vals) {
                val.error()
            }
            vals.splice(0)
        }
    }
    connect(callback: WriteCallback, reject: RejectCallback, val: any): WirteValue {
        const result = new WirteValue(this, callback, reject, val)
        this.vals.push(result)
        return result
    }
    disconet(val: WirteValue) {
        const vals = this.vals
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1)
                break
            }
        }
    }
}
class WirteValue {
    constructor(private readonly p: Writer,
        private readonly callback: WriteCallback,
        private readonly reject: RejectCallback,
        public readonly value: any,
    ) { }
    invoke() {
        this.callback(true)
    }
    error() {
        const reject = this.reject
        if (reject) {
            try {
                reject(new ChannelException(ErrorCode.Closed, 'channel already closed'))
            } catch (_) {
            }
        } else {
            this.callback(false)
        }
    }
    disconet() {
        this.p.disconet(this)
    }
}
export type CaseLike = ReadCaseLike | WriteCaseLike
export interface ReadCaseLike {
    /**
     * reset read-write status
     * @internal
     */
    reset(): void
    /**
    * @internal
    */
    tryInvoke(): boolean
    /**
    * @internal
    */
    do(resolve: (c: CaseLike) => void, reject: (c: CaseLike) => void): Connection
    /**
    * @internal
    */
    invoke(): Promise<void>
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throws {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    read(): undefined | any
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throws {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    readRaw(): [undefined, false] | [any, true]
    /**
     * Returns whether this case is ready
     */
    readonly isReady: boolean
}
export interface WriteCaseLike {
    /**
     * reset read-write status
     * @internal
     */
    reset(): void
    /**
    * @internal
    */
    tryInvoke(): boolean
    /**
    * @internal
    */
    do(resolve: (c: CaseLike) => void, reject: (c: CaseLike) => void): Connection
    /**
    * @internal
    */
    invoke(): Promise<void>
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.WriteCase
     */
    write(): boolean
    /**
     * Returns whether this case is ready
     */
    readonly isReady: boolean
}
/**
 * 
 * @sealed
 */
export class ReadCase<T> implements ReadCaseLike {
    /**
     * @internal
     */
    static make<T>(ch: Chan<T>): ReadCase<T> {
        return new ReadCase<T>(ch)
    }
    private constructor(private readonly ch: Chan<T>) {
    }
    private read_?: IteratorResult<T>
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    read(): undefined | T {
        const val = this.read_
        if (val === undefined) {
            throw new ChannelException(ErrorCode.ReadCase, 'read case not ready')
        }
        return val.done ? undefined : val.value
    }
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     * @throw {@link ChannelException}
     * - ChannelCause.ReadCase
     */
    readRaw(): [undefined, false] | [T, true] {
        const val = this.read_
        if (val === undefined) {
            throw new ChannelException(ErrorCode.ReadCase, 'read case not ready')
        }
        return val.done ? [undefined, false] : [val.value, true]
    }
    /**
     * reset read-write status
     * @internal
     */
    reset(): void {
        this.read_ = undefined
    }
    /**
     * Returns whether this case is ready
     */
    get isReady(): boolean {
        return this.read_ !== undefined
    }
    /**
    * @internal
    */
    tryInvoke(): boolean {
        const val = this.ch.tryRead()
        if (val === undefined) {
            return false
        }
        this.read_ = val
        return true
    }
    /**
    * @internal
    */
    do(resolve: (c: CaseLike) => void, reject: (c: CaseLike) => void): Connection {
        const rw = this.ch.rw
        return rw.read((val) => {
            this.read_ = val
            resolve(this)
        })
    }
    /**
    * @internal
    */
    invoke(): Promise<void> {
        const rw = this.ch.rw
        return new Promise((resolve) => {
            rw.read((val) => {
                this.read_ = val
                resolve()
            })
        })
    }
}
/**
 * 
 * @sealed
 */
export class WriteCase<T> implements WriteCaseLike {
    /**
    * @internal
    */
    static make<T>(ch: Chan<T>, val: T, exception?: boolean): WriteCase<T> {
        return new WriteCase<T>(ch, val, exception)
    }
    private constructor(private readonly ch: Chan<T>,
        private readonly val: T,
        private readonly exception?: boolean,
    ) {
    }
    /**
     * reset read-write status
     * @internal
     */
    reset() {
        this.write_ = undefined
    }
    /**
    * @internal
    */
    tryInvoke(): boolean {
        const ch = this.ch
        const val = ch.tryWrite(this.val, false)
        if (val) {
            this.write_ = true
            return true
        } else if (ch.isClosed) {
            this.write_ = false
            if (this.exception) {
                throw new ChannelException(ErrorCode.Closed, 'channel already closed')
            }
            return true
        }
        return false
    }
    /**
    * @internal
    */
    do(resolve: (c: CaseLike) => void, reject: (c: CaseLike) => void): Connection {
        const rw = this.ch.rw
        return rw.write((ok) => {
            if (ok) {
                this.write_ = true
            } else {
                this.write_ = false
                if (this.exception) {
                    reject(this)
                    return
                }
            }
            resolve(this)
        }, undefined, this.val)
    }
    /**
    * @internal
    */
    invoke(): Promise<void> {
        const rw = this.ch.rw
        return new Promise((resolve, reject) => {
            rw.write((ok) => {
                if (ok) {
                    this.write_ = true
                } else {
                    this.write_ = false
                    if (this.exception) {
                        reject(new ChannelException(ErrorCode.Closed, 'channel already closed'))
                        return
                    }
                }
                resolve()
            }, undefined, this.val)
        })
    }
    private write_?: boolean
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
     * 
     * @throw {@link ChannelException}
     * - ChannelCause.WriteCase
     */
    write(): boolean {
        const val = this.write_
        if (val === undefined) {
            throw new ChannelException(ErrorCode.WriteCase, 'write case not ready')
        }
        return val
    }
    /**
     * Returns whether this case is ready
     */
    get isReady(): boolean {
        return this.write_ !== undefined
    }
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
export function selectChan(def: 0, ...cases: Array<CaseLike>): CaseLike | 0;
/**
 * wait for a case to complete
 * 
 * @remarks Return a ready case, if no case is ready, return Promise to wait for the first ready case
 */
export function selectChan(...cases: Array<CaseLike>): Promise<CaseLike> | CaseLike;
/**
 * returns an Promise that waits forever
 */
export function selectChan(): Promise<any>;
export function selectChan(...cases: Array<CaseLike | undefined | null | 0>): Promise<CaseLike> | CaseLike | 0 {
    const { chans, len, def } = formatCases(cases);
    if (len == 0) {
        // if no valid case is passed in, it will be blocked all the time
        // undefined and null are used to simulate select nil
        return def ? 0 : neverPromise
    }
    // reset case
    for (let i = 0; i < len; i++) {
        chans[i].reset()
    }

    // shuffle the case to avoid the case in front of the array is always executed when multiple cases are completed at the same time
    shuffle(cases, len)

    // check ready case
    for (let i = 0; i < len; i++) {
        if (chans[i].tryInvoke()) {
            return chans[i]
        }
    }
    if (def) { // return default
        return 0
    } else if (len == 1) {
        // only one case
        const c = chans[0]
        return c.invoke().then(() => {
            return c
        })
    }

    // There are multiple cases
    return new Promise((resolve, reject) => {
        const conns = new Array<Connection>(len)
        for (let i = 0; i < len; i++) {
            conns[i] = chans[i].do((c) => {
                for (let i = 0; i < len; i++) {
                    conns[i].disconet()
                }
                resolve(c)
            }, () => {
                for (let i = 0; i < len; i++) {
                    conns[i].disconet()
                }
                reject(new ChannelException(ErrorCode.Closed, 'channel already closed'))
            })
        }
    })
}

function formatCases(cases: Array<CaseLike | undefined | null | 0>) {
    let len = cases.length
    let def = false
    for (let i = 0; i < len; i++) {
        const c = cases[i]
        if (c === 0) {
            def = true
        } else if (!(c === undefined || c === null)) {
            continue
        }

        // swap to end
        len--
        while (len > i) {
            const o = cases[len]
            if (o === 0 || o === undefined || o === null) {
                len--
                continue
            }
            [cases[i], cases[len]] = [cases[len], cases[i]]
            break
        }
    }
    return {
        chans: cases as Array<CaseLike>,
        len: len,
        def: def,
    }
}