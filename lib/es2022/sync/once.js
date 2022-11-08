"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Once = void 0;
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
class Once {
    c_ = false;
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f) {
        if (this.c_) {
            return false;
        }
        this.c_ = true;
        f();
        return true;
    }
}
exports.Once = Once;
//# sourceMappingURL=once.js.map