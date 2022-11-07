import { Exception } from "./exception"
import { neverPromise, noResult } from "./values"

/**
 * Exceptions thrown by Channel operations
 */
export class ChannelException extends Exception { }
/**
 * Thrown when writing to a closed channel
 */
export const errChannelClosed = new ChannelException('write on closed channel')
const errChannelWriterEmpty = new ChannelException('Writer empty')
const errChannelReaderEmpty = new ChannelException('Reader empty')
/**
 * Thrown when case is not writable or not ready
 */
export const errChanneWriteCase = new ChannelException('case not ready or unwritable')
/**
 * Thrown when case is not readable or not ready
 */
export const errChanneReadCase = new ChannelException('case not ready or unreadable')

/**
 * a read-only channel
 */
export interface ReadChannel<T> {
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read(): IteratorResult<T> | Promise<IteratorResult<T>>
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
    readCase(): Case<T>
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
    writeCase(val: T, exception?: boolean): Case<T>
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
 *     console.log(x.value, y.value, x.value + y.value)
 * }
 * main()
 * ```
 * 
 * @example buffered
 * ```
 *     const ch = new Chan<number>(2)
 *     ch.write(1)
 *     ch.write(2)
 *     let v = ch.read() as IteratorResult<number>
 *     console.log(v.value)
 *     v = ch.read() as IteratorResult<number>
 *     console.log(v.value)
 * ```
 */
export class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
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
    read(): IteratorResult<T> | Promise<IteratorResult<T>> {
        const rw = this.rw_
        const val = rw.tryRead()
        if (val === undefined) {
            // chan 已經關閉
            return noResult
        } else if (!val.done) {
            // 返回讀取到的值
            return val
        }
        return new Promise((resolve) => {
            rw.read(resolve)
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
                throw errChannelClosed
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
                throw errChannelClosed
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
     * Create a case for select to read
     */
    readCase(): Case<T> {
        return Case.make(this, true)
    }
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    * 
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val: T, exception?: boolean): Case<T> {
        return Case.make(this, false, val, exception)
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
            const val = await this.read()
            if (val.done) {
                break
            }
            yield val.value
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
        return true
    }
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
function shuffle(arrs: Array<any>) {
    let c = arrs.length, r;
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
        if (vals.length == 0) {
            throw errChannelReaderEmpty
        } else if (vals.length > 1) {
            shuffle(vals)
        }
        vals.pop()?.invoke(val)
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
        if (vals.length == 0) {
            throw errChannelWriterEmpty
        } else if (vals.length > 1) {
            shuffle(vals)
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
                reject(errChannelClosed)
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
export interface CaseLike {
    toString(): string
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
     * Returns the value read by the case, throws an exception if the case is not ready or this is not a read case
     */
    read(): IteratorResult<any>
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
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
export class Case<T>{
    /**
    * @internal
    */
    static make<T>(ch: Chan<T>, r: boolean, val?: any, exception?: boolean): Case<T> {
        return new Case<T>(ch, r, val, exception)
    }
    private constructor(private readonly ch: Chan<T>,
        private readonly r: boolean,
        private readonly val?: any,
        private readonly exception?: boolean,
    ) {
    }
    toString(): string {
        if (this.r) {
            return JSON.stringify({
                case: 'read',
                ready: this.isReady,
                val: this.read_,
            }, undefined, "\t")
        } else {
            return JSON.stringify({
                case: 'write',
                ready: this.isReady,
                val: this.write_,
            }, undefined, "\t")
        }
    }
    /**
     * reset read-write status
     * @internal
     */
    reset() {
        if (this.r) {
            this.read_ = undefined
        } else {
            this.write_ = undefined
        }
    }
    /**
    * @internal
    */
    tryInvoke(): boolean {
        if (this.r) {
            return this._tryRead()
        } else {
            return this._tryWrite()
        }
    }
    /**
    * @internal
    */
    do(resolve: (c: CaseLike) => void, reject: (c: CaseLike) => void): Connection {
        const rw = this.ch.rw
        if (this.r) {
            return rw.read((val) => {
                this.read_ = val
                resolve(this)
            })
        } else {
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
    }
    /**
    * @internal
    */
    invoke(): Promise<void> {
        const rw = this.ch.rw
        if (this.r) {
            return new Promise((resolve) => {
                rw.read((val) => {
                    this.read_ = val
                    resolve()
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                rw.write((ok) => {
                    if (ok) {
                        this.write_ = true
                    } else {
                        this.write_ = false
                        if (this.exception) {
                            reject(errChannelClosed)
                            return
                        }
                    }
                    resolve()
                }, undefined, this.val)
            })
        }
    }
    private _tryWrite(): boolean {
        const ch = this.ch
        const val = ch.tryWrite(this.val, this.exception)
        if (val) {
            this.write_ = true
            return true
        } else if (ch.isClosed) {
            this.write_ = false
            return true
        }
        return false
    }
    private _tryRead(): boolean {
        const val = this.ch.tryRead()
        if (val == undefined) {
            return false
        }
        this.read_ = val
        return true
    }
    private read_?: IteratorResult<T>
    /**
     * Returns the value read by the case, throws an exception if the case is not ready or this is not a read case
     */
    read(): IteratorResult<T> {
        const val = this.read_
        if (val === undefined) {
            throw errChanneReadCase
        }
        return val
    }
    private write_?: boolean
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
     */
    write(): boolean {
        const val = this.write_
        if (val === undefined) {
            throw errChanneWriteCase
        }
        return val
    }
    /**
     * Returns whether this case is ready
     */
    get isReady(): boolean {
        return this.r ? this.read_ !== undefined : this.write_ !== undefined
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
 * switch (selectChan(undefined, c0)) {
 *     case c0:
 *         break
 *     case undefined:
 *         break
 * }
 * ```
 */
export function selectChan(def: undefined, ...cases: Array<CaseLike>): CaseLike | undefined;
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
export function selectChan(...cases: Array<CaseLike | undefined>): Promise<CaseLike> | CaseLike | undefined {
    if (cases.length == 0) {
        // 沒有傳入 case 所以 select 用於阻塞
        return neverPromise
    } else if (cases.length > 1) {
        shuffle(cases)
    }
    // 重置 case 狀態
    for (const c of cases) {
        c?.reset()
    }

    // 檢查就緒的 case
    let def = false
    for (const c of cases) {
        if (c === undefined) {
            def = true
        } else {
            // 讀寫 完成
            if (c.tryInvoke()) {
                return c
            }
        }
    }
    // 沒有就緒 case 但設置了 default，返回 default case
    if (def) {
        return
    } else if (cases.length == 1) {
        // 只有一個 case
        const c = cases[0] as CaseLike
        return c.invoke().then(() => {
            return c
        })
    }
    // 存在多個 case
    return new Promise((resolve, reject) => {
        const arrs = cases as Array<CaseLike>
        const conns = new Array<Connection>(arrs.length)
        for (let i = 0; i < arrs.length; i++) {
            conns[i] = arrs[i].do((c) => {
                for (let i = 0; i < conns.length; i++) {
                    conns[i].disconet()
                }
                resolve(c)
            }, () => {
                for (let i = 0; i < conns.length; i++) {
                    conns[i].disconet()
                }
                reject(errChannelClosed)
            })
        }
    })
}