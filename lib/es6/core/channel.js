"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectChan = exports.WriteCase = exports.ReadCase = exports.Chan = exports.errChanneReadCase = exports.errChanneWriteCase = exports.errChannelClosed = void 0;
const completer_1 = require("./completer");
const exception_1 = require("./exception");
const values_1 = require("./values");
/**
 * Thrown when writing to a closed channel
 */
exports.errChannelClosed = new exception_1.Exception('write on closed channel');
const errChannelWriterEmpty = new exception_1.Exception('Writer empty');
const errChannelReaderEmpty = new exception_1.Exception('Reader empty');
/**
 * Thrown when case is not writable or not ready
 */
exports.errChanneWriteCase = new exception_1.Exception('case not ready or unwritable');
/**
 * Thrown when case is not readable or not ready
 */
exports.errChanneReadCase = new exception_1.Exception('case not ready or unreadable');
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
     *
     * @params buffered size, if greater than 0 enable buffering for the channel
     */
    constructor(buf = 0) {
        this.rw_ = new RW(Math.floor(buf));
    }
    /**
     * Returns a chan that will never have a value, usually used as some token
     */
    static get never() {
        return Chan.never_ || (Chan.never_ = new Chan());
    }
    /**
    * @internal
    */
    get rw() {
        return this.rw_;
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
     * Wait for chan to close, no data will be read from chan
     */
    wait() {
        return this.rw.wait();
    }
    /**
     * Create a case for select to read
     */
    readCase() {
        return ReadCase.make(this);
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
        return WriteCase.make(this, val, exception);
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
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            while (true) {
                const val = yield __await(this.read());
                if (val.done) {
                    break;
                }
                yield yield __await(val.value);
            }
        });
    }
}
exports.Chan = Chan;
/**
 * a ring buffer
 *
 * @internal
 */
class Ring {
    constructor(arrs) {
        this.arrs = arrs;
        this.offset_ = 0;
        this.size_ = 0;
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
    constructor(buf) {
        this.r_ = new Reader();
        this.w_ = new Writer();
        this.isClosed = false;
        if (buf > 0) {
            this.list = new Ring(new Array(buf));
        }
    }
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
        var _a, _b;
        if (this.isClosed) {
            return;
        }
        const r = this.r_;
        if (r.isEmpty) { // 沒有讀取者
            // 寫入緩存
            return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.push(val)) !== null && _b !== void 0 ? _b : false;
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
        const closed = this.closed_;
        if (closed) {
            this.closed_ = undefined;
            closed.resolve();
        }
        return true;
    }
    wait() {
        if (this.isClosed) {
            return;
        }
        let closed = this.closed_;
        if (closed) {
            return closed.promise;
        }
        closed = new completer_1.Completer();
        this.closed_ = closed;
        return closed.promise;
    }
    get length() {
        var _a, _b;
        return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    get capacity() {
        var _a, _b;
        return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.capacity) !== null && _b !== void 0 ? _b : 0;
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
    constructor() {
        this.closed_ = false;
        this.vals = new Array();
    }
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
    constructor() {
        this.closed_ = false;
        this.vals = new Array();
    }
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
class ReadCase {
    constructor(ch) {
        this.ch = ch;
    }
    /**
     * @internal
     */
    static make(ch) {
        return new ReadCase(ch);
    }
    /**
     * Returns the value read by the case, throws an exception if the case is not ready
     */
    read() {
        const val = this.read_;
        if (val === undefined) {
            throw exports.errChanneReadCase;
        }
        return val;
    }
    /**
     * reset read-write status
     * @internal
     */
    reset() {
        this.read_ = undefined;
    }
    /**
     * Returns whether this case is ready
     */
    get isReady() {
        return this.read_ !== undefined;
    }
    /**
    * @internal
    */
    tryInvoke() {
        const val = this.ch.tryRead();
        if (val === undefined) {
            return false;
        }
        this.read_ = val;
        return true;
    }
    /**
    * @internal
    */
    do(resolve, reject) {
        const rw = this.ch.rw;
        return rw.read((val) => {
            this.read_ = val;
            resolve(this);
        });
    }
    /**
    * @internal
    */
    invoke() {
        const rw = this.ch.rw;
        return new Promise((resolve) => {
            rw.read((val) => {
                this.read_ = val;
                resolve();
            });
        });
    }
}
exports.ReadCase = ReadCase;
/**
 *
 * @sealed
 */
class WriteCase {
    constructor(ch, val, exception) {
        this.ch = ch;
        this.val = val;
        this.exception = exception;
    }
    /**
    * @internal
    */
    static make(ch, val, exception) {
        return new WriteCase(ch, val, exception);
    }
    /**
     * reset read-write status
     * @internal
     */
    reset() {
        this.write_ = undefined;
    }
    /**
    * @internal
    */
    tryInvoke() {
        const ch = this.ch;
        const val = ch.tryWrite(this.val, false);
        if (val) {
            this.write_ = true;
            return true;
        }
        else if (ch.isClosed) {
            this.write_ = false;
            if (this.exception) {
                throw exports.errChannelClosed;
            }
            return true;
        }
        return false;
    }
    /**
    * @internal
    */
    do(resolve, reject) {
        const rw = this.ch.rw;
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
    /**
    * @internal
    */
    invoke() {
        const rw = this.ch.rw;
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
        return this.write_ !== undefined;
    }
}
exports.WriteCase = WriteCase;
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
        c === null || c === void 0 ? void 0 : c.reset();
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
        const conns = new Array(cases.length);
        for (let i = 0; i < cases.length; i++) {
            conns[i] = cases[i].do((c) => {
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