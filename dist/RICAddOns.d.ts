import DataExtractor from './DataExtractor.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = "VCNL4200";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = "lightsensor";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = "coloursensor";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = "IRFoot";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT = "LEDfoot";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM = "LEDarm";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE = "LEDeye";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = "noisesensor";
export declare const RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO = "roboservo3";
export declare function getHWElemTypeStr(whoAmI: string | undefined): string;
export declare class RICAddOnBase {
    _name: string;
    _whoAmI: string;
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus;
}
export declare class RICAddOnGripServo extends RICAddOnBase {
    constructor(name: string);
    processPublishedData(addOnID: number, statusByte: number): ROSSerialAddOnStatus;
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
