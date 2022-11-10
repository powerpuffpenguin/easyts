import { ReadChannel } from "./core/channel";
import { Exception } from "./core/exception";
export interface Deadline {
    deadline: Date | undefined;
    ok: boolean;
}
export interface Context {
    deadline(): Deadline;
    done(): ReadChannel<any>;
    err(): Exception | undefined;
    get<T>(key: any): IteratorResult<T>;
}
