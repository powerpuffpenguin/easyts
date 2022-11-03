/**
 * 沒有參數的回調函數
 */
export type VoidCallback = () => void

/**
 * 帶一個參數的回調函數
 */
export type ChangedCallback<T> = (val: T) => void