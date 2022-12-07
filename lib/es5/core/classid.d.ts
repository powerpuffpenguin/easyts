export declare const UUID = "591e8619-07d8-4d0d-89ac-b1b9a265afa3";
export declare type Constructor<T> = new (...args: any[]) => T;
export declare function isClass<T>(v: any, t: Constructor<T>): v is T;
export declare function asClass<T>(v: any, t: Constructor<T>): T | undefined;
