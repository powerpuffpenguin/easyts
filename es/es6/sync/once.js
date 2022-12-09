var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Completer } from "../async";
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
export class Once {
    constructor() {
        this.ok_ = false;
    }
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f) {
        if (this.ok_) {
            return false;
        }
        this.ok_ = true;
        f();
        return true;
    }
}
/**
 * an object that will perform exactly one action.
 *
 * @sealed
 */
export class AsyncOnce {
    constructor() {
        this.ok_ = false;
    }
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once.
     *
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation.
     */
    do(f) {
        if (this.ok_) {
            return false;
        }
        return this._do(f);
    }
    _do(f) {
        return __awaiter(this, void 0, void 0, function* () {
            let done = this.done_;
            if (done) {
                yield done.promise;
                return false;
            }
            done = new Completer();
            this.done_ = done;
            try {
                yield f();
                this.ok_ = true;
                done.resolve();
            }
            catch (e) {
                this.ok_ = true;
                done.resolve();
                throw e;
            }
            return true;
        });
    }
}
//# sourceMappingURL=once.js.map