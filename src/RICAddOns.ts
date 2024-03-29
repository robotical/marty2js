import DataExtractor, { DataExtractorVarType } from './DataExtractor.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';
import RICUtils from './RICUtils.js';


// RIC ADDON CODES
export const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = "VCNL4200";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = "lightsensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = "coloursensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = "IRFoot";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT = "LEDfoot";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM = "LEDarm";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE = "LEDeye";
export const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = "noisesensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO = "roboservo3";

const whoAmIToTypeStrMAP: {[key: string]: string} = {
   [RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO]:'GripperArm',
  [RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT]: 'DiscoFoot',
  [RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM]: 'DiscoArm',
  [RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE]: 'DiscoEyes',
  [RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT]: 'IRFoot',
  [RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR]: 'ColourSensor',
  [RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE]: 'DistanceSensor',
  [RIC_WHOAMI_TYPE_CODE_ADDON_NOISE]: 'NoiseSensor',
  [RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT]: 'LightSensor'
};

// Format definitions
const ADDON_IRFOOT_FORMAT_DEF = {
  fields: [
    {
      type: DataExtractorVarType.VAR_BOOL,
      suffix: 'Touch',
      atBit: 8,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_BOOL,
      suffix: 'Air',
      atBit: 9,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Val',
      atBit: 16,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_COLOURSENSOR_FORMAT_DEF = {
  fields: [
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Clear',
      atBit: 8,
      bits: 8,
      postMult: 1,
      postAdd: 0,
      littleEndian: false,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Red',
      atBit: 16,
      bits: 8,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Green',
      atBit: 24,
      bits: 8,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Blue',
      atBit: 32,
      bits: 8,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_BOOL,
      suffix: 'Touch',
      atBit: 48,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_BOOL,
      suffix: 'Air',
      atBit: 49,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_DISTANCESENSOR_FORMAT_DEF = {
  fields: [
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_LIGHTSENSOR_FORMAT_DEF = {
  fields: [
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading1',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading2',
      atBit: 24,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading3',
      atBit: 40,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_NOISESENSOR_FORMAT_DEF = {
  fields: [
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Smoothed',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'HighestSinceLastReading',
      atBit: 24,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: DataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Raw',
      atBit: 40,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

export function getHWElemTypeStr(whoAmI: string | undefined) {
  RICUtils.debug(`getting type code for ${whoAmI}`);
  if (whoAmI === undefined) {
    return `Undefined whoamiTypeCode`;
  }
  return whoAmIToTypeStrMAP[whoAmI] ? whoAmIToTypeStrMAP[whoAmI] : `Unknown (${whoAmI})`;
}

export class RICAddOnBase {
  _name = '';
  _whoAmI = '';
  constructor(name: string) {
    this._name = name;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    RICUtils.debug(
      `RICAddOnBase processPub NOT OVERRIDDEN addOnID ${addOnID} statusByte ${statusByte} dataLen ${rawData.length}`,
    );
    return new ROSSerialAddOnStatus();
  }
}


export class RICAddOnGripServo extends RICAddOnBase {
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO;
  }
  
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
}

export class RICAddOnLEDFoot extends RICAddOnBase {
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // console.log("RICADDONMANAGER: debugging info");

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
}

export class RICAddOnLEDArm extends RICAddOnBase {
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
}

export class RICAddOnLEDEye extends RICAddOnBase {
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
}



export class RICAddOnIRFoot extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT;
    this._dataExtractor = new DataExtractor(name, ADDON_IRFOOT_FORMAT_DEF);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}

export class RICAddOnColourSensor extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR;
    this._dataExtractor = new DataExtractor(
      name,
      ADDON_COLOURSENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}

export class RICAddOnDistanceSensor extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE;
    this._dataExtractor = new DataExtractor(
      name,
      ADDON_DISTANCESENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}

export class RICAddOnLightSensor extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT;
    this._dataExtractor = new DataExtractor(
      name,
      ADDON_LIGHTSENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}

export class RICAddOnNoiseSensor extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._whoAmI = RIC_WHOAMI_TYPE_CODE_ADDON_NOISE;
    this._dataExtractor = new DataExtractor(
      name,
      ADDON_NOISESENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.whoAmI = this._whoAmI;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}