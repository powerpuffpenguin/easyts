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
exports.selectChan = exports.Case = exports.Chan = exports.errReadCase = exports.errWriteCase = exports.errReaderEmpty = exports.errWriterEmpty = exports.errNotChan = exports.errClosed = exports.ChannelException = void 0;
const exception_1 = require("./exception");
const values_1 = require("./values");
class ChannelException extends exception_1.Exception {
}
exports.ChannelException = ChannelException;
exports.errClosed = new ChannelException('write on closed channel');
exports.errNotChan = new ChannelException("argument 'chan' not extends from class 'Chan'");
exports.errWriterEmpty = new ChannelException('Writer empty');
exports.errReaderEmpty = new ChannelException('Reader empty');
exports.errWriteCase = new ChannelException('case not ready or unreadable');
exports.errReadCase = new ChannelException('case not ready or unreadable');
class Chan {
    /**
     *
     * @param buf 緩衝大小，如果大於0 則爲 通道啓用緩衝
     */
    constructor(buf = 0) {
        this.rw_ = new RW(Math.floor(buf));
    }
    /*
    * @internal
    */
    get rw() {
        return this.rw_;
    }
    /**
    * 從通道中讀取一個值,如果沒有值可讀則阻塞直到有值會通道被關閉
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
     * 嘗試從管道中讀取一個值，如果沒有值可讀將返回 undefined,，如果管道已經關閉將返回 {done:true}
     * @returns
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
      * 向通道寫入一個值,如果通道不可寫則阻塞直到通道可寫或被關閉
      * @param val
      * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
      * @returns 是否寫入成功，通常只有在通道關閉時才會寫入失敗
      */
    write(val, exception) {
        const rw = this.rw_;
        const result = rw.tryWrite(val);
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw exports.errClosed;
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
     * 嘗試向通道寫入一個值,如果通道不可寫則返回 false
     * @param val
     * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false
     * @returns 是否寫入成功，通道關閉或不可寫都會返回 false
     */
    tryWrite(val, exception) {
        const rw = this.rw_;
        const result = rw.tryWrite(val);
        if (result === undefined) {
            // chan 已經關閉
            if (exception) {
                throw exports.errClosed;
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
     * 關閉通道，此後通道將無法寫入，所有阻塞的讀寫都返回，但已經寫入通道的值會保證可以被完全讀取
     */
    close() {
        return this.rw_.close();
    }
    /**
    * 返回通道是否被關閉
    */
    get isClosed() {
        return this.rw_.isClosed;
    }
    /**
     * 創建一個供 select 讀取的 case
     */
    readCase() {
        return Case.make(this, true);
    }
    /**
     * 創建一個供 select 寫入的 case
    * @param exception 如果在寫入時通道已經關閉，設置此值爲 true 將拋出異常，設置此值爲 false 將返回 false|Promise.resolve(false)
     */
    writeCase(val, exception) {
        return Case.make(this, false, val, exception);
    }
    /**
     * 返回已緩衝數量
     */
    get length() {
        return this.rw.length;
    }
    /**
     * 返回緩衝大小
     */
    get capacity() {
        return this.rw.capacity;
    }
    /**
     * 實現 異步 讀取 迭代器
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
// 一個環形緩衝區
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
        return true;
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
 * 打亂數組
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
        var _a;
        const vals = this.vals;
        if (vals.length == 0) {
            throw exports.errReaderEmpty;
        }
        else if (vals.length > 1) {
            shuffle(vals);
        }
        (_a = vals.pop()) === null || _a === void 0 ? void 0 : _a.invoke(val);
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
        if (vals.length == 0) {
            throw exports.errWriterEmpty;
        }
        else if (vals.length > 1) {
            shuffle(vals);
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
                reject(exports.errClosed);
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
class Case {
    constructor(ch, r, val, exception) {
        this.ch = ch;
        this.r = r;
        this.val = val;
        this.exception = exception;
    }
    /**
    * @internal
    */
    static make(ch, r, val, exception) {
        return new Case(ch, r, val, exception);
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
     * 重置 讀寫狀態
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
    /*
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
    /*
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
    /*
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
                            reject(exports.errClosed);
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
    /**
     * 返回 case 讀取到的值，如果 case 沒有就緒或者這不是一個 讀取 case 將拋出 異常
     * @returns
     */
    read() {
        const val = this.read_;
        if (val === undefined) {
            throw exports.errReadCase;
        }
        return val;
    }
    /**
     * 返回 case 是否寫入成功，如果 case 沒有就緒或者這不是一個 寫入 case 將拋出異常
     * @returns
     */
    write() {
        const val = this.write_;
        if (val === undefined) {
            throw exports.errWriteCase;
        }
        return val;
    }
    /**
     * 返回 此 case 是否就緒
     */
    get isReady() {
        return this.r ? this.read_ !== undefined : this.write_ !== undefined;
    }
}
exports.Case = Case;
/**
 * 等待一個 case 完成
 * @param cases
 * @returns 返回就緒的 case，如果傳入了 undefined，則當沒有任何 case 就緒時返回 undefined ，如果沒有傳入 undefined 且 沒有 case 就緒 則返回 Promise 用於等待第一個就緒的 case
 */
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
                reject(exports.errClosed);
            });
        }
    });
}
exports.selectChan = selectChan;
//# sourceMappingURL=channel.js.map