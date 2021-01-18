export declare enum DataExtractorVarType {
    VAR_BOOL = 0,
    VAR_SIGNED = 1,
    VAR_UNSIGNED = 2,
    VAR_FLOAT = 3,
    VAR_DOUBLE = 4,
    VAR_FIXED_LEN_STRING = 5
}
export declare class DataExtractorRetVal {
    [varName: string]: boolean | number | string;
}
export declare class DataExtractorCalcs {
    bytePos: number;
    bitMask: number;
    numBytes: number;
    postMult: number;
    postAdd: number;
    littleEndian: boolean;
}
export declare class DataExtractorVarDef {
    suffix: string;
    atBit: number;
    bits: number;
    type: DataExtractorVarType;
    postMult?: number | undefined;
    postAdd?: number | undefined;
    littleEndian?: boolean | undefined;
    calcs?: DataExtractorCalcs;
}
export declare class DataExtractorDef {
    fields: Array<DataExtractorVarDef>;
}
export default class DataExtractor {
    _formatDef: DataExtractorDef;
    _varNameBase: string;
    constructor(varNameBase: string, formatDef: DataExtractorDef);
    preCalcs(): void;
    extractData(data: Uint8Array): DataExtractorRetVal;
}
