export default class Struct {
    _rechk: RegExp;
    _refmt: RegExp;
    _format: string;
    _outBufferDataView: DataView;
    _outBufPos: number;
    _inBufferDataView: DataView;
    _inBufPos: number;
    _strPos: number;
    _formedStr: string;
    _argIdx: number;
    _littleEndian: boolean;
    constructor(format: string);
    size(): number;
    _packElem(fPos: number, arg: number | string | boolean): number;
    packInto(buffer: Uint8Array, offset: number, ...args: Array<number | string | boolean>): void;
    pack(...args: Array<number | string | boolean>): Uint8Array;
    _unpackElem(fPos: number, outArray: Array<number | string | boolean>): number;
    unpackFrom(buffer: Uint8Array, offset: number): Array<number | string>;
    unpack(inBuf: Uint8Array): Array<number | string>;
}
