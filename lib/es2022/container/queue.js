"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const values_1 = require("../core/values");
/**
 * A queue implemented using fixed-length arrays
 */
class Queue {
    arrs;
    offset_ = 0;
    size_ = 0;
    constructor(arrs) {
        this.arrs = arrs;
    }
    get length() {
        return this.size_;
    }
    get capacity() {
        return this.arrs.length;
    }
    push(val) {
        const arrs = this.arrs;
        const size = this.size_;
        if (size == arrs.length) {
            return false;
        }
        arrs[(this.offset_ + size) % arrs.length] = val;
        this.size_++;
        return true;
    }
    pop() {
        const size = this.size_;
        if (size == 0) {
            return values_1.noResult;
        }
        const val = this.arrs[this.offset_++];
        if (this.offset_ == this.arrs.length) {
            this.offset_ = 0;
        }
        this.size_--;
        return {
            value: val,
        };
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map