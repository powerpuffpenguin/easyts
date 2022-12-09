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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = exports.Completer = void 0;
var decorator_1 = require("./internal/decorator");
/**
 * Create a Promise with a completion marker
 *
 * @remarks
 * Completer is inspired by dart, it can be used to return the same piece of data for the same asynchronous request. For example, you have a database singleton that only returns the same connection when the database is actually requested.
 *
 * @example
 * Suppose we have a connect function that creates a connection to the database and its signature looks like this `function connectDB():Promise<DB>`.
 * We can use the Completer wrapper to create only one connection
 * ```
* class Helper {
 *     private constructor() { }
 *     private static db_?: Completer<DB>
 *     static async db(): Promise<DB> {
 *         const db = Helper.db_
 *         if (db) {
 *             // connecting, return the promise of the connection
 *             return db.promise
 *         }
 *         // no connection, create a new connection
 *         const completer = new Completer<DB>()
 *         Helper.db_ = completer // locked
 *         try {
 *             const val = await connectDB()
 *             completer.resolve(val) // complete success
 *         } catch (e) {
 *             Helper.db_ = undefined // unlocked to allow subsequent calls to retry the operation
 *
 *             completer.reject(e) // complete error
 *         }
 *         return completer.promise
 *     }
 * }
 * ```
 */
var Completer = /** @class */ (function () {
    function Completer() {
        var _this = this;
        this.c_ = false;
        this.promise_ = new Promise(function (resolve, reject) {
            _this.resolve_ = resolve;
            _this.reject_ = reject;
        });
    }
    Object.defineProperty(Completer.prototype, "isCompleted", {
        /**
         * Returns whether the Promise has completed
         */
        get: function () {
            return this.c_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Completer.prototype, "promise", {
        /**
         * Returns the created Promise
         */
        get: function () {
            return this.promise_;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Complete success, Promise.resolve(value)
     * @param value
     */
    Completer.prototype.resolve = function (value) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.resolve_) {
            this.resolve_(value);
        }
    };
    /**
     * Complete error, Promise.reject(reason)
     * @param reason
     */
    Completer.prototype.reject = function (reason) {
        if (this.c_) {
            return;
        }
        this.c_ = true;
        if (this.reject_) {
            this.reject_(reason);
        }
    };
    return Completer;
}());
exports.Completer = Completer;
/**
 * an asynchronous asset
 */
var Asset = /** @class */ (function () {
    function Asset() {
        this.ok_ = false;
    }
    Asset.make = function (callback) {
        return new _Asset(callback);
    };
    Object.defineProperty(Asset.prototype, "asset", {
        get: function () {
            var _this = this;
            if (this.ok_) {
                return this.asset_;
            }
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                var done, val, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            done = this.done_;
                            if (done) {
                                return [2 /*return*/, done.promise];
                            }
                            done = new Completer();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this._load()];
                        case 2:
                            val = _a.sent();
                            this.ok_ = true;
                            this.asset_ = val;
                            done.resolve(val);
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.done_ = undefined;
                            done.reject(e_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/, done.promise];
                    }
                });
            }); })();
        },
        enumerable: false,
        configurable: true
    });
    Asset.prototype._load = function () {
        throw new EvalError((0, decorator_1.notImplement)(this.constructor.name, 'protected _load(): Promise<T>'));
    };
    return Asset;
}());
exports.Asset = Asset;
var _Asset = /** @class */ (function (_super) {
    __extends(_Asset, _super);
    function _Asset(callback) {
        var _this = _super.call(this) || this;
        _this.callback = callback;
        return _this;
    }
    _Asset.prototype._load = function () {
        var callback = this.callback;
        return callback();
    };
    return _Asset;
}(Asset));
//# sourceMappingURL=async.js.map