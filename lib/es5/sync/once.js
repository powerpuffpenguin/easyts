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
exports.AsyncOnce = exports.Once = void 0;
var async_1 = require("../async");
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
var Once = /** @class */ (function () {
    function Once() {
        this.ok_ = false;
    }
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    Once.prototype.do = function (f) {
        if (this.ok_) {
            return false;
        }
        this.ok_ = true;
        f();
        return true;
    };
    return Once;
}());
exports.Once = Once;
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
var AsyncOnce = /** @class */ (function () {
    function AsyncOnce() {
        this.ok_ = false;
    }
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    AsyncOnce.prototype.do = function (f) {
        if (this.ok_) {
            return false;
        }
        return this._do(f);
    };
    AsyncOnce.prototype._do = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var done, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        done = this.done_;
                        if (!done) return [3 /*break*/, 2];
                        return [4 /*yield*/, done.promise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 2:
                        done = new async_1.Completer();
                        this.done_ = done;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, f()];
                    case 4:
                        _a.sent();
                        this.ok_ = true;
                        done.resolve();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        this.ok_ = true;
                        done.resolve();
                        throw e_1;
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    return AsyncOnce;
}());
exports.AsyncOnce = AsyncOnce;
//# sourceMappingURL=once.js.map