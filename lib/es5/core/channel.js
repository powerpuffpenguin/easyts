"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectChan = exports.Case = exports.Chan = exports.errChanneReadCase = exports.errChanneWriteCase = exports.errChannelClosed = exports.ChannelException = void 0;
var exception_1 = require("./exception");
var values_1 = require("./values");
/**
 * Exceptions thrown by Channel operations
 */
var ChannelException = /** @class */ (function (_super) {
    __extends(ChannelException, _super);
    function ChannelException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ChannelException;
}(exception_1.Exception));
exports.ChannelException = ChannelException;
/**
 * Thrown when writing to a closed channel
 */
exports.errChannelClosed = new ChannelException('write on closed channel');
var errChannelWriterEmpty = new ChannelException('Writer empty');
var errChannelReaderEmpty = new ChannelException('Reader empty');
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
var Chan = /** @class */ (function () {
    /**
     *
     * @params buffered size, if greater than 0 enable buffering for the channel
     */
    function Chan(buf) {
        if (buf === void 0) { buf = 0; }
        this.rw_ = new RW(Math.floor(buf));
    }
    Object.defineProperty(Chan.prototype, "rw", {
        /**
        * @internal
        */
        get: function () {
            return this.rw_;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Read a value from the channel, block if there is no value to read, and return until there is a value or the channel is closed
     */
    Chan.prototype.read = function () {
        var rw = this.rw_;
        var val = rw.tryRead();
        if (val === undefined) {
            // chan 已經關閉
            return values_1.noResult;
        }
        else if (!val.done) {
            // 返回讀取到的值
            return val;
        }
        return new Promise(function (resolve) {
            rw.read(resolve);
        });
    };
    /**
     * Attempts to read a value from the channel, returns undefined if no value is readable, returns \{done:true\} if the channel is closed
     */
    Chan.prototype.tryRead = function () {
        var rw = this.rw_;
        var val = rw.tryRead();
        if (val === undefined) {
            // chan 已經關閉
            return values_1.noResult;
        }
        else if (!val.done) {
            // 返回讀取到的值
            return val;
        }
        return undefined;
    };
    /**
      * Writes a value to the channel, blocking if the channel is not writable until the channel is writable or closed
      * @param val value to write
      * @param exception If set to true, writing to a closed channel will throw an exception
      * @returns Returns true if the write is successful, false otherwise this is usually because the channel has been closed
      *
      * @throws ChannelException
      * Writing a value to a closed channel will throw errChannelClosed
      */
    Chan.prototype.write = function (val, exception) {
        var rw = this.rw_;
        var result = rw.tryWrite(val);
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
        return new Promise(function (resolve, reject) {
            rw.write(resolve, exception ? reject : undefined, val);
        });
    };
    /**
     * Attempt to write a value to the channel
     * @param val value to write
     * @param exception If set to true, writing to a closed channel will throw an exception
    * @returns Returns true if the write is successful
    *
    * @throws ChannelException
    * Writing a value to a closed channel will throw errChannelClosed
    */
    Chan.prototype.tryWrite = function (val, exception) {
        var rw = this.rw_;
        var result = rw.tryWrite(val);
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
    };
    /**
     * Close the channel, after which the channel will not be able to write, all blocked reads and writes are returned, but the value that has been written to the channel is guaranteed to be fully read
     * @returns Returns false if the channel has been closed, otherwise closes the channel and returns true
     */
    Chan.prototype.close = function () {
        return this.rw_.close();
    };
    /**
     * Create a case for select to read
     */
    Chan.prototype.readCase = function () {
        return Case.make(this, true);
    };
    /**
    * Create a case for select to write to
    * @param val value to write
    * @param exception If set to true, writing to a closed channel will throw an exception
    *
    * @throws ChannelException
    * Writing a value to a closed channel, select will throw errChannelClosed
    */
    Chan.prototype.writeCase = function (val, exception) {
        return Case.make(this, false, val, exception);
    };
    Object.defineProperty(Chan.prototype, "isClosed", {
        /**
         * Returns whether the channel is closed
         */
        get: function () {
            return this.rw_.isClosed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chan.prototype, "length", {
        /**
         * Returns the channel buffer size
         */
        get: function () {
            return this.rw.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chan.prototype, "capacity", {
        /**
         * Returns how much data the channel has buffered
         */
        get: function () {
            return this.rw.capacity;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Implement asynchronous iterators
     */
    Chan.prototype[Symbol.asyncIterator] = function () {
        return __asyncGenerator(this, arguments, function _a() {
            var val;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, __await(this.read())];
                    case 1:
                        val = _b.sent();
                        if (val.done) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, __await(val.value)];
                    case 2: return [4 /*yield*/, _b.sent()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Chan;
}());
exports.Chan = Chan;
/**
 * a ring buffer
 *
 * @internal
 */
var Ring = /** @class */ (function () {
    function Ring(arrs) {
        this.arrs = arrs;
        this.offset_ = 0;
        this.size_ = 0;
    }
    Object.defineProperty(Ring.prototype, "length", {
        get: function () {
            return this.size_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ring.prototype, "capacity", {
        get: function () {
            return this.arrs.length;
        },
        enumerable: false,
        configurable: true
    });
    Ring.prototype.push = function (val) {
        var arrs = this.arrs;
        var size = this.size_;
        if (size == arrs.length) {
            return false;
        }
        arrs[(this.offset_ + size) % arrs.length] = val;
        this.size_++;
        return true;
    };
    Ring.prototype.pop = function () {
        var size = this.size_;
        if (size == 0) {
            return values_1.noResult;
        }
        var val = this.arrs[this.offset_++];
        if (this.offset_ == this.arrs.length) {
            this.offset_ = 0;
        }
        this.size_--;
        return {
            value: val,
        };
    };
    return Ring;
}());
/**
 * @internal
 */
var RW = /** @class */ (function () {
    function RW(buf) {
        this.r_ = new Reader();
        this.w_ = new Writer();
        this.isClosed = false;
        if (buf > 0) {
            this.list = new Ring(new Array(buf));
        }
    }
    RW.prototype.tryRead = function () {
        // 讀取緩存
        var list = this.list;
        if (list) {
            var result = list.pop();
            if (!result.done) {
                return result;
            }
        }
        // 是否關閉
        if (this.isClosed) {
            return;
        }
        // 讀取 writer
        var w = this.w_;
        if (w.isEmpty) { // 沒有寫入者
            return values_1.noResult;
        }
        return {
            value: w.invoke(),
        };
    };
    RW.prototype.read = function (callback) {
        // 設置待讀
        return this.r_.connect(callback);
    };
    RW.prototype.tryWrite = function (val) {
        var _a, _b;
        if (this.isClosed) {
            return;
        }
        var r = this.r_;
        if (r.isEmpty) { // 沒有讀取者
            // 寫入緩存
            return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.push(val)) !== null && _b !== void 0 ? _b : false;
        }
        r.invoke({
            value: val,
        });
        return true;
    };
    RW.prototype.write = function (callback, reject, val) {
        // 設置待寫
        return this.w_.connect(callback, reject, val);
    };
    RW.prototype.close = function () {
        if (this.isClosed) {
            return false;
        }
        this.isClosed = true;
        this.w_.close();
        this.r_.close();
        return true;
    };
    Object.defineProperty(RW.prototype, "length", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RW.prototype, "capacity", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.capacity) !== null && _b !== void 0 ? _b : 0;
        },
        enumerable: false,
        configurable: true
    });
    return RW;
}());
/**
 * shuffle the array
 * @param arrs
 * @returns
 */
function shuffle(arrs) {
    var _a;
    var c = arrs.length, r;
    while (c != 0) {
        r = Math.floor(Math.random() * c);
        c--;
        // swap
        _a = __read([arrs[r], arrs[c]], 2), arrs[c] = _a[0], arrs[r] = _a[1];
    }
    return arrs;
}
var Reader = /** @class */ (function () {
    function Reader() {
        this.closed_ = false;
        this.vals = new Array();
    }
    Object.defineProperty(Reader.prototype, "isEmpty", {
        get: function () {
            return this.vals.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    Reader.prototype.invoke = function (val) {
        var _a;
        var vals = this.vals;
        if (vals.length == 0) {
            throw errChannelReaderEmpty;
        }
        else if (vals.length > 1) {
            shuffle(vals);
        }
        (_a = vals.pop()) === null || _a === void 0 ? void 0 : _a.invoke(val);
    };
    Reader.prototype.close = function () {
        var e_1, _a;
        if (this.closed_) {
            return;
        }
        this.closed_ = true;
        var vals = this.vals;
        if (vals.length != 0) {
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var val = vals_1_1.value;
                    val.invoke(values_1.noResult);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            vals.splice(0);
        }
    };
    Reader.prototype.connect = function (callback) {
        var val = new ReadValue(this, callback);
        this.vals.push(val);
        return val;
    };
    Reader.prototype.disconet = function (val) {
        var vals = this.vals;
        for (var i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1);
                break;
            }
        }
    };
    return Reader;
}());
var ReadValue = /** @class */ (function () {
    function ReadValue(p, callback) {
        this.p = p;
        this.callback = callback;
    }
    ReadValue.prototype.invoke = function (val) {
        this.callback(val);
    };
    ReadValue.prototype.disconet = function () {
        this.p.disconet(this);
    };
    return ReadValue;
}());
var Writer = /** @class */ (function () {
    function Writer() {
        this.closed_ = false;
        this.vals = new Array();
    }
    Object.defineProperty(Writer.prototype, "isEmpty", {
        get: function () {
            return this.vals.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    Writer.prototype.invoke = function () {
        var vals = this.vals;
        if (vals.length == 0) {
            throw errChannelWriterEmpty;
        }
        else if (vals.length > 1) {
            shuffle(vals);
        }
        var p = vals.pop();
        p.invoke();
        return p.value;
    };
    Writer.prototype.close = function () {
        var e_2, _a;
        if (this.closed_) {
            return;
        }
        this.closed_ = true;
        var vals = this.vals;
        if (vals.length != 0) {
            try {
                for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                    var val = vals_2_1.value;
                    val.error();
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (vals_2_1 && !vals_2_1.done && (_a = vals_2.return)) _a.call(vals_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            vals.splice(0);
        }
    };
    Writer.prototype.connect = function (callback, reject, val) {
        var result = new WirteValue(this, callback, reject, val);
        this.vals.push(result);
        return result;
    };
    Writer.prototype.disconet = function (val) {
        var vals = this.vals;
        for (var i = 0; i < vals.length; i++) {
            if (vals[i] == val) {
                vals.splice(i, 1);
                break;
            }
        }
    };
    return Writer;
}());
var WirteValue = /** @class */ (function () {
    function WirteValue(p, callback, reject, value) {
        this.p = p;
        this.callback = callback;
        this.reject = reject;
        this.value = value;
    }
    WirteValue.prototype.invoke = function () {
        this.callback(true);
    };
    WirteValue.prototype.error = function () {
        var reject = this.reject;
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
    };
    WirteValue.prototype.disconet = function () {
        this.p.disconet(this);
    };
    return WirteValue;
}());
/**
 *
 * @sealed
 */
var Case = /** @class */ (function () {
    function Case(ch, r, val, exception) {
        this.ch = ch;
        this.r = r;
        this.val = val;
        this.exception = exception;
    }
    /**
    * @internal
    */
    Case.make = function (ch, r, val, exception) {
        return new Case(ch, r, val, exception);
    };
    Case.prototype.toString = function () {
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
    };
    /**
     * reset read-write status
     * @internal
     */
    Case.prototype.reset = function () {
        if (this.r) {
            this.read_ = undefined;
        }
        else {
            this.write_ = undefined;
        }
    };
    /**
    * @internal
    */
    Case.prototype.tryInvoke = function () {
        if (this.r) {
            return this._tryRead();
        }
        else {
            return this._tryWrite();
        }
    };
    /**
    * @internal
    */
    Case.prototype.do = function (resolve, reject) {
        var _this = this;
        var rw = this.ch.rw;
        if (this.r) {
            return rw.read(function (val) {
                _this.read_ = val;
                resolve(_this);
            });
        }
        else {
            return rw.write(function (ok) {
                if (ok) {
                    _this.write_ = true;
                }
                else {
                    _this.write_ = false;
                    if (_this.exception) {
                        reject(_this);
                        return;
                    }
                }
                resolve(_this);
            }, undefined, this.val);
        }
    };
    /**
    * @internal
    */
    Case.prototype.invoke = function () {
        var _this = this;
        var rw = this.ch.rw;
        if (this.r) {
            return new Promise(function (resolve) {
                rw.read(function (val) {
                    _this.read_ = val;
                    resolve();
                });
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                rw.write(function (ok) {
                    if (ok) {
                        _this.write_ = true;
                    }
                    else {
                        _this.write_ = false;
                        if (_this.exception) {
                            reject(exports.errChannelClosed);
                            return;
                        }
                    }
                    resolve();
                }, undefined, _this.val);
            });
        }
    };
    Case.prototype._tryWrite = function () {
        var ch = this.ch;
        var val = ch.tryWrite(this.val, this.exception);
        if (val) {
            this.write_ = true;
            return true;
        }
        else if (ch.isClosed) {
            this.write_ = false;
            return true;
        }
        return false;
    };
    Case.prototype._tryRead = function () {
        var val = this.ch.tryRead();
        if (val == undefined) {
            return false;
        }
        this.read_ = val;
        return true;
    };
    /**
     * Returns the value read by the case, throws an exception if the case is not ready or this is not a read case
     */
    Case.prototype.read = function () {
        var val = this.read_;
        if (val === undefined) {
            throw exports.errChanneReadCase;
        }
        return val;
    };
    /**
     * Returns whether the case was written successfully, throws an exception if the case is not ready or this is not a write case
     */
    Case.prototype.write = function () {
        var val = this.write_;
        if (val === undefined) {
            throw exports.errChanneWriteCase;
        }
        return val;
    };
    Object.defineProperty(Case.prototype, "isReady", {
        /**
         * Returns whether this case is ready
         */
        get: function () {
            return this.r ? this.read_ !== undefined : this.write_ !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    return Case;
}());
exports.Case = Case;
function selectChan() {
    var e_3, _a, e_4, _b;
    var cases = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cases[_i] = arguments[_i];
    }
    if (cases.length == 0) {
        // 沒有傳入 case 所以 select 用於阻塞
        return values_1.neverPromise;
    }
    else if (cases.length > 1) {
        shuffle(cases);
    }
    try {
        // 重置 case 狀態
        for (var cases_1 = __values(cases), cases_1_1 = cases_1.next(); !cases_1_1.done; cases_1_1 = cases_1.next()) {
            var c = cases_1_1.value;
            c === null || c === void 0 ? void 0 : c.reset();
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (cases_1_1 && !cases_1_1.done && (_a = cases_1.return)) _a.call(cases_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    // 檢查就緒的 case
    var def = false;
    try {
        for (var cases_2 = __values(cases), cases_2_1 = cases_2.next(); !cases_2_1.done; cases_2_1 = cases_2.next()) {
            var c = cases_2_1.value;
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
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (cases_2_1 && !cases_2_1.done && (_b = cases_2.return)) _b.call(cases_2);
        }
        finally { if (e_4) throw e_4.error; }
    }
    // 沒有就緒 case 但設置了 default，返回 default case
    if (def) {
        return;
    }
    else if (cases.length == 1) {
        // 只有一個 case
        var c_1 = cases[0];
        return c_1.invoke().then(function () {
            return c_1;
        });
    }
    // 存在多個 case
    return new Promise(function (resolve, reject) {
        var arrs = cases;
        var conns = new Array(arrs.length);
        for (var i = 0; i < arrs.length; i++) {
            conns[i] = arrs[i].do(function (c) {
                for (var i_1 = 0; i_1 < conns.length; i_1++) {
                    conns[i_1].disconet();
                }
                resolve(c);
            }, function () {
                for (var i_2 = 0; i_2 < conns.length; i_2++) {
                    conns[i_2].disconet();
                }
                reject(exports.errChannelClosed);
            });
        }
    });
}
exports.selectChan = selectChan;
//# sourceMappingURL=channel.js.map