import { MessageResult } from './RICMsgHandler.js';
import CommsStats from './CommsStats.js';
import RICAddOnManager from './RICAddOnManager.js';
export declare class ROSSerialSmartServos {
    smartServos: {
        id: number;
        pos: number;
        current: number;
        status: number;
    }[];
}
export declare class ROSSerialIMU {
    accel: {
        x: number;
        y: number;
        z: number;
    };
}
export declare class ROSSerialPowerStatus {
    powerStatus: {
        battRemainCapacityPercent: number;
        battTempDegC: number;
        battRemainCapacityMAH: number;
        battFullCapacityMAH: number;
        battCurrentMA: number;
        power5VOnTimeSecs: number;
        power5VIsOn: boolean;
        powerUSBIsConnected: boolean;
    };
}
export declare class ROSSerialAddOnStatus {
    id: number;
    whoAmI: string;
    name: string;
    status: number;
    vals: {};
}
export declare class ROSSerialAddOnStatusList {
    addons: Array<ROSSerialAddOnStatus>;
}
export declare type ROSSerialMsg = ROSSerialSmartServos | ROSSerialIMU | ROSSerialPowerStatus | ROSSerialAddOnStatusList;
export default class RICROSSerial {
    static decode(rosSerialMsg: Uint8Array, startPos: number, messageResult: MessageResult | null, commsStats: CommsStats, addOnManager: RICAddOnManager): void;
    static extractSmartServos(buf: Uint8Array): ROSSerialSmartServos;
    static extractAccel(buf: Uint8Array): ROSSerialIMU;
    static extractPowerStatus(buf: Uint8Array): ROSSerialPowerStatus;
    static extractAddOnStatus(buf: Uint8Array, addOnManager: RICAddOnManager): ROSSerialAddOnStatusList;
}
