"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectChan = exports.Case = exports.Chan = exports.errChanneReadCase = exports.errChanneWriteCase = exports.errChannelClosed = exports.ChannelException = void 0;
const exception_1 = require("./exception");
const values_1 = require("./values");
/**
 * Exceptions thrown by Channel operations
 */
class ChannelException extends exception_1.Exception {
}
exports.ChannelException = ChannelException;
/**
 * Thrown when writing to a closed channel
 */
exports.errChannelClosed = new ChannelException('write on closed channel');
const errChannelWriterEmpty = new ChannelException('Writer empty');
const errChannelReaderEmpty = new ChannelException('Reader empty');
/**
 * Thrown when case is not writable or not ready
 */
exports.errChanneWriteCase = new ChannelException('case not ready or unwritable');
/**
 * Thrown when case is not readable or not ready
 */
exports.errChanneReadCase = new ChannelException('case not ready or unreadable');
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
class Chan {
    /**
     * Low-level read and write implementation
     * @internal
     */
    rw_;
    /**
    * @internal
    */
    get rw() {
        return this.rw_;
    }
    /**
     *
     * @params buffered size, if greater than 0 enable buffering for the channel
     */
    constructor(buf = 0) {
        this.rw_ = new RW(Math.floor(buf));
    }
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    read() {
        const rw = this.rw_;
        const val = rw.tryRead();
        if (val === undefined) {
            // chan 已經關閉
            return values_1.noResult;
        }
        else if (!val.done) {
            // 返回讀取到的值
            return val;
        }
        return new Promise((resolve) => {
            rw.read(resolve);
        });
    }
    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    tryRead() {
        const rw = this.rw_;
        const val = rw.tryRead();
        if (val === undefined) {
            // chan 已經關閉
            return values_1.noResult;
        }
        else if (!val.done) {
            // 返回讀取到的值
            return val;
        }
        return undefined;
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
    write(val, exception) {
        const rw = this.rw_;
        const result = rw.tryWrite(val);
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw exports.errChannelClosed;
            }
            return false;
        }
        else if (result) {
            // 寫入 chan 成功
            return true;
        }
        return new Promise((resolve, reject) => {
            rw.write(resolve, exception ? reject : undefined, val);
        });
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
    tryWrite(val, exception) {
        const rw = this.rw_;
        const result = rw.tryWrite(val);
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw exports.errChannelClosed;
            }
            return false;
        }
        else if (result) {
            // 寫入 chan 成功
            return true;
        }
        // 目前不可寫
        return false;
    }
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    close() {
        return this.rw_.close();
    }
    /**
     * Create a case for select to read
     */
    readCase() {
        return Case.make(this, true);
    }
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    *
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    writeCase(val, exception) {
        return Case.make(this, false, val, exception);
    }
    /**
     * Returns whether the channel is closed
     */
    get isClosed() {
        return this.rw_.isClosed;
    }
    /**
     * Returns the channel buffer size
     */
    get length() {
        return this.rw.length;
    }
    /**
     * Returns how much data the channel has buffered
     */
    get capacity() {
        return this.rw.capacity;
    }
    /**
     * Implement asynchronous iterators
     */
    async *[Symbol.asyncIterator]() {
        while (true) {
            const val = await this.read();
            if (val.done) {
                break;
            }
            yield val.value;
        }
    }
}
exports.Chan = Chan;
/**
 * a ring buffer
 *
 * @internal
 */
class Ring {
    arrs;
    offset_ = 0;
    size_ = 0;
    constructor(arrs) {
        this.arrs = arrs;
    }
    get length() {
        return this.size_;
    }
    get capacity() {
        return this.arrs.length;
    }
    push(val) {
        const arrs = this.arrs;
        const size = this.size_;
        if (size == arrs.length) {
            return false;
        }
        arrs[(this.offset_ + size) % arrs.length] = val;
        this.size_++;
        return true;
    }
    pop() {
        const size = this.size_;
        if (size == 0) {
            return values_1.noResult;
        }
        const val = this.arrs[this.offset_++];
        if (this.offset_ == this.arrs.length) {
            this.offset_ = 0;
        }
        this.size_--;
        return {
            value: val,
        };
    }
}
/**
 * @internal
 */
