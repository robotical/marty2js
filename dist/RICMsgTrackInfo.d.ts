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
    msgTimeoutMs: number | undefined;
    resolve: ((value: any) => void) | null;
    reject: ((reason?: any) => void) | null;
    constructor();
    set(msgOutstanding: boolean, msgFrame: Uint8Array, withResponse: boolean, msgHandle: number, msgTimeoutMs: number | undefined, resolve: (value: any) => void, reject: (reason?: any) => void): void;
}
