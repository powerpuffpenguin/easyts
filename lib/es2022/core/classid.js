"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asClass = exports.isClass = exports.UUID = void 0;
exports.UUID = '591e8619-07d8-4d0d-89ac-b1b9a265afa3';
function isClass(v, t) {
    const target = t.__classid__;
    const ty = typeof target;
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return false;
    }
    if (typeof v !== "object") {
        return false;
    }
    const o = v;
    if (o.__uuid__ !== exports.UUID) {
        return false;
    }
    return o.classid === target;
}
exports.isClass = isClass;
function asClass(v, t) {
    const target = t.__classid__;
    const ty = typeof target;
    if (ty !== "number" && ty !== "bigint" && ty !== "string") {
        return;
    }
    while (typeof v === "object") {
        const o = v;
        if (o.__uuid__ !== exports.UUID) {
            return;
        }
        if (o.__classid_ === target) {
            return o;
        }
        if (typeof o.unwrap === "function") {
            v = o.unwrap();
        }
        else {
            break;
        }
    }
}
exports.asClass = asClass;
//# sourceMappingURL=classid.js.map