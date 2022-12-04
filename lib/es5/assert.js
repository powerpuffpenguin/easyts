"use strict";
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
exports.assertAny = exports.assertUInt = exports.assertInt = exports.assertNumber = exports.throwNumber = exports.throwType = void 0;
function throwType(val, typeName) {
    if (val.message !== undefined) {
        throw new TypeError(val.message);
    }
    if (val.name === undefined) {
        throw new TypeError("expects ".concat(typeName, " type"));
    }
    throw "argument '".concat(val.name, "' expects ").concat(typeName, " type");
}
exports.throwType = throwType;
function throwNumber(val, typeName, min) {
    if (val.message !== undefined) {
        throw new RangeError(val.message);
    }
    if (min) {
        if (val.name === undefined) {
            throw new RangeError("expects ".concat(typeName, " value >= ").concat(val.min, ", but it = ").concat(JSON.stringify(val.val)));
        }
        throw new RangeError("argument ".concat(val.name, " expects ").concat(typeName, " value >= ").concat(val.min, ", but it = ").concat(JSON.stringify(val.val)));
    }
    else {
        if (val.name === undefined) {
            throw new RangeError("expects ".concat(typeName, " value <= ").concat(val.max, ", but it = ").concat(JSON.stringify(val.val)));
        }
        throw new RangeError("argument ".concat(val.name, " expects ").concat(typeName, " value <= ").concat(val.max, ", but it = ").concat(JSON.stringify(val.val)));
    }
}
exports.throwNumber = throwNumber;
function assertNumber() {
    var e_1, _a;
    var vals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        vals[_i] = arguments[_i];
    }
    try {
        for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
            var val = vals_1_1.value;
            var v = val.val;
            if (Number.isFinite(v)) {
                if (Number.isFinite(val.min)) {
                    if (v < val.min) {
                        throwNumber(val, "number", true);
                    }
                }
                if (Number.isFinite(val.max)) {
                    if (v > val.max) {
                        throwNumber(val, "number", false);
                    }
                }
            }
            else {
                throwType(val, "number");
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (vals_1_1 && !vals_1_1.done && (_a = vals_1.return)) _a.call(vals_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.assertNumber = assertNumber;
function assertInt() {
    var e_2, _a;
    var vals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        vals[_i] = arguments[_i];
    }
    try {
        for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
            var val = vals_2_1.value;
            var v = val.val;
            if (Number.isSafeInteger(v)) {
                if (Number.isFinite(val.min)) {
                    if (v < val.min) {
                        throwNumber(val, "int", true);
                    }
                }
                if (Number.isFinite(val.max)) {
                    if (v > val.max) {
                        throwNumber(val, "int", false);
                    }
                }
            }
            else {
                throwType(val, "int");
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (vals_2_1 && !vals_2_1.done && (_a = vals_2.return)) _a.call(vals_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
exports.assertInt = assertInt;
function assertUInt() {
    var e_3, _a;
    var vals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        vals[_i] = arguments[_i];
    }
    try {
        for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
            var val = vals_3_1.value;
            var v = val.val;
            if (Number.isSafeInteger(v) && v >= 0) {
                if (Number.isFinite(val.min)) {
                    if (v < val.min) {
                        throwNumber(val, "uint", true);
                    }
                }
                if (Number.isFinite(val.max)) {
                    if (v > val.max) {
                        throwNumber(val, "uint", false);
                    }
                }
            }
            else {
                throwType(val, "uint");
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (vals_3_1 && !vals_3_1.done && (_a = vals_3.return)) _a.call(vals_3);
        }
        finally { if (e_3) throw e_3.error; }
    }
}
exports.assertUInt = assertUInt;
function assertAny(assert) {
    var e_4, _a;
    var vals = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        vals[_i - 1] = arguments[_i];
    }
    try {
        for (var vals_4 = __values(vals), vals_4_1 = vals_4.next(); !vals_4_1.done; vals_4_1 = vals_4.next()) {
            var v = vals_4_1.value;
            assert(v);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (vals_4_1 && !vals_4_1.done && (_a = vals_4.return)) _a.call(vals_4);
        }
        finally { if (e_4) throw e_4.error; }
    }
}
exports.assertAny = assertAny;
//# sourceMappingURL=assert.js.map