class RW {
    list;
    constructor(buf) {
        if (buf > 0) {
            this.list = new Ring(new Array(buf));
        }
    }
    r_ = new Reader();
    w_ = new Writer();
    tryRead() {
        // 讀取緩存
        const list = this.list;
        if (list) {
            const result = list.pop();
            if (!result.done) {
                return result;
            }
        }
        // 是否關閉
        if (this.isClosed) {
            return;
        }
        // 讀取 writer
        const w = this.w_;
        if (w.isEmpty) { // 沒有寫入者
            return values_1.noResult;
        }
        return {
            value: w.invoke(),
        };
    }
    read(callback) {
        // 設置待讀
        return this.r_.connect(callback);
    }
    tryWrite(val) {
        if (this.isClosed) {
            return;
        }
        const r = this.r_;
        if (r.isEmpty) { // 沒有讀取者
            // 寫入緩存
            return this.list?.push(val) ?? false;
        }
        r.invoke({
            value: val,
        });
        return true;
    }
    write(callback, reject, val) {
        // 設置待寫
        return this.w_.connect(callback, reject, val);
    }
    close() {
        if (this.isClosed) {
            return false;
        }
        this.isClosed = true;
        this.w_.close();
        this.r_.close();
        return true;
    }
    isClosed = false;
    get length() {
        return this.list?.length ?? 0;
    }
    get capacity() {
        return this.list?.capacity ?? 0;
    }
}
/**
 * shuffle the array
 * @param arrs
 * @returns
 */
function shuffle(arrs) {
    let c = arrs.length, r;
    while (c != 0) {
        r = Math.floor(Math.random() * c);
        c--;
        // swap
        [arrs[c], arrs[r]] = [arrs[r], arrs[c]];
    }
    return arrs;
}
class Reader {
    closed_ = false;
    vals = new Array();
    get isEmpty() {
        return this.vals.length == 0;
    }
    invoke(val) {
        const vals = this.vals;
        switch (vals.length) {
            case 0:
                throw errChannelReaderEmpty;
            case 1:
                vals.pop().invoke(val);
                return;
        }
        const last = vals.length - 1;
        const i = Math.floor(Math.random() * vals.length);
        if (i != last) { //swap to end
            [vals[i], vals[last]] = [vals[last], vals[i]];
        }
        vals.pop().invoke(val);
    }
    close() {
        if (this.closed_) {
            return;
        }
        this.closed_ = true;
        const vals = this.vals;
        if (vals.length != 0) {
            for (const val of vals) {
                val.invoke(values_1.noResult);
            }
            vals.splice(0);
        }
    }
    connect(callback) {
        const val = new ReadValue(this, callback);
        this.vals.push(val);
        return val;
    }
    disconet(val) {
        const vals = this.vals;
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1);
                break;
            }
        }
    }
}
class ReadValue {
    p;
    callback;
    constructor(p, callback) {
        this.p = p;
        this.callback = callback;
    }
    invoke(val) {
        this.callback(val);
    }
    disconet() {
        this.p.disconet(this);
    }
}
class Writer {
    closed_ = false;
    vals = new Array();
    get isEmpty() {
        return this.vals.length == 0;
    }
    invoke() {
        const vals = this.vals;
        switch (vals.length) {
            case 0:
                throw errChannelWriterEmpty;
            case 1:
                const p = vals.pop();
                p.invoke();
                return p.value;
        }
        const last = vals.length - 1;
        const i = Math.floor(Math.random() * vals.length);
        if (i != last) { //swap to end
            [vals[i], vals[last]] = [vals[last], vals[i]];
        }
        const p = vals.pop();
        p.invoke();
        return p.value;
    }
    close() {
        if (this.closed_) {
            return;
        }
        this.closed_ = true;
        const vals = this.vals;
        if (vals.length != 0) {
            for (const val of vals) {
                val.error();
            }
            vals.splice(0);
        }
    }
    connect(callback, reject, val) {
        const result = new WirteValue(this, callback, reject, val);
        this.vals.push(result);
        return result;
    }
    disconet(val) {
        const vals = this.vals;
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1);
                break;
            }
        }
    }
}
class WirteValue {
    p;
    callback;
    reject;
    value;
    constructor(p, callback, reject, value) {
        this.p = p;
        this.callback = callback;
        this.reject = reject;
        this.value = value;
    }
    invoke() {
        this.callback(true);
    }
    error() {
        const reject = this.reject;
        if (reject) {
            try {
                reject(exports.errChannelClosed);
            }
            catch (_) {
            }
        }
        else {
            this.callback(false);
        }
    }
    disconet() {
        this.p.disconet(this);
    }
}
/**
 *
 * @sealed
 */
