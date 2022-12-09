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
Object.defineProperty(exports, "__esModule", { value: true });
exports.todo = exports.background = exports.DeadlineExceeded = exports.CanceleException = void 0;
var values_1 = require("../values");
var channel_1 = require("../channel");
var exception_1 = require("../exception");
var CanceleException = /** @class */ (function (_super) {
    __extends(CanceleException, _super);
    function CanceleException(message, opts) {
        var _this = _super.call(this, message !== null && message !== void 0 ? message : 'context canceled', opts) || this;
        _this.canceled = true;
        return _this;
    }
    return CanceleException;
}(exception_1.Exception));
exports.CanceleException = CanceleException;
var DeadlineExceeded = /** @class */ (function (_super) {
    __extends(DeadlineExceeded, _super);
    function DeadlineExceeded(message, opts) {
        var _this = _super.call(this, message !== null && message !== void 0 ? message : 'context deadline exceeded', opts) || this;
        _this.timeout = true;
        _this.temporary = true;
        return _this;
    }
    return DeadlineExceeded;
}(exception_1.Exception));
exports.DeadlineExceeded = DeadlineExceeded;
var EmptyCtx = /** @class */ (function () {
    function EmptyCtx() {
    }
    Object.defineProperty(EmptyCtx.prototype, "deadline", {
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EmptyCtx.prototype, "done", {
        get: function () {
            return channel_1.Chan.never;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EmptyCtx.prototype, "err", {
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    EmptyCtx.prototype.get = function (key) {
        return values_1.noResult;
    };
    EmptyCtx.prototype.toString = function () {
        if (this == EmptyCtx.background) {
            return "context.background";
        }
        else if (this == EmptyCtx.todo) {
            return "context.todo";
        }
        return 'unknown empty Context';
    };
    EmptyCtx.prototype.withValue = function (key, val) {
        return withValue(this, key, val);
    };
    EmptyCtx.prototype.withCancel = function (cancelFunc) {
        return withCancel(this, cancelFunc);
    };
    EmptyCtx.prototype.withTimeout = function (ms, cancelFunc) {
        return withTimeout(this, ms, cancelFunc);
    };
    EmptyCtx.prototype.withDeadline = function (d, cancelFunc) {
        return withDeadline(this, d, cancelFunc);
    };
    Object.defineProperty(EmptyCtx.prototype, "isClosed", {
        get: function () {
            return this.err !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    EmptyCtx.prototype.wait = function () {
        return values_1.neverPromise;
    };
    EmptyCtx.prototype.sleep = function (ms) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(true);
            }, ms);
        });
    };
    EmptyCtx.background = new EmptyCtx();
    EmptyCtx.todo = new EmptyCtx();
    return EmptyCtx;
}());
/**
 * returns a non-nil, empty Context.
 *
 * @remarks
 * It is never canceled, has no values, and has no deadline. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming
 */
function background() {
    return EmptyCtx.background;
}
exports.background = background;
/**
 * TODO returns a non-nil, empty Context.
 *
 * @remarks
 * Code should use context.TODO when it's unclear which Context to use or it is not yet available (because the  surrounding function has not yet been extended to accept a Context parameter).
 */
function todo() {
    return EmptyCtx.todo;
}
exports.todo = todo;
function withValue(parent, key, val) {
    return new ValueCtx(parent, key, val);
}
var ValueCtx = /** @class */ (function () {
    function ValueCtx(parent, key, val) {
        this.parent = parent;
        this.key = key;
        this.val = val;
    }
    Object.defineProperty(ValueCtx.prototype, "deadline", {
        get: function () {
            return this.parent.deadline;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ValueCtx.prototype, "done", {
        get: function () {
            return this.parent.done;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ValueCtx.prototype, "err", {
        get: function () {
            return this.parent.err;
        },
        enumerable: false,
        configurable: true
    });
    ValueCtx.prototype.get = function (key) {
        if (this.key === key) {
            return {
                value: this.val,
            };
        }
        return value(this.parent, key);
    };
    ValueCtx.prototype.toString = function () {
        return "".concat(this.parent, ".WithValue(type ").concat(this.key.name, ", val ").concat(this.val, ")");
    };
    ValueCtx.prototype.withValue = function (key, val) {
        return withValue(this, key, val);
    };
    ValueCtx.prototype.withCancel = function (cancelFunc) {
        return withCancel(this, cancelFunc);
    };
    ValueCtx.prototype.withTimeout = function (ms, cancelFunc) {
        return withTimeout(this, ms, cancelFunc);
    };
    ValueCtx.prototype.withDeadline = function (d, cancelFunc) {
        return withDeadline(this, d, cancelFunc);
    };
    Object.defineProperty(ValueCtx.prototype, "isClosed", {
        get: function () {
            return this.err !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    ValueCtx.prototype.wait = function () {
        return this.parent.wait();
    };
    ValueCtx.prototype.sleep = function (ms) {
        var wait = this.wait();
        if (wait === undefined) {
            return Promise.resolve(false);
        }
        return new Promise(function (resolve) {
            var t = setTimeout(function () {
                resolve(true);
            }, ms);
            wait.then(function () {
                clearTimeout(t);
                resolve(false);
            });
        });
    };
    return ValueCtx;
}());
function withCancel(parent, cancelFunc) {
    var ctx = new CancelCtx(parent);
    propagateCancel(parent, ctx);
    if (cancelFunc) {
        return [ctx, function (reason) { return ctx.cancel(reason); }];
    }
    return ctx;
}
var cancelCtxKey = /** @class */ (function () {
    function cancelCtxKey() {
    }
    return cancelCtxKey;
}());
var CancelCtx = /** @class */ (function () {
    function CancelCtx(parent) {
        this.parent = parent;
    }
    Object.defineProperty(CancelCtx.prototype, "deadline", {
        get: function () {
            return this.parent.deadline;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CancelCtx.prototype, "done", {
        get: function () {
            var d = this.done_;
            if (!d) {
                d = new channel_1.Chan();
                this.done_ = d;
            }
            return d;
        },
        enumerable: false,
        configurable: true
    });
    CancelCtx.prototype._cancel = function (removeFromParent, err) {
        var e_1, _a;
        if (this.err_) {
            return; // already canceled
        }
        this.err_ = err;
        var d = this.done_;
        if (d) {
            d.close();
        }
        else {
            this.done_ = channel_1.Chan.closed;
        }
        var children = this.children_;
        if (children) {
            try {
                for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                    var child = children_1_1.value;
                    child._cancel(false, err);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.children_ = undefined;
        if (removeFromParent) {
            removeChild(this.parent, this);
        }
    };
    CancelCtx.prototype.cancel = function (reason) {
        this._cancel(true, reason !== null && reason !== void 0 ? reason : new CanceleException());
    };
    Object.defineProperty(CancelCtx.prototype, "err", {
        get: function () {
            return this.err_;
        },
        enumerable: false,
        configurable: true
    });
    CancelCtx.prototype.get = function (key) {
        if (cancelCtxKey === key) {
            return {
                value: this,
            };
        }
        return value(this.parent, key);
    };
    CancelCtx.prototype.toString = function () {
        return "".concat(this.parent, ".WithCancel");
    };
    CancelCtx.prototype.withValue = function (key, val) {
        return withValue(this, key, val);
    };
    CancelCtx.prototype.withCancel = function (cancelFunc) {
        return withCancel(this, cancelFunc);
    };
    CancelCtx.prototype.withTimeout = function (ms, cancelFunc) {
        return withTimeout(this, ms, cancelFunc);
    };
    CancelCtx.prototype.withDeadline = function (d, cancelFunc) {
        return withDeadline(this, d, cancelFunc);
    };
    Object.defineProperty(CancelCtx.prototype, "isClosed", {
        get: function () {
            return this.err !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    CancelCtx.prototype.wait = function () {
        return this.done.wait();
    };
    CancelCtx.prototype.sleep = function (ms) {
        var wait = this.wait();
        if (wait === undefined) {
            return Promise.resolve(false);
        }
        return new Promise(function (resolve) {
            var t = setTimeout(function () {
                resolve(true);
            }, ms);
            wait.then(function () {
                clearTimeout(t);
                resolve(false);
            });
        });
    };
    return CancelCtx;
}());
function value(c, key) {
    while (true) {
        if (c instanceof ValueCtx) {
            if (c.key === key) {
                return {
                    value: c.val,
                };
            }
            c = c.parent;
        }
        else if (c instanceof CancelCtx) { // TimerCtx 
            if (cancelCtxKey === key) {
                return {
                    value: c,
                };
            }
            c = c.parent;
        }
        else if (c instanceof EmptyCtx) {
            return values_1.noResult;
        }
        else {
            return c.get(key);
        }
    }
}
function propagateCancel(parent, child) {
    var _this = this;
    var done = parent.done;
    if (done == channel_1.Chan.never) {
        return; // parent is never canceled
    }
    if (done.isClosed) {
        // parent is already canceled
        child._cancel(false, parent.err);
        return;
    }
    var p = parentCancelCtx(parent);
    if (p) {
        if (p.err_ !== undefined) {
            child._cancel(false, p.err_);
        }
        else {
            if (!p.children_) {
                p.children_ = new Set();
            }
            p.children_.add(child);
        }
    }
    else {
        var rp_1 = parent.done.readCase();
        var rc_1 = child.done.readCase();
        (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, channel_1.selectChan)(rp_1, rc_1)];
                    case 1:
                        switch (_a.sent()) {
                            case rp_1:
                                child._cancel(false, parent.err);
                                break;
                            case rc_1:
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    }
}
function parentCancelCtx(parent) {
    var done = parent.done;
    if (done == channel_1.Chan.never || done.isClosed) {
        return;
    }
    var found = parent.get(cancelCtxKey);
    if (found.done) {
        return;
    }
    var p = found.value;
    if (done !== p.done_) {
        return;
    }
    return p;
}
function removeChild(parent, child) {
    var _a;
    var p = parentCancelCtx(parent);
    if (!p) {
        return;
    }
    (_a = p.children_) === null || _a === void 0 ? void 0 : _a.delete(child);
}
function withDeadline(parent, d, cancelFunc) {
    var cur = parent.deadline;
    if (cur && cur.getTime() < d.getTime()) {
        return withCancel(parent, cancelFunc);
    }
    var c = new TimerCtx(parent, d);
    propagateCancel(parent, c);
    var dur = d.getTime() - Date.now();
    if (dur <= 0) {
        c._cancel(true, new DeadlineExceeded()); // deadline has already passed
    }
    else {
        c._serve(dur);
    }
    if (cancelFunc) {
        return [c, function (resaon) { return c.cancel(resaon); }];
    }
    return c;
}
function withTimeout(parent, ms, cancelFunc) {
    return withDeadline(parent, new Date(Date.now() + ms), cancelFunc);
}
var TimerCtx = /** @class */ (function (_super) {
    __extends(TimerCtx, _super);
    function TimerCtx(parent, deadline_) {
        var _this = _super.call(this, parent) || this;
        _this.deadline_ = deadline_;
        return _this;
    }
    TimerCtx.prototype._serve = function (ms) {
        var _this = this;
        this.t_ = setTimeout(function () {
            _this._cancel(true, new DeadlineExceeded());
        }, ms);
    };
    Object.defineProperty(TimerCtx.prototype, "deadline", {
        get: function () {
            return this.deadline_;
        },
        enumerable: false,
        configurable: true
    });
    TimerCtx.prototype._cancel = function (removeFromParent, err) {
        _super.prototype._cancel.call(this, false, err);
        if (removeFromParent) {
            // Remove this timerCtx from its parent cancelCtx's children.
            removeChild(this.parent, this);
        }
        var t = this.t_;
        if (t !== undefined) {
            this.t_ = undefined;
            clearTimeout(t);
        }
    };
    TimerCtx.prototype.cancel = function (reason) {
        this._cancel(true, reason !== null && reason !== void 0 ? reason : new CanceleException());
    };
    TimerCtx.prototype.toString = function () {
        return "".concat(this.parent, ".WithDeadline(").concat(this.deadline_, " [").concat(this.deadline_.getTime() - Date.now(), "ms])");
    };
    return TimerCtx;
}(CancelCtx));
//# sourceMappingURL=context.js.map