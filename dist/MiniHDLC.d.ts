declare enum MiniHDLCState {
    STATE_ESCAPE = 0,
    STATE_READ = 1
}
export default class MiniHDLC {
    rxState: MiniHDLCState;
    rxBuffer: Array<number>;
    onRxFrame: ((rxFrame: Uint8Array) => void) | null;
    frameCRC: Array<number>;
    FRAME_BOUNDARY_OCTET: number;
    CONTROL_ESCAPE_OCTET: number;
    INVERT_OCTET: number;
    constructor();
    addRxByte(rxByte: number): void;
    addRxBytes(rxBytes: Uint8Array): void;
    _checkCRC(): boolean;
    _crc16(buf: Array<number> | Uint8Array): number;
    encode(content: Uint8Array): Uint8Array;
    _setData(destBuf: Uint8Array, dataVal: number, pos: number): number;
}
export {};
