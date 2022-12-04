"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAny = exports.assertUInt = exports.assertInt = exports.assertNumber = exports.throwNumber = exports.throwType = void 0;
function throwType(val, typeName) {
    if (val.message !== undefined) {
        throw new TypeError(val.message);
    }
    if (val.name === undefined) {
        throw new TypeError(`expects ${typeName} type`);
    }
    throw `argument '${val.name}' expects ${typeName} type`;
}
exports.throwType = throwType;
function throwNumber(val, typeName, min) {
    if (val.message !== undefined) {
        throw new RangeError(val.message);
    }
    if (min) {
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value >= ${val.min}, but it = ${JSON.stringify(val.val)}`);
        }
        throw new RangeError(`argument ${val.name} expects ${typeName} value >= ${val.min}, but it = ${JSON.stringify(val.val)}`);
    }
    else {
        if (val.name === undefined) {
            throw new RangeError(`expects ${typeName} value <= ${val.max}, but it = ${JSON.stringify(val.val)}`);
        }
        throw new RangeError(`argument ${val.name} expects ${typeName} value <= ${val.max}, but it = ${JSON.stringify(val.val)}`);
    }
}
exports.throwNumber = throwNumber;
function assertNumber(...vals) {
    for (const val of vals) {
        const v = val.val;
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
exports.assertNumber = assertNumber;
function assertInt(...vals) {
    for (const val of vals) {
        const v = val.val;
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
exports.assertInt = assertInt;
function assertUInt(...vals) {
    for (const val of vals) {
        const v = val.val;
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
exports.assertUInt = assertUInt;
function assertAny(assert, ...vals) {
    for (const v of vals) {
        assert(v);
    }
}
exports.assertAny = assertAny;
//# sourceMappingURL=assert.js.map