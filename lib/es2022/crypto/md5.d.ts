import { Bytes } from "../core/slice";
/**
 * The size of an MD5 checksum in bytes.
 */
export declare const Size = 16;
/**
 * The blocksize of MD5 in bytes.
 */
export declare const BlockSize = 64;
export declare class MD5 {
    private readonly s;
    private readonly x;
    private nx;
    private len;
    constructor();
    reset(): void;
    size(): number;
    blockSize(): number;
    write(p: Bytes): number;
    p(): void;
}
