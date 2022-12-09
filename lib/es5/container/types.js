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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basic = void 0;
var exception_1 = require("../exception");
var types_1 = require("../types");
var decorator_1 = require("../internal/decorator");
/**
 * The base class of the container implements some common methods for the container
 */
var Basic = /** @class */ (function (_super) {
    __extends(Basic, _super);
    function Basic(opts) {
        var _this = _super.call(this) || this;
        _this.opts_ = opts;
        (0, decorator_1.classForEach)(Basic);
        return _this;
    }
    Object.defineProperty(Basic.prototype, "capacity", {
        /**
         * Returns the current capacity of the container
         *
         * @virtual
         */
        get: function () {
            throw new exception_1.Exception('function capacity not implemented');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isEmpty", {
        /**
         * Returns true if there is no data in the container
         *
         * @virtual
         */
        get: function () {
            return this.length == 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isNotEmpty", {
        /**
         * Returns true if there is data in the container
         *
         * @virtual
         */
        get: function () {
            return this.length != 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isFull", {
        /**
         * Returns true if the container has reached the container limit
         *
         * @virtual
         */
        get: function () {
            return this.length == this.capacity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Basic.prototype, "isNotFull", {
        /**
         * Returns true if the container has not reached the container limit
         *
         * @virtual
         */
        get: function () {
            return this.length < this.capacity;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     *
     * @virtual
     *
     */
    Basic.prototype.iterator = function (reverse) {
        throw new exception_1.Exception('function iterator not implemented');
    };
    /**
     * Returns true if the data depth of the two containers is consistent
     *
     * @param o
     *
     * @virtual
     */
    Basic.prototype.compareTo = function (o, callback) {
        var _a;
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.compare;
        var l = this.iterator(true);
        var r = o.iterator(true);
        while (true) {
            var v0 = l.next();
            var v1 = r.next();
            if (v0.done) {
                if (!v1.done) {
                    return -1;
                }
                break;
            }
            else if (v1.done) {
                return 1;
            }
            var v = (0, types_1.compare)(v0.value, v1.value, callback);
            if (v != 0) {
                return v;
            }
        }
        return 0;
    };
    /**
     * implements js Iterable
     * @sealedl
     */
    Basic.prototype[Symbol.iterator] = function () {
        return this.iterator();
    };
    Object.defineProperty(Basic.prototype, "reverse", {
        /**
         * Returns an object that implements a js Iterable, but it traverses the data in reverse
         * @sealed
         */
        get: function () {
            var _a;
            var i = this.iterator(true);
            return _a = {},
                _a[Symbol.iterator] = function () {
                    return i;
                },
                _a;
        },
        enumerable: false,
        configurable: true
    });
    return Basic;
}(decorator_1.ClassForEach));
exports.Basic = Basic;
//# sourceMappingURL=types.js.map