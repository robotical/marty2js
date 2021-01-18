export var DataExtractorVarType;
(function (DataExtractorVarType) {
    DataExtractorVarType[DataExtractorVarType["VAR_BOOL"] = 0] = "VAR_BOOL";
    DataExtractorVarType[DataExtractorVarType["VAR_SIGNED"] = 1] = "VAR_SIGNED";
    DataExtractorVarType[DataExtractorVarType["VAR_UNSIGNED"] = 2] = "VAR_UNSIGNED";
    DataExtractorVarType[DataExtractorVarType["VAR_FLOAT"] = 3] = "VAR_FLOAT";
    DataExtractorVarType[DataExtractorVarType["VAR_DOUBLE"] = 4] = "VAR_DOUBLE";
    DataExtractorVarType[DataExtractorVarType["VAR_FIXED_LEN_STRING"] = 5] = "VAR_FIXED_LEN_STRING";
})(DataExtractorVarType || (DataExtractorVarType = {}));
export class DataExtractorRetVal {
}
export class DataExtractorCalcs {
    constructor() {
        //varName = '';
        this.bytePos = 0;
        this.bitMask = 1;
        this.numBytes = 0;
        this.postMult = 1;
        this.postAdd = 0;
        this.littleEndian = false;
    }
}
export class DataExtractorVarDef {
    constructor() {
        this.suffix = '';
        this.atBit = 0;
        this.bits = 1;
        this.type = DataExtractorVarType.VAR_BOOL;
        this.postMult = 1;
        this.postAdd = 0;
        this.littleEndian = false;
        this.calcs = new DataExtractorCalcs();
    }
}
export class DataExtractorDef {
    constructor() {
        this.fields = new Array();
    }
}
export default class DataExtractor {
    constructor(varNameBase, formatDef) {
        this._formatDef = new DataExtractorDef();
        this._varNameBase = '';
        this._formatDef = formatDef;
        this._varNameBase = varNameBase;
        this.preCalcs();
    }
    preCalcs() {
        // Perform pre-calculations to speed-up processing
        for (const fmt of this._formatDef.fields) {
            const calcs = new DataExtractorCalcs();
            //calcs.varName = this._varNameBase + fmt.suffix;
            calcs.bytePos = Math.floor(fmt.atBit / 8);
            calcs.bitMask =
                (0x80000000 >> (fmt.bits - 1)) >>> (32 - fmt.bits - (fmt.atBit % 8));
            calcs.numBytes = Math.ceil(fmt.bits / 8);
            calcs.postMult = fmt.postMult === undefined ? 1 : fmt.postMult;
            calcs.postAdd = fmt.postAdd === undefined ? 0 : fmt.postAdd;
            calcs.littleEndian =
                fmt.littleEndian === undefined ? false : fmt.littleEndian;
            fmt.calcs = calcs;
        }
    }
    extractData(data) {
        const retVals = new DataExtractorRetVal();
        for (const fmt of this._formatDef.fields) {
            const calcs = fmt.calcs;
            const varName = this._varNameBase + fmt.suffix;
            switch (fmt.type) {
                case DataExtractorVarType.VAR_BOOL: {
                    // Check read length is valid
                    if (calcs.bytePos >= data.length)
                        continue;
                    // Extract the bitfield
                    const val = data[calcs.bytePos] & calcs.bitMask;
                    retVals[varName] = val != 0;
                    break;
                }
                case DataExtractorVarType.VAR_SIGNED:
                case DataExtractorVarType.VAR_UNSIGNED: {
                    // Check read length is valid
                    if (calcs.bytePos + calcs.numBytes > data.length)
                        continue;
                    // Extract the value
                    let val = 0;
                    if (calcs.littleEndian) {
                        for (let i = calcs.numBytes - 1; i >= 0; i--) {
                            val = (val << 8) | data[calcs.bytePos + i];
                        }
                    }
                    else {
                        for (let i = 0; i < calcs.numBytes; i++) {
                            val = (val << 8) | data[calcs.bytePos + i];
                        }
                    }
                    val = val & calcs.bitMask;
                    if (fmt.type == DataExtractorVarType.VAR_SIGNED &&
                        val & (1 << (fmt.bits - 1))) {
                        val = val - (1 << fmt.bits);
                    }
                    // Store the value with post-processing
                    retVals[varName] = val * calcs.postMult + calcs.postAdd;
                    break;
                }
                case DataExtractorVarType.VAR_FLOAT: {
                    // Check read length is valid
                    if (calcs.bytePos + 4 > data.length)
                        continue;
                    const dv = new DataView(data);
                    const val = dv.getFloat32(calcs.bytePos, calcs.littleEndian);
                    // Store the value with post-processing
                    retVals[varName] = val * calcs.postMult + calcs.postAdd;
                    break;
                }
                case DataExtractorVarType.VAR_DOUBLE: {
                    // Check read length is valid
                    if (calcs.bytePos + 8 > data.length)
                        continue;
                    const dv = new DataView(data);
                    const val = dv.getFloat64(calcs.bytePos, calcs.littleEndian);
                    // Store the value with post-processing
                    retVals[varName] = val * calcs.postMult + calcs.postAdd;
                    break;
                }
                case DataExtractorVarType.VAR_FIXED_LEN_STRING: {
                    // Check read length is valid
                    if (calcs.bytePos + calcs.numBytes > data.length)
                        continue;
                    // Extract the value
                    let val = '';
                    for (let i = 0; i < calcs.numBytes; i++) {
                        const ch = data[calcs.bytePos + i];
                        if (ch === 0)
                            break;
                        val += String.fromCharCode(ch);
                    }
                    // Store the value
                    retVals[varName] = val;
                    break;
                }
            }
        }
        return retVals;
    }
}
