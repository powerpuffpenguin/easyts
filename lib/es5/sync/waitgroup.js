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
exports.WaitGroup = void 0;
var completer_1 = require("../core/completer");
var exception_1 = require("../core/exception");
/**
 * A WaitGroup waits for a collection of async process to finish.
 *
 * @remarks
 * The main process calls Add to set the number of async process to wait for. Then each of the async process runs and calls done when finished. At the same time, wait can be used to block until all async process have finished.
 *
 * @sealed
 */
var WaitGroup = /** @class */ (function () {
    function WaitGroup() {
        /**
         * Record how many async awaits are in progress
         */
        this.counter_ = 0;
    }
    Object.defineProperty(WaitGroup.prototype, "counter", {
        get: function () {
            return this.counter_;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If WaitGroup counter is zero return undefined, else return a Promise for waiting until the counter is zero.
     */
    WaitGroup.prototype.wait = function () {
        if (this.counter_ == 0) {
            return undefined;
        }
        var c = this.c_;
        if (c) {
            return c.promise;
        }
        c = new completer_1.Completer();
        this.c_ = c;
        return c.promise;
    };
    /**
     * Add adds delta, which may be negative, to the WaitGroup counter.
     * If the counter becomes zero, all goroutines blocked on Wait are released.
     * If the counter goes negative, Add throws Exception.
     * @param delta WaitGroup.counter += delta
     *
     * @throws {@link Exception}
     */
    WaitGroup.prototype.add = function (delta) {
        if (delta === 0) {
            return;
        }
        var v = Math.floor(delta);
        if (!isFinite(v) || v != delta) {
            throw new exception_1.Exception("delta must be a integer: ".concat(delta));
        }
        v += this.counter_;
        if (v === 0) {
            this.counter_ = v;
            var c = this.c_;
            if (c) {
                this.c_ = undefined;
                c.resolve();
            }
        }
        else if (v < 0) {
            throw new exception_1.Exception("negative WaitGroup counter: ".concat(v));
        }
        else if (!isFinite(v)) {
            throw new exception_1.Exception("invalid WaitGroup counter: ".concat(v));
        }
        else {
            this.counter_ = v;
        }
    };
    /**
     * Done decrements the WaitGroup counter by one.
     *
     * @throws {@link Exception}
     */
    WaitGroup.prototype.done = function () {
        this.add(-1);
    };
    /**
     * Execute function f after counter++, and execute counter-- after function f is done
     * @param f function to execute
     * @param oncompleted function to execute when f is done
     * @returns If a promise is returned, the function f is completed after the promise is executed, otherwise the function f is already completed
     */
    WaitGroup.prototype.do = function (f, oncompleted) {
        this.add(1);
        var result;
        try {
            result = f();
        }
        finally {
            if (result === undefined || result === null) {
                this.add(-1);
                if (oncompleted) {
                    oncompleted();
                }
            }
            else {
                this._do(result);
            }
        }
    };
    WaitGroup.prototype._do = function (result, oncompleted) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, result];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.add(-1);
                        if (oncompleted) {
                            oncompleted();
                        }
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WaitGroup;
}());
exports.WaitGroup = WaitGroup;
//# sourceMappingURL=waitgroup.js.map