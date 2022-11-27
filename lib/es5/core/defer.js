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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defer = exports.DeferException = void 0;
var exception_1 = require("./exception");
var DeferException = /** @class */ (function (_super) {
    __extends(DeferException, _super);
    /**
     *
     * @param has Set to true if the executed main function throws an exception
     * @param e The exception thrown by the main function
     * @param errs Exception thrown by defer function
     */
    function DeferException(has, e, errs) {
        var _this = _super.call(this, 'DeferException') || this;
        _this.has = has;
        _this.e = e;
        _this.errs = errs;
        return _this;
    }
    /**
     *
     * @internal
     */
    DeferException.make = function (has, e, errs) {
        return new DeferException(has, e, errs);
    };
    /**
     * If the current exception can be converted to the target exception, return the target exception, otherwise return undefined
     * @virtual
     * @override
     */
    DeferException.prototype.as = function (target) {
        var e_1, _a;
        if (this instanceof target) {
            return this;
        }
        try {
            for (var _b = __values(this.errs), _c = _b.next(); !_c.done; _c = _b.next()) {
                var e = _c.value;
                if (e instanceof exception_1.Exception) {
                    var found = e.as(target);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return;
    };
    /**
     *
     * @virtual
     * @override
     */
    DeferException.prototype.is = function (target) {
        var e_2, _a;
        if (this === target) {
            return true;
        }
        try {
            for (var _b = __values(this.errs), _c = _b.next(); !_c.done; _c = _b.next()) {
                var e = _c.value;
                if (e instanceof exception_1.Exception) {
                    if (e.is(target)) {
                        return true;
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return false;
    };
    /**
     *
     * @returns Returns the string description of the exception
     * @override
     */
    DeferException.prototype.error = function () {
        var errs = this.errs;
        if (errs.length == 0) {
            return this.message;
        }
        return errs.join(';');
    };
    return DeferException;
}(exception_1.Exception));
exports.DeferException = DeferException;
/**
 * mock golang defer
 *
 * @remarks
 * defer can register a series of functions. These functions will be automatically executed in the order of first-in, last-out when defer is destroyed. Usually, you can use defer in a function scope to automatically release resources. For example, after a function opens the database, you can 'close the database' register in defer, which ensures that the database will definitely be released when the function ends
 *
 * @example
 * ```
 *  Defer.async(async (d) => {
 *     const db = await openDB() // open resource
 *     // close db
 *     d.defer(async () => await db.close())
 *     const f = await openFile('date.log') // open resource
 *     // close file
 *     d.defer(async () => await f.close())
 *
 *     // some logic code logic
 *     const text = await f.readAll()
 *     const result = await db.set('log', text)
 *
 *     return result // After the function returns, defer will call the registered cleanup function according to the first in, last out
 * })
 * ```
 */
var Defer = /** @class */ (function () {
    function Defer() {
        /**
         * defer funcs
         */
        this.fs_ = new Array();
    }
    /**
     * Execute synchronous process, defer will not wait for any Promise
     */
    Defer.sync = function (f) {
        var d = new Defer();
        var result;
        try {
            result = f(d);
        }
        catch (e) {
            var de = d._syncDone(true, e);
            if (de) {
                throw de;
            }
            else {
                throw e;
            }
        }
        d._syncDone(false);
        return result;
    };
    Defer.prototype._syncDone = function (has, e) {
        var fs = this.fs_;
        var errs = new Array();
        for (var i = fs.length - 1; i >= 0; i--) {
            var f = fs[i];
            if (f.ok) {
                try {
                    f.f.apply(f, __spreadArray([], __read(f.args), false));
                }
                catch (e) {
                    errs.push(e);
                }
            }
        }
        if (errs.length != 0) {
            if (has) {
                return DeferException.make(has, e, errs);
            }
            throw DeferException.make(false, undefined, errs);
        }
    };
    /**
     * Execute an asynchronous process, defer will wait for each Promise to complete before executing the next function
     */
    Defer.async = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var d, result, e_3, de;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        d = new Defer();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, f(d)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        e_3 = _a.sent();
                        return [4 /*yield*/, d._asyncDone(true, e_3)];
                    case 4:
                        de = _a.sent();
                        if (de) {
                            throw de;
                        }
                        else {
                            throw e_3;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, d._asyncDone(false)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Defer.prototype._asyncDone = function (has, e) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, errs, i, f, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fs = this.fs_;
                        errs = new Array();
                        i = fs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 6];
                        f = fs[i];
                        if (!f.ok) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, f.f.apply(f, __spreadArray([], __read(f.args), false))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        errs.push(e_4);
                        return [3 /*break*/, 5];
                    case 5:
                        i--;
                        return [3 /*break*/, 1];
                    case 6:
                        if (errs.length != 0) {
                            if (has) {
                                return [2 /*return*/, DeferException.make(has, e, errs)];
                            }
                            throw DeferException.make(false, undefined, errs);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param f
     */
    Defer.prototype.defer = function (f) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var c = new Func(f, args);
        this.fs_.push(c);
        return c;
    };
    return Defer;
}());
exports.Defer = Defer;
var Func = /** @class */ (function () {
    function Func(f, args) {
        this.f = f;
        this.args = args;
        this.ok = true;
    }
    Func.prototype.cancel = function () {
        this.ok = false;
    };
    return Func;
}());
//# sourceMappingURL=defer.js.map