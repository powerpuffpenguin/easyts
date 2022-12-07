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
exports.methodForEach = void 0;
/**
 * Add foreach method to GetIterator interface
 *
 * ```
 * class X<T> {
 *  iterator(reverse?: boolean): Iterator<T>
 *  @methodForEach
 *  forEach(callback: ValueCallback<T>, reverse?: boolean): void
 * }
 * ```
 */
function methodForEach(prot, name, desc) {
    desc.value = function (callback, reverse) {
        var _a, e_1, _b;
        var c = this;
        var it = c.iterator(reverse);
        var vals = (_a = {},
            _a[Symbol.iterator] = function () {
                return it;
            },
            _a);
        try {
            for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                var v = vals_1_1.value;
                callback(v);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (vals_1_1 && !vals_1_1.done && (_b = vals_1.return)) _b.call(vals_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
}
exports.methodForEach = methodForEach;
var A = /** @class */ (function () {
    function A() {
    }
    A.prototype.iterator = function (reverse) {
        throw 1;
    };
    A.prototype.forEach = function (callback, reverse) {
        throw 2;
    };
    return A;
}());
var B = /** @class */ (function (_super) {
    __extends(B, _super);
    function B() {
        var _this = _super.call(this) || this;
        _this.id = 1;
        classDecorator(B);
        return _this;
    }
    B.make = function () {
        return new B();
    };
    B.prototype.iterator = function (reverse) {
        var a = '123';
        return a;
    };
    return B;
}(A));
function classDecorator(c) {
    c.prototype.forEach = function (callback, reverse) {
        console.log('foreach', this);
    };
}
// function classDecorator<T extends { new(...args: any[]): C<T> }>(constructor: T) {
//     return class extends constructor {
//         forEach(callback: ValueCallback<T>, reverse?: boolean | undefined): void {
//             console.log(this.iterator())
//         }
//     }
// }
var D = /** @class */ (function (_super) {
    __extends(D, _super);
    function D() {
        return _super.call(this) || this;
    }
    D.prototype.forEach = function () {
        console.log("d");
    };
    return D;
}(B));
var b = B.make();
var c = B.make();
b.forEach(function () { });
b.id = 2;
b.forEach(function () { });
c.forEach(function () { });
var d = new D();
d.forEach();
//# sourceMappingURL=decorator.js.map