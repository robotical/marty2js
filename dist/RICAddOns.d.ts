import DataExtractor from './DataExtractor.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = "0000008A";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = "00000086";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = "00000085";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = "00000084";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = "00000083";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT = "00000087";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM = "00000088";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE = "00000089";
export declare function getHWElemTypeStr(whoAmITypeCode: string | undefined, whoAmI: string | undefined): string;
export declare class RICAddOnBase {
    _name: string;
    _deviceTypeID: number;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnLEDFoot extends RICAddOnBase {
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number): ROSSerialAddOnStatus;
}
export declare class RICAddOnLEDArm extends RICAddOnBase {
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number): ROSSerialAddOnStatus;
}
export declare class RICAddOnLEDEye extends RICAddOnBase {
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number): ROSSerialAddOnStatus;
}
export declare class RICAddOnIRFoot extends RICAddOnBase {
    _dataExtractor: DataExtractor;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnColourSensor extends RICAddOnBase {
    _dataExtractor: DataExtractor;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnDistanceSensor extends RICAddOnBase {
    _dataExtractor: DataExtractor;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnLightSensor extends RICAddOnBase {
    _dataExtractor: DataExtractor;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnNoiseSensor extends RICAddOnBase {
    _dataExtractor: DataExtractor;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
