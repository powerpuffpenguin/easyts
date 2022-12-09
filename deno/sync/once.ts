import { Completer } from '../async.ts';
import { VoidCallback, AsyncVoidCallback } from '../types.ts';

/**
 * an object that will perform exactly one action.
 * 
 * @sealed
 */
export class Once {
    private ok_ = false
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once. 
     * 
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation. 
     */
    do(f: VoidCallback): boolean {
        if (this.ok_) {
            return false
        }
        this.ok_ = true
        f()
        return true
    }
}
/**
 * an object that will perform exactly one action.
 * 
 * @sealed
 */
export class AsyncOnce {
    private ok_ = false
    /**
     * calls the function f if and only if Do is being called for the first time for this instance of Once. 
     * 
     * @remarks
     * In other words, given var once = new Once(), if once.do(f) is called multiple times, only the first call will invoke f, even if f has a different value in each invocation. 
     */
    do(f: AsyncVoidCallback): false | Promise<boolean> {
        if (this.ok_) {
            return false
        }
        return this._do(f)
    }
    private done_?: Completer<void>
    private async _do(f: AsyncVoidCallback): Promise<boolean> {
        let done = this.done_
        if (done) {
            await done.promise
            return false
        }
        done = new Completer<void>()
        this.done_ = done
        try {
            await f()
            this.ok_ = true
            done.resolve()
        } catch (e) {
            this.ok_ = true
            done.resolve()
            throw e
        }
        return true
    }
}