import DataExtractor, { DataExtractorVarType } from './DataExtractor.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';
import RICUtils from './RICUtils.js';

// RIC ADDON CODES
export const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = '0000008A';
export const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = '00000086';
export const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = '00000085';
export const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = '00000084';
export const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = '00000083';

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

export function getHWElemTypeStr(whoAmITypeCode: string | undefined) {
  RICUtils.debug(`getting type code for ${whoAmITypeCode}`);
  if (whoAmITypeCode === undefined) {
    return `Undefined whoamiTypeCode`;
  }
  switch (parseInt(whoAmITypeCode)) {
    case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT):
      return 'IRFoot';

    case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR):
      return 'ColourSensor';

    case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE):
      return 'DistanceSensor';

    case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_NOISE):
      return 'NoiseSensor';

    case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT):
      return 'LightSensor';
  }
  return `Unknown (${whoAmITypeCode})`;
}

export class RICAddOnBase {
  _name = '';
  _deviceTypeID = 0;
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

export class RICAddOnIRFoot extends RICAddOnBase {
  _dataExtractor: DataExtractor;
  constructor(name: string) {
    super(name);
    this._deviceTypeID = parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT);
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
    retStatus.deviceTypeID = this._deviceTypeID;
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
    this._deviceTypeID = parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR);
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
    retStatus.deviceTypeID = this._deviceTypeID;
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
    this._deviceTypeID = parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE);
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
    retStatus.deviceTypeID = this._deviceTypeID;
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
    this._deviceTypeID = parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT);
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
    retStatus.deviceTypeID = this._deviceTypeID;
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
    this._deviceTypeID = parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_NOISE);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
}