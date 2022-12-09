"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heap = exports.remove = exports.push = exports.pop = exports.fix = exports.heapify = void 0;
const values_1 = require("../core/values");
const types_1 = require("../core/types");
const types_2 = require("./types");
const exception_1 = require("../core/exception");
function getIndex(i) {
    if (i < 1) {
        return 0;
    }
    return Math.floor(i);
}
/**
 * Initialize array to heap
 */
function heapify(h, cf) {
    // heapify
    const n = h.length;
    for (let i = getIndex(n / 2) - 1; i >= 0; i--) {
        down(h, i, n, cf);
    }
    return h;
}
exports.heapify = heapify;
function up(h, j, cf) {
    while (true) {
        const i = getIndex((j - 1) / 2); // parent
        if (i == j
            || (0, types_1.compare)(h[j], h[i], cf) >= 0) {
            break;
        }
        [h[i], h[j]] = [h[j], h[i]];
        j = i;
    }
}
function down(h, i0, n, cf) {
    let i = i0;
    while (true) {
        let j1 = 2 * i + 1;
        if (j1 >= n || j1 < 0) { // j1 < 0 after int overflow
            break;
        }
        let j = j1; // left child
        let j2 = j1 + 1;
        if (j2 < n && (0, types_1.compare)(h[j2], h[j1], cf) < 0) {
            j = j2; // = 2*i + 2  // right child
        }
        if ((0, types_1.compare)(h[j], h[i], cf) >= 0) {
            break;
        }
        [h[i], h[j]] = [h[j], h[i]];
        i = j;
    }
    return i > i0;
}
/**
 * Fix re-establishes the heap ordering after the element at index i has changed its value.
 * @throws {@link core.errOutOfRange}
 */
function fix(h, i, cf) {
    if (i < 0 || i >= h.length) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
    }
    if (!down(h, i, h.length, cf)) {
        up(h, i, cf);
    }
}
exports.fix = fix;
/**
 * Pop removes and returns the minimum element (according to cf or <) from the heap.
 *
 * @throws {@link core.errOutOfRange}
 */
function pop(h, cf, rf) {
    const n = h.length - 1;
    if (n < 0) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `pop out of range`);
    }
    else if (n != 0) {
        [h[0], h[n]] = [h[n], h[0]];
    }
    down(h, 0, n, cf);
    const v = h[h.length - 1];
    h.pop();
    if (rf) {
        rf(v);
    }
    return v;
}
exports.pop = pop;
/**
 * Push pushes the element x onto the heap.
 */
function push(h, val, cf) {
    let j = h.length;
    h.push(val);
    up(h, j, cf);
}
exports.push = push;
/**
 * Remove removes and returns the element at index i from the heap.
 *
 * @throws {@link core.errOutOfRange}
 */
function remove(h, i, cf, rf) {
    if (i < 0 || i >= h.length) {
        throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
    }
    let n = h.length - 1;
    if (n != i) {
        [h[i], h[n]] = [h[n], h[i]];
        if (!down(h, i, n, cf)) {
            up(h, i, cf);
        }
    }
    const v = h[h.length - 1];
    h.pop();
    if (rf) {
        rf(v);
    }
    return v;
}
exports.remove = remove;
class Heap extends types_2.Basic {
    /**
     * Initialize array to heap
     */
    heapify() {
        heapify(this.h_, this.opts_?.compare);
    }
    /**
     * Fix re-establishes the heap ordering after the element at index i has changed its value.
     */
    fix(i) {
        fix(this.h_, i, this.opts_?.compare);
    }
    /**
     * array heap
     */
    h_;
    /**
     * Returns an array of underlying storage
     */
    get heap() {
        return this.h_;
    }
    /**
     * returns the length of the heap
     * @override
     */
    get length() {
        return this.h_.length;
    }
    /**
     * returns the capacity of the heap
     * @override
     */
    get capacity() {
        return Number.MAX_SAFE_INTEGER;
    }
    /**
     * get heap array element
     * @throws {@link core.errOutOfRange}
     */
    get(i) {
        const h = this.h_;
        if (i < 0 || i >= h.length) {
            throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
        }
        return h[i];
    }
    /**
     * set heap array element
     * @throws {@link core.errOutOfRange}
     */
    set(i, val) {
        const h = this.h_;
        if (i < 0 || i >= h.length) {
            throw exception_1.Exception.wrap(exception_1.errOutOfRange, `index out of range [${i}]`);
        }
        const o = h[i];
        h[i] = val;
        const cf = this.opts_?.compare;
        if ((0, types_1.compare)(o, val, cf) == 0) {
            return;
        }
        fix(h, i, cf);
    }
    constructor(opts, heap) {
        super(opts);
        if (heap) {
            this.h_ = heap;
        }
        else {
            this.h_ = new Array();
        }
    }
    /**
     * Push pushes the element vals onto the heap.
     */
    push(...vals) {
        if (vals.length == 0) {
            return;
        }
        const h = this.h_;
        const cf = this.opts_?.compare;
        for (const v of vals) {
            push(h, v, cf);
        }
    }
    /**
     * Pop removes and returns the minimum element (according to cf or <) from the heap.
     * @throws {@link core.errOutOfRange}
     */
    pop() {
        return pop(this.h_, this.opts_?.compare, this.opts_?.remove);
    }
    /**
     * Remove removes and returns the element at index i from the heap.
     *
     * @throws {@link core.errOutOfRange}
     */
    remove(i) {
        return remove(this.h_, i, this.opts_?.compare, this.opts_?.remove);
    }
    /**
     * Empty the data in the container
     *
     * @param callback Call callback on the removed element
     * @override
     */
    clear(callback) {
        callback = callback ?? this.opts_?.remove;
        if (callback) {
            for (const v of this.h_) {
                callback(v);
            }
        }
        this.h_.splice(0);
    }
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    iterator(reverse) {
        const h = this.h_;
        if (reverse) {
            let i = h.length - 1;
            return {
                next() {
                    if (i >= 0) {
                        return {
                            value: h[i--],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            let i = 0;
            return {
                next() {
                    if (i < h.length) {
                        return {
                            value: h[i++],
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    }
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    clone(callback) {
        const l = new Heap(this.opts_);
        callback = callback ?? this.opts_?.clone;
        if (callback) {
            l.pushList(this, callback);
        }
        else {
            l.h_.push(...this.h_);
        }
        return l;
    }
    /**
     * inserts a copy of another container of heap.
     */
    pushList(vals, callback) {
        callback = callback ?? this.opts_?.clone;
        if (callback) {
            for (const v of vals) {
                this.push(callback(v));
            }
        }
        else {
            for (const v of vals) {
                this.push(v);
            }
        }
    }
}
exports.Heap = Heap;
//# sourceMappingURL=heap.js.map