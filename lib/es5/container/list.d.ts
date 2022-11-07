import { DeleteCallback, CloneCallback } from "../core/types";
import { Basic, Container, Options } from "./types";
/**
 * linked list element
 * @sealed
 */
export declare class ListElement<T> {
    data?: T | undefined;
    /**
     * which list the element is in
     */
    private list_?;
    /**
     * Prohibit third-party instantiation
     */
    private constructor();
    /**
     * return next element
     */
    next(): ListElement<T> | undefined;
    /**
     * return previous element
     */
    prev(): ListElement<T> | undefined;
}
/**
 * Doubly linked list. Refer to the golang standard library implementation
 * @sealed
 */
export declare class List<T> extends Basic<T> implements Container<T> {
    /**
     * sentinel list element, only root, root.prev, and root.next are used
     */
    private root_;
    /**
     * record linked list length
     */
    private length_;
    /**
     * returns the length of the linked list
     */
    get length(): number;
    get capacity(): number;
    constructor(opts?: Options<T>);
    /**
     * returns the first element of list l or undefined if the list is empty.
     */
    front(): ListElement<T> | undefined;
    /**
     *  returns the last element of list l or nil if the list is empty.
     */
    back(): ListElement<T> | undefined;
    /**
     * insert inserts e after at, increments length
     */
    private _insert;
    private _insertValue;
    /**
     * remove removes e from its list, decrements length
     */
    private _remove;
    /**
     * move moves e to next to at and returns e.
     */
    private _move;
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
    clear(callback?: DeleteCallback<T>): void;
    /**
     * remove e from list if e is an element of list.
     * @param e element to remove
     * @param callback call the callback on the removed element
     */
    remove(e: ListElement<T>, callback?: DeleteCallback<T>): boolean;
    /**
     * inserts a new element e with value v at the back of list and returns e.
     */
    pushBack(v: T): ListElement<T>;
    /**
     * inserts a new element e with value v at the front of list and returns e.
     */
    pushFront(v: T): ListElement<T>;
    /**
     * inserts a new element e with value v immediately before mark and returns e.
     */
    insertBefore(v: T, mark: ListElement<T>): ListElement<T> | undefined;
    /**
     * inserts a new element e with value v immediately after mark and returns e.
     */
    insertAfter(v: T, mark: ListElement<T>): ListElement<T> | undefined;
    /**
     * moves element e to the front of list.
     */
    moveToFront(e: ListElement<T>): boolean;
    /**
     * moves element e to the back of list.
     */
    moveToBack(e: ListElement<T>): boolean;
    /**
     * moves element e to its new position before mark.
     */
    moveBefore(e: ListElement<T>, mark: ListElement<T>): boolean;
    /**
     * moves element e to its new position after mark.
     */
    moveAfter(e: ListElement<T>, mark: ListElement<T>): boolean;
    /**
     * return js iterator
     * @param reverse If true, returns an iterator to traverse in reverse
     */
    iterator(reverse?: boolean): Iterator<T>;
    /**
     * inserts a copy of another container at the back of list.
     */
    pushBackList(vals: Iterable<T>, callback?: CloneCallback<T>): void;
    /**
     * inserts a copy of another container at the front of list l.
     */
    pushFrontList(vals: Iterable<T>, callback?: CloneCallback<T>): void;
    /**
     * Create a full copy of the container
     * @param callback How to create a duplicate copy of an element
     */
    clone(callback?: CloneCallback<T>): List<T>;
}
