export declare class FileBlockTrackInfo {
    isDone: boolean;
    prom: Promise<void>;
    constructor(prom: Promise<void>);
    isComplete(): boolean;
    get(): Promise<void>;
}
export default class MsgTrackInfo {
    msgOutstanding: boolean;
    msgFrame: Uint8Array | null;
    msgSentMs: number;
    retryCount: number;
    withResponse: boolean;
    msgHandle: number;
    resolve: unknown;
    reject: unknown;
    constructor();
    set(msgOutstanding: boolean, msgFrame: Uint8Array, withResponse: boolean, msgHandle: number, resolve: unknown, reject: unknown): void;
}
