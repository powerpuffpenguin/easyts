import { Connection, Signals, Slot, SlotCallback } from "./signals"
import { FilterCombiner } from "./signals_combiners"
import { ChangedCallback, VoidCallback } from "./types"
import { NoResult } from "./values"

/**
 * 一個只讀的通道
 */
export interface ReadChannel<T> {
    /**
     * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
     */
    read(): IteratorResult<T> | Promise<IteratorResult<T>>
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean
}
/**
 * 一個只寫的通道
 */
export interface WriteChannel<T> {
    /**
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val: T): boolean | Promise<boolean>

    /**
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     */
    close(): void
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean
}
export interface Channel<T> extends ReadChannel<T>, WriteChannel<T> { }
export class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
    private rw_: RW<T>
    constructor(buf: number) {
        this.rw_ = new RW<T>(Math.floor(buf))
    }
    /**
    * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
    */
    read(): IteratorResult<T> | Promise<IteratorResult<T>> {
        const rw = this.rw_
        const val = rw.tryRead()
        if (!val.done) {
            // chan 已經關閉
            return val
        }
        return new Promise((resolve) => {
            rw.read(resolve)
        })
    }
    /**
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val: T): boolean | Promise<boolean> {
        const rw = this.rw_
        const result = rw.tryWrite(val)
        if (result === undefined) {
            // chan 已經關閉
            return false
        } else if (result) {
            // 寫入 chan 成功
            return true
        }
        return new Promise((resolve) => {
            rw.write(resolve, val)
        })
    }
    /**
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     */
    close() {
        this.rw_.close()
    }
    /**
    * 返回通道是否被關閉
    */
    get isClosed(): boolean {
        return this.rw_.isClosed
    }
}

class RW<T>{
    constructor(buf: number) { }
    private r_ = new Reader()
    private w_ = new Writer()
    tryRead(): IteratorResult<any> {
        // 讀取緩存

        // 是否關閉
        if (this.isClosed) {
            return NoResult
        }
        // 讀取 writer
        const w = this.w_
        if (w.isEmpty) {
            return NoResult
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
        if (r.isEmpty) {
            // 寫入緩存

            return false
        }
        r.invoke({
            value: val,
        })
        return true
    }
    write(callback: WriteCallback, val: T): WirteValue | undefined {
        // 設置待寫
        return this.w_.connect(callback, val)
    }
    close() {
        if (this.isClosed) {
            return
        }
        this.isClosed = true
        this.w_.close()
        this.r_.close()
    }
    isClosed = false
}
/**
 * 打亂數組
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
            throw new Error('Reader empty')
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
                val.invoke(NoResult)
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
class Writer {
    private closed_ = false
    private vals = new Array<WirteValue>()
    get isEmpty(): boolean {
        return this.vals.length == 0
    }
    invoke() {
        const vals = this.vals
        if (vals.length == 0) {
            throw new Error('Writer empty')
        } else if (vals.length > 1) {
            shuffle(vals)
        }
        const p: WirteValue = vals.pop() as any
        p.invoke(true)
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
                val.invoke(false)
            }
            vals.splice(0)
        }
    }
    connect(callback: WriteCallback, val: any): WirteValue {
        const result = new WirteValue(this, callback, val)
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
    constructor(private readonly p: Writer, private readonly callback: WriteCallback, public readonly value: any) { }
    invoke(val: boolean) {
        this.callback(val)
    }
    disconet() {
        this.p.disconet(this)
    }
}