class Case {
    ch;
    r;
    val;
    exception;
    /**
    * @internal
    */
    static make(ch, r, val, exception) {
        return new Case(ch, r, val, exception);
    }
    constructor(ch, r, val, exception) {
        this.ch = ch;
        this.r = r;
        this.val = val;
        this.exception = exception;
    }
    toString() {
        if (this.r) {
            return JSON.stringify({
                case: 'read',
                ready: this.isReady,
                val: this.read_,
            }, undefined, "\t");
        }
        else {
            return JSON.stringify({
                case: 'write',
                ready: this.isReady,
                val: this.write_,
            }, undefined, "\t");
        }
    }
    /**
     * reset read-write status
     * @internal
     */
    reset() {
        if (this.r) {
            this.read_ = undefined;
        }
        else {
            this.write_ = undefined;
        }
    }
    /**
    * @internal
    */
    tryInvoke() {
        if (this.r) {
            return this._tryRead();
        }
        else {
            return this._tryWrite();
        }
    }
    /**
    * @internal
    */
    do(resolve, reject) {
        const rw = this.ch.rw;
        if (this.r) {
            return rw.read((val) => {
                this.read_ = val;
                resolve(this);
            });
        }
        else {
            return rw.write((ok) => {
                if (ok) {
                    this.write_ = true;
                }
                else {
                    this.write_ = false;
                    if (this.exception) {
                        reject(this);
                        return;
                    }
                }
                resolve(this);
            }, undefined, this.val);
        }
    }
    /**
    * @internal
    */
    invoke() {
        const rw = this.ch.rw;
        if (this.r) {
            return new Promise((resolve) => {
                rw.read((val) => {
                    this.read_ = val;
                    resolve();
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                rw.write((ok) => {
                    if (ok) {
                        this.write_ = true;
                    }
                    else {
                        this.write_ = false;
                        if (this.exception) {
                            reject(exports.errChannelClosed);
                            return;
                        }
                    }
                    resolve();
                }, undefined, this.val);
            });
        }
    }
    _tryWrite() {
        const ch = this.ch;
        const val = ch.tryWrite(this.val, this.exception);
        if (val) {
            this.write_ = true;
            return true;
        }
        else if (ch.isClosed) {
            this.write_ = false;
            return true;
        }
        return false;
    }
    _tryRead() {
        const val = this.ch.tryRead();
        if (val == undefined) {
            return false;
        }
        this.read_ = val;
        return true;
    }
    read_;
    /**
     * Returns the value read by the case, throws an exception if the case is not ready or this is not a read case
     */
    read() {
        const val = this.read_;
        if (val === undefined) {
            throw exports.errChanneReadCase;
        }
        return val;
    }
    write_;
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
     */
    write() {
        const val = this.write_;
        if (val === undefined) {
            throw exports.errChanneWriteCase;
        }
        return val;
    }
    /**
     * Returns whether this case is ready
     */
    get isReady() {
        return this.r ? this.read_ !== undefined : this.write_ !== undefined;
    }
}
exports.Case = Case;
function selectChan(...cases) {
    if (cases.length == 0) {
        // 沒有傳入 case 所以 select 用於阻塞
        return values_1.neverPromise;
    }
    else if (cases.length > 1) {
        shuffle(cases);
    }
    // 重置 case 狀態
    for (const c of cases) {
        c?.reset();
    }
    // 檢查就緒的 case
    let def = false;
    for (const c of cases) {
        if (c === undefined) {
            def = true;
        }
        else {
            // 讀寫 完成
            if (c.tryInvoke()) {
                return c;
            }
        }
    }
    // 沒有就緒 case 但設置了 default，返回 default case
    if (def) {
        return;
    }
    else if (cases.length == 1) {
        // 只有一個 case
        const c = cases[0];
        return c.invoke().then(() => {
            return c;
        });
    }
    // 存在多個 case
    return new Promise((resolve, reject) => {
        const arrs = cases;
        const conns = new Array(arrs.length);
        for (let i = 0; i < arrs.length; i++) {
            conns[i] = arrs[i].do((c) => {
                for (let i = 0; i < conns.length; i++) {
                    conns[i].disconet();
                }
                resolve(c);
            }, () => {
                for (let i = 0; i < conns.length; i++) {
                    conns[i].disconet();
                }
                reject(exports.errChannelClosed);
            });
        }
    });
}
exports.selectChan = selectChan;
//# sourceMappingURL=channel.js.map