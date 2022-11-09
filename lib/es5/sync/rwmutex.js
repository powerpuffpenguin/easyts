"use strict";
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
exports.RWMutex = exports.errRWMutexRUnlock = void 0;
var completer_1 = require("../core/completer");
var mutex_1 = require("./mutex");
var exception_1 = require("../core/exception");
exports.errRWMutexRUnlock = new exception_1.Exception('runlock of unrlocked rwmutex');
/**
 * a reader/writer mutual exclusion lock.
 *
 * @remarks
 * The lock can be held by an arbitrary number of readers or a single writer.
 */
var RWMutex = /** @class */ (function () {
    function RWMutex() {
        this.w_ = false;
        this.r_ = 0;
    }
    RWMutex.prototype.tryLock = function () {
        if (this.c_) {
            return false;
        }
        this.w_ = true;
        this.c_ = new completer_1.Completer();
        return true;
    };
    RWMutex.prototype.lock = function () {
        if (this.tryLock()) {
            return;
        }
        return this._lock();
    };
    RWMutex.prototype._lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 3];
                        c = this.c_;
                        if (!c) return [3 /*break*/, 2];
                        return [4 /*yield*/, c.promise];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        this.w_ = true;
                        this.c_ = new completer_1.Completer();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    RWMutex.prototype.unlock = function () {
        if (!this.w_) {
            throw mutex_1.errMutexUnlock;
        }
        this.w_ = false;
        var c = this.c_;
        this.c_ = undefined;
        c.resolve();
    };
    RWMutex.prototype.tryReadLock = function () {
        if (this.r_ != 0) {
            this.r_++;
            return true;
        }
        else if (this.w_) {
            return false;
        }
        this.r_ = 1;
        this.c_ = new completer_1.Completer();
        return true;
    };
    RWMutex.prototype.readLock = function () {
        if (this.tryReadLock()) {
            return;
        }
        return this._readLock();
    };
    RWMutex.prototype._readLock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 3];
                        if (!this.w_) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.c_.promise];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        if (this.c_) {
                            this.r_++;
                        }
                        else {
                            this.r_ = 1;
                            this.c_ = new completer_1.Completer();
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    RWMutex.prototype.readUnlock = function () {
        switch (this.r_) {
            case 0:
                throw exports.errRWMutexRUnlock;
            case 1:
                this.r_ = 0;
                var c = this.c_;
                this.c_ = undefined;
                c.resolve();
                break;
            default:
                this.r_--;
                break;
        }
    };
    return RWMutex;
}());
exports.RWMutex = RWMutex;
//# sourceMappingURL=rwmutex.js.map