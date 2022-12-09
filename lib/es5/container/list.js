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
exports.List = exports.ListElement = void 0;
var values_1 = require("../values");
var types_1 = require("./types");
/**
 * linked list element
 * @sealed
 */
var ListElement = /** @class */ (function () {
    /**
     * Prohibit third-party instantiation
     */
    function ListElement(list, data) {
        this.data = data;
        this.list_ = list;
    }
    /**
     * @internal
     */
    ListElement.prototype._list = function () {
        return this.list_;
    };
    /**
     * @internal
     */
    ListElement.prototype._remove = function () {
        this.list_ = undefined;
    };
    /**
     * @internal
     * Create elements in internal
     */
    ListElement.make = function (list, data) {
        return new ListElement(list, data);
    };
    /**
     * return next element
     */
    ListElement.prototype.next = function () {
        var list = this.list_;
        if (!list) {
            return;
        }
        var v = this.next_;
        return v == list._root() ? undefined : v;
    };
    /**
     * return previous element
     */
    ListElement.prototype.prev = function () {
        var list = this.list_;
        if (!list) {
            return;
        }
        var v = this.prev_;
        return v == list._root() ? undefined : v;
    };
    return ListElement;
}());
exports.ListElement = ListElement;
/**
 * Doubly linked list. Refer to the golang standard library implementation
 * @sealed
 */
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(opts) {
        var _this = _super.call(this, opts) || this;
        /**
         * record linked list length
         */
        _this.length_ = 0;
        var root = ListElement.make();
        root.next_ = root;
        root.prev_ = root;
        _this.root_ = root;
        return _this;
    }
    /**
     * @internal
     */
    List.prototype._root = function () {
        return this.root_;
    };
    Object.defineProperty(List.prototype, "length", {
        /**
         * returns the length of the linked list
         * @override
         */
        get: function () {
            return this.length_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(List.prototype, "capacity", {
        /**
         * returns the capacity of the linked list
         * @override
         */
        get: function () {
            return Number.MAX_SAFE_INTEGER;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * returns the first element of list l or undefined if the list is empty.
     */
    List.prototype.front = function () {
        if (this.length_ == 0) {
            return undefined;
        }
        return this.root_.next_;
    };
    /**
     *  returns the last element of list l or nil if the list is empty.
     */
    List.prototype.back = function () {
        if (this.length_ == 0) {
            return undefined;
        }
        return this.root_.prev_;
    };
    /**
     * insert inserts e after at, increments length
     */
    List.prototype._insert = function (e, at) {
        e.prev_ = at;
        e.next_ = at.next_;
        e.prev_.next_ = e;
        e.next_.prev_ = e;
        this.length_++;
    };
    // insertValue is a convenience wrapper for insert(&Element{Value: v}, at).
    List.prototype._insertValue = function (v, at) {
        var e = ListElement.make(this, v);
        this._insert(e, at);
        return e;
    };
    /**
     * remove removes e from its list, decrements length
     */
    List.prototype._remove = function (e) {
        e.prev_.next_ = e.next_;
        e.next_.prev_ = e.prev_;
        e.next_ = undefined; // avoid memory leaks
        e.prev_ = undefined; // avoid memory leaks
        e._remove();
        this.length_--;
        return e;
    };
    /**
     * move moves e to next to at and returns e.
     */
    List.prototype._move = function (e, at) {
        if (e == at) {
            return false;
        }
        e.prev_.next_ = e.next_;
        e.next_.prev_ = e.prev_;
        e.prev_ = at;
        e.next_ = at.next_;
        e.prev_.next_ = e;
        e.next_.prev_ = e;
        return true;
    };
    /**
     * clear the list
     *
     * @remarks
     * It will cause a bug if a call to remove is passed after calling clear and an element before clear is passed in. like this
     *
     * ```
     * const l = new List<number>()
     * const ele = l.pushBack(1)
     * l.cear()
     * console.log((l.remove(ele)) // output true
     * console.log(l.length) // output -1
     * ```
     *
     * This bug is generated because the element records which linked list it is in and the clear function does not clear the mark .
     *
     * So remove(ele) mistakenly deletes the expired element. To solve this problem, it is necessary to traverse the linked list once in 'clear' to clear all tags, but this will damage efficiency. However, this bug is not common and the caller can be avoided, so I'm not going to fix it.
     *
     * You can also avoid this bug by passing in an empty implementation of the callback function, because calling the callback for all elements also requires traversing the list once, so in this case the code also empties the token before the callback.
     *
     * ```
     * const l = new List<number>()
     * const ele = l.pushBack(1)
     * l.cear(()=>{})
     * console.log((l.remove(ele)) // output false
     * console.log(l.length) // output 0
     * ```
     *
     * @param callback call the callback on the removed element
     */
    List.prototype.clear = function (callback) {
        var _a;
        var front = this.front();
        if (front) {
            var root = this.root_;
            root.prev_ = root;
            root.next_ = root;
            this.length_ = 0;
            var ele = front;
            // fix bug,rest list tag
            // while (ele) {
            //     ele._remove()
            //     ele = ele.next_
            // }
            callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
            if (callback) {
                ele = front;
                while (ele != root) {
                    ele._remove(); //  rest list tag
                    callback(ele.data);
                    ele = ele.next_;
                }
            }
        }
    };
    /**
     * remove e from list if e is an element of list.
     * @param e element to remove
     * @param callback call the callback on the removed element
     */
    List.prototype.remove = function (e, callback) {
        var _a;
        if (e._list() != this) {
            return false;
        }
        this._remove(e);
        callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
        if (callback) {
            callback(e.data);
        }
        return true;
    };
    /**
     * If the list is not empty delete the element at the back
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    List.prototype.popBack = function (callback) {
        var _a;
        var e = this.back();
        if (e) {
            this._remove(e);
            callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
            if (callback) {
                callback(e.data);
            }
            return e.data;
        }
    };
    /**
 * If the list is not empty delete the element at the back
 * @param callback call the callback on the removed element
 * @returns deleted data
 */
    List.prototype.popBackRaw = function (callback) {
        var _a;
        var e = this.back();
        if (e) {
            this._remove(e);
            callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
            if (callback) {
                callback(e.data);
            }
            return [e.data, true];
        }
        return [undefined, false];
    };
    /**
     * If the list is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    List.prototype.popFront = function (callback) {
        var _a;
        var e = this.front();
        if (e) {
            this._remove(e);
            callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
            if (callback) {
                callback(e.data);
            }
            return e.data;
        }
    };
    /**
     * If the list is not empty delete the element at the front
     * @param callback call the callback on the removed element
     * @returns deleted data
     */
    List.prototype.popFrontRaw = function (callback) {
        var _a;
        var e = this.front();
        if (e) {
            this._remove(e);
            callback = callback !== null && callback !== void 0 ? callback : (_a = this.opts_) === null || _a === void 0 ? void 0 : _a.remove;
            if (callback) {
                callback(e.data);
            }
            return [e.data, true];
        }
        return [undefined, false];
    };
    /**
     * inserts a new element e with value v at the back of list and returns e.
     */
    List.prototype.pushBack = function (v) {
        return this._insertValue(v, this.root_.prev_);
    };
    /**
     * inserts a new element e with value v at the front of list and returns e.
     */
    List.prototype.pushFront = function (v) {
        return this._insertValue(v, this.root_);
    };
    /**
     * inserts a new element e with value v immediately before mark and returns e.
     */
    List.prototype.insertBefore = function (v, mark) {
        if (mark._list() != this) {
            return;
        }
        return this._insertValue(v, mark.prev_);
    };
    /**
     * inserts a new element e with value v immediately after mark and returns e.
     */
    List.prototype.insertAfter = function (v, mark) {
        if (mark._list() != this) {
            return;
        }
        return this._insertValue(v, mark);
    };
    /**
     * moves element e to the front of list.
     */
    List.prototype.moveToFront = function (e) {
        if (e._list() != this) {
            return false;
        }
        var root = this.root_;
        if (root.next_ == e) {
            return false;
        }
        return this._move(e, root);
    };
    /**
     * moves element e to the back of list.
     */
    List.prototype.moveToBack = function (e) {
        if (e._list() != this) {
            return false;
        }
        var root = this.root_;
        if (root.prev_ == e) {
            return false;
        }
        return this._move(e, root.prev_);
    };
    /**
     * moves element e to its new position before mark.
     */
    List.prototype.moveBefore = function (e, mark) {
        if (e._list() != this ||
            e == mark ||
            mark._list() != this) {
            return false;
        }
        return this._move(e, mark.prev_);
    };
    /**
     * moves element e to its new position after mark.
     */
    List.prototype.moveAfter = function (e, mark) {
        if (e._list() != this ||
            e == mark ||
            mark._list() != this) {
            return false;
        }
        return this._move(e, mark);
    };
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     * @override
     */
    List.prototype.iterator = function (reverse) {
        if (reverse) {
            var current_1 = this.back();
            var front_1 = this.front();
            return {
                next: function () {
                    if (current_1) {
                        var data = current_1.data;
                        if (current_1 == front_1) {
                            current_1 = undefined; // fix pushFrontList(this)
                        }
                        else {
                            current_1 = current_1.prev();
                        }
                        return {
                            value: data,
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
        else {
            var current_2 = this.front();
            var back_1 = this.back();
            return {
                next: function () {
                    if (current_2) {
                        var data = current_2.data;
                        if (current_2 == back_1) {
                            current_2 = undefined; // fix pushBackList(this)
                        }
                        else {
                            current_2 = current_2.next();
                        }
                        return {
                            value: data,
                        };
                    }
                    return values_1.noResult;
                }
            };
        }
    };
    /**
     * inserts a copy of another container at the back of list.
     */
    List.prototype.pushBackList = function (vals, callback) {
        var e_1, _a, e_2, _b;
        var _c;
        callback = callback !== null && callback !== void 0 ? callback : (_c = this.opts_) === null || _c === void 0 ? void 0 : _c.clone;
        if (callback) {
            try {
                for (var vals_1 = __values(vals), vals_1_1 = vals_1.next(); !vals_1_1.done; vals_1_1 = vals_1.next()) {
                    var v = vals_1_1.value;
                    this._insertValue(callback(v), this.root_.prev_);
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
        else {
            try {
                for (var vals_2 = __values(vals), vals_2_1 = vals_2.next(); !vals_2_1.done; vals_2_1 = vals_2.next()) {
                    var v = vals_2_1.value;
                    this._insertValue(v, this.root_.prev_);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (vals_2_1 && !vals_2_1.done && (_b = vals_2.return)) _b.call(vals_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    /**
     * inserts a copy of another container at the front of list l.
     */
    List.prototype.pushFrontList = function (vals, callback) {
        var e_3, _a, e_4, _b;
        var _c;
        var ele;
        callback = callback !== null && callback !== void 0 ? callback : (_c = this.opts_) === null || _c === void 0 ? void 0 : _c.clone;
        if (callback) {
            try {
                for (var vals_3 = __values(vals), vals_3_1 = vals_3.next(); !vals_3_1.done; vals_3_1 = vals_3.next()) {
                    var v = vals_3_1.value;
                    if (ele) {
                        ele = this._insertValue(callback(v), ele);
                    }
                    else {
                        ele = this._insertValue(callback(v), this.root_);
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
        else {
            try {
                for (var vals_4 = __values(vals), vals_4_1 = vals_4.next(); !vals_4_1.done; vals_4_1 = vals_4.next()) {
                    var v = vals_4_1.value;
                    if (ele) {
                        ele = this._insertValue(v, ele);
                    }
                    else {
                        ele = this._insertValue(v, this.root_);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (vals_4_1 && !vals_4_1.done && (_b = vals_4.return)) _b.call(vals_4);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    };
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    List.prototype.clone = function (callback) {
        var l = new List(this.opts_);
        l.pushBackList(this, callback);
        return l;
    };
    return List;
}(types_1.Basic));
exports.List = List;
//# sourceMappingURL=list.js.map