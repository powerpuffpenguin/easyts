import { Exception } from "./exception"
import { VoidCallback } from "./types"
import { neverPromise, noResult } from "./values"

export class ChannelException extends Exception { }
export const errClosed = new ChannelException('write on closed channel')
export const errNotChan = new ChannelException("argument 'chan' not extends from class 'Chan'")
export const errWriterEmpty = new ChannelException('Writer empty')
export const errReaderEmpty = new ChannelException('Reader empty')
export const errWriteCase = new ChannelException('case not ready or unreadable')
export const errReadCase = new ChannelException('case not ready or unreadable')

/**
 * 一個只讀的通道
 */
export interface ReadChannel<T> {
    /**
     * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
     */
    read(): IteratorResult<T> | Promise<IteratorResult<T>>
    /**
   * 嘗試從管道中讀取一個值，如果沒有值可讀將返回 undefined,，如果管道已經關閉將返回 {done:true}
   * @returns 
   */
    tryRead(): IteratorResult<T> | undefined
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean

    /**
     * 創建一個供 select 讀取的 case
     */
    readCase(): Case<T>
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
    write(val: T, exception?: boolean): boolean | Promise<boolean>
    /**
      * 嘗試向通道寫入一個值,如果通道不可寫則返回 false
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false
      * @returns 是否寫入成功，通道關閉或不可寫都會返回 false
      */
    tryWrite(val: T, exception?: boolean): boolean
    /**
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     * @returns 如果通道已經被關閉返回false，否則關閉通道並返回true
     */
    close(): boolean
    /**
     * 返回通道是否被關閉
     */
    readonly isClosed: boolean

    /**
     * 創建一個供 select 寫入的 case
     * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
     */
    writeCase(val: T, exception?: boolean): Case<T>
}
export interface Channel<T> extends ReadChannel<T>, WriteChannel<T> { }
export class Chan<T> implements ReadChannel<T>, WriteChannel<T> {
    private rw_: RW<T>
    /*
    * @internal
    */
    get rw(): RW<T> {
        return this.rw_
    }
    /**
     * 
     * @param buf 緩衝大小，如果大於0 則爲 通道啓用緩衝
     */
    constructor(buf = 0) {
        this.rw_ = new RW<T>(Math.floor(buf))
    }
    /**
    * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
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
     * 嘗試從管道中讀取一個值，如果沒有值可讀將返回 undefined,，如果管道已經關閉將返回 {done:true}
     * @returns 
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
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val: T, exception?: boolean): boolean | Promise<boolean> {
        const rw = this.rw_
        const result = rw.tryWrite(val)
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw errClosed
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
     * 嘗試向通道寫入一個值,如果通道不可寫則返回 false
     * @param val
     * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false
     * @returns 是否寫入成功，通道關閉或不可寫都會返回 false
     */
    tryWrite(val: T, exception?: boolean): boolean {
        const rw = this.rw_
        const result = rw.tryWrite(val)
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw errClosed
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
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     */
    close(): boolean {
        return this.rw_.close()
    }
    /**
    * 返回通道是否被關閉
    */
    get isClosed(): boolean {
        return this.rw_.isClosed
    }
    /**
     * 創建一個供 select 讀取的 case
     */
    readCase(): Case<T> {
        return Case.make(this, true)
    }
    /**
     * 創建一個供 select 寫入的 case
    * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
     */
    writeCase(val: T, exception?: boolean): Case<T> {
        return Case.make(this, false, val, exception)
    }
}
// 一個環形緩衝區
class Ring<T> {
    private offset_ = 0
    private size_ = 0
    constructor(private readonly arrs: Array<T>) {
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
            throw errReaderEmpty
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
            throw errWriterEmpty
        } else if (vals.length > 1) {
            shuffle(vals)
        }
        const p: WirteValue = vals.pop() as any
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
                reject(errClosed)
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
export class Case<T>{
    /**
    * @internal
    */
    static make<T>(ch: Chan<T>, r: boolean, val?: any, exception?: boolean): Case<T> {
        return new Case<T>(ch, r, val, exception)
    }
    private constructor(public readonly ch: Chan<T>,
        public readonly r: boolean,
        public readonly val?: any,
        public readonly exception?: boolean,
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
     * 重置 讀寫狀態
     * @internal
     */
    reset() {
        if (this.r) {
            this.read_ = undefined
        } else {
            this.write_ = undefined
        }
    }
    /*
    * @internal
    */
    tryInvoke(): boolean {
        if (this.r) {
            return this._tryRead()
        } else {
            return this._tryWrite()
        }
    }
    do(resolve: (c: Case<any>) => void, reject: (c: Case<any>) => void): Connection {
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
    /*
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
                            reject(errClosed)
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
     * 返回 case 讀取到的值，如果 case 沒有就緒或者這不是一個 讀取 case 將拋出 異常
     * @returns 
     */
    read(): IteratorResult<T> {
        const val = this.read_
        if (val === undefined) {
            throw errReadCase
        }
        return val
    }
    private write_?: boolean
    /**
     * 返回 case 是否寫入成功，如果 case 沒有就緒或者這不是一個 寫入 case 將拋出異常
     * @returns 
     */
    write(): boolean {
        const val = this.write_
        if (val === undefined) {
            throw errWriteCase
        }
        return val
    }
    /**
     * 返回 此 case 是否就緒
     */
    get isReady(): boolean {
        return this.r ? this.read_ !== undefined : this.write_ !== undefined
    }
}
/**
 * 等待一個 case 完成
 * @param cases 
 * @returns 返回就緒的 case，如果傳入了 undefined，則當沒有任何 case 就緒時返回 undefined ，如果沒有傳入 undefined 且 沒有 case 就緒 則返回 Promise 用於等待第一個就緒的 case
 */
export function selectChan(...cases: Array<Case<any> | undefined>): Promise<Case<any>> | Case<any> | undefined {
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
        const c = cases[0] as Case<any>
        return c.invoke().then(() => {
            return c
        })
    }
    // 存在多個 case
    return new Promise((resolve, reject) => {
        const arrs = cases as Array<Case<any>>
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
                reject(errClosed)
            })
        }
    })
}