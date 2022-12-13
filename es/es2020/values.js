class _NoResult {
    constructor() {
        this.done = true;
        this.value = undefined;
    }
}
/**
 * Explicitly means no value
 */
export const noResult = new _NoResult();
/**
 * An Promise that will never finish
 */
export const neverPromise = new Promise(() => { });
/**
 * This function does nothing and can usually be used as the default handler for something
 */
export function nopCallback() { }
export const emptyObject = {};
//# sourceMappingURL=values.js.map