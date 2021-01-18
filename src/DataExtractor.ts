export enum DataExtractorVarType {
  VAR_BOOL,
  VAR_SIGNED,
  VAR_UNSIGNED,
  VAR_FLOAT,
  VAR_DOUBLE,
  VAR_FIXED_LEN_STRING,
}

export class DataExtractorRetVal {
  [varName: string]: boolean | number | string;
}

export class DataExtractorCalcs {
  //varName = '';
  bytePos = 0;
  bitMask = 1;
  numBytes = 0;
  postMult = 1;
  postAdd = 0;
  littleEndian = false;
}

export class DataExtractorVarDef {
  suffix = '';
  atBit = 0;
  bits = 1;
  type = DataExtractorVarType.VAR_BOOL;
  postMult? = 1;
  postAdd? = 0;
  littleEndian? = false;
  calcs?: DataExtractorCalcs = new DataExtractorCalcs();
}

export class DataExtractorDef {
  fields: Array<DataExtractorVarDef> = new Array<DataExtractorVarDef>();
}

export default class DataExtractor {
  _formatDef: DataExtractorDef = new DataExtractorDef();
  _varNameBase = '';
  constructor(varNameBase: string, formatDef: DataExtractorDef) {
    this._formatDef = formatDef;
    this._varNameBase = varNameBase;
    this.preCalcs();
  }

  preCalcs(): void {
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

  extractData(data: Uint8Array): DataExtractorRetVal {
    const retVals = new DataExtractorRetVal();
    for (const fmt of this._formatDef.fields) {
      const calcs = fmt.calcs!;
      const varName = this._varNameBase + fmt.suffix;
      switch (fmt.type) {
        case DataExtractorVarType.VAR_BOOL: {
          // Check read length is valid
          if (calcs.bytePos >= data.length) continue;

          // Extract the bitfield
          const val = data[calcs.bytePos] & calcs.bitMask;
          retVals[varName] = val != 0;
          break;
        }
        case DataExtractorVarType.VAR_SIGNED:
        case DataExtractorVarType.VAR_UNSIGNED: {
          // Check read length is valid
          if (calcs.bytePos + calcs.numBytes > data.length) continue;

          // Extract the value
          let val = 0;
          if (calcs.littleEndian) {
            for (let i = calcs.numBytes - 1; i >= 0; i--) {
              val = (val << 8) | data[calcs.bytePos + i];
            }
          } else {
            for (let i = 0; i < calcs.numBytes; i++) {
              val = (val << 8) | data[calcs.bytePos + i];
            }
          }
          val = val & calcs.bitMask;
          if (
            fmt.type == DataExtractorVarType.VAR_SIGNED &&
            val & (1 << (fmt.bits - 1))
          ) {
            val = val - (1 << fmt.bits);
          }
          // Store the value with post-processing
          retVals[varName] = val * calcs.postMult + calcs.postAdd;
          break;
        }
        case DataExtractorVarType.VAR_FLOAT: {
          // Check read length is valid
          if (calcs.bytePos + 4 > data.length) continue;
          const dv = new DataView(data);
          const val = dv.getFloat32(calcs.bytePos, calcs.littleEndian);
          // Store the value with post-processing
          retVals[varName] = val * calcs.postMult + calcs.postAdd;
          break;
        }
        case DataExtractorVarType.VAR_DOUBLE: {
          // Check read length is valid
          if (calcs.bytePos + 8 > data.length) continue;
          const dv = new DataView(data);
          const val = dv.getFloat64(calcs.bytePos, calcs.littleEndian);
          // Store the value with post-processing
          retVals[varName] = val * calcs.postMult + calcs.postAdd;
          break;
        }
        case DataExtractorVarType.VAR_FIXED_LEN_STRING: {
          // Check read length is valid
          if (calcs.bytePos + calcs.numBytes > data.length) continue;

          // Extract the value
          let val = '';
          for (let i = 0; i < calcs.numBytes; i++) {
            const ch = data[calcs.bytePos + i];
            if (ch === 0) break;
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
