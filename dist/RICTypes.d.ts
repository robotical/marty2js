import { ROSSerialSmartServos, ROSSerialIMU, ROSSerialPowerStatus, ROSSerialAddOnStatusList } from './RICROSSerial.js';
export declare enum RICIFType {
    RIC_INTERFACE_BLE = 0,
    RIC_INTERFACE_WIFI = 1
}
export declare enum RICFileSendType {
    RIC_NORMAL_FILE = 0,
    RIC_FIRMWARE_UPDATE = 1
}
export declare class DiscoveredRIC {
    _localName: string;
    _name: string;
    _id: string;
    _rssi: number;
    _hostnameOrIPAddress: string;
    _interface: RICIFType;
    constructor(localNameOrIPAddress: string, name: string, id?: string, rssi?: number);
    get name(): string;
    get id(): string;
    get rssi(): number;
    get ipAddress(): string;
}
export declare enum DiscoveryInterfaces {
    DISCOVER_ANY = 0,
    DISCOVER_BLE_ONLY = 1,
    DISCOVER_IP_ONLY = 2
}
export declare enum RICDiscoveryState {
    RIC_STATE_RICS_DISCOVERED = 0
}
export interface RICSubscription {
    remove(): void;
}
export declare type RICDiscoveryListener = (newState: RICDiscoveryState, discoveredRICs: DiscoveredRIC[]) => void;
export declare type DiscoveredRICsCB = (discoveredRICs: DiscoveredRIC[]) => void;
export declare type RICFriendlyName = {
    friendlyName: string;
};
export declare class RICNameResponse {
    friendlyName: string;
    friendlyNameIsSet: number;
    req: string;
    rslt: string;
}
export declare class RICSystemInfo {
    rslt: string;
    SystemName: string;
    SystemVersion: string;
}
export declare class RICCalibInfo {
    rslt: string;
    calDone: number;
}
export declare class RICOKFail {
    constructor(rsltFlag?: boolean | undefined);
    set(rsltFlag: boolean): void;
    rslt: string;
}
export declare class RICHWFWStat {
    s: string;
    m: string;
    v: string;
    n: string;
    p: number;
    i: number;
    c: never[];
}
export declare class RICHWFWUpdRslt {
    req: string;
    rslt: string;
    st: RICHWFWStat;
}
export declare type RICFWInfo = {
    elemType: string;
    version: string;
    firmware: string;
    destname: string;
    md5: string;
    releaseNotes: string;
    comments: string;
};
export declare type RICUpdateInfo = {
    rslt: string;
    main: RICFWInfo;
    addons: Array<RICFWInfo>;
};
export declare type RICFileStartResp = {
    batchMsgSize: number;
    batchAckSize: number;
};
export declare type RICWifi = {
    isConn: 1 | 0;
    connState: string;
    SSID: string;
    IP: string;
    Hostname: string;
};
export declare class RICStateInfo {
    smartServos: ROSSerialSmartServos;
    smartServosValidMs: number;
    imuData: ROSSerialIMU;
    imuDataValidMs: number;
    power: ROSSerialPowerStatus;
    powerValidMs: number;
    addOnInfo: ROSSerialAddOnStatusList;
    addOnInfoValidMs: number;
}
export declare type RICFile = {
    name: string;
    size: number;
};
export declare class RICFileList {
    req: string;
    rslt: string;
    fsName: string;
    fsBase: string;
    diskSize: number;
    diskUsed: number;
    folder: string;
    files: Array<RICFile>;
}
export declare type RICHWElem = {
    name: string;
    type: string;
    busName: string;
    addr: string;
    addrValid: number;
    IDNo: string;
    whoAmI: string;
    whoAmITypeCode: string;
    SN: string;
    versionStr: string;
    commsOk: number;
};
export declare class RICHWElemList {
    req: string;
    rslt: string;
    hw: Array<RICHWElem>;
}
export declare type RICAddOn = {
    name: string;
    SN: string;
    poll: string;
    pollRd: number;
    pollHz: number;
};
export declare class RICAddOnList {
    req: string;
    rslt: string;
    addons: Array<RICAddOn>;
}
export declare class AddOnElemAndConfig {
    constructor(addOnConfig: RICAddOn | null, hwElemRec: RICHWElem | null, elemIdx: number);
    addOnConfig: RICAddOn | null;
    hwElemRec: RICHWElem | null;
    name: string;
    SN: string;
    id: string;
    isConnected: boolean;
    isConfigured: boolean;
}
export interface Dictionary<T> {
    [key: string]: T;
}
export declare type RICConnEventArgs = {
    ipAddress?: string;
    name?: string;
    ifType?: RICIFType;
    systemInfo?: RICSystemInfo;
    newName?: string;
    stage?: string;
    progress?: number;
};
export declare enum RICEvent {
    CONNECTING_RIC = 0,
    CONNECTING_RIC_FAIL = 1,
    CONNECTED_TRANSPORT_LAYER = 2,
    CONNECTED_RIC = 3,
    DISCONNECTED_RIC = 4,
    SET_RIC_NAME_START = 5,
    SET_RIC_NAME_SUCCESS = 6,
    SET_RIC_NAME_FAILED = 7,
    SET_CALIBRATION_FLAG = 8,
    UPDATE_CANT_REACH_SERVER = 9,
    UPDATE_IS_AVAILABLE = 10,
    UPDATE_NOT_AVAILABLE = 11,
    UPDATE_STARTED = 12,
    UPDATE_PROGRESS = 13,
    UPDATE_FAILED = 14,
    UPDATE_SUCCESS_ALL = 15,
    UPDATE_SUCCESS_MAIN_ONLY = 16,
    UPDATE_CANCELLING = 17
}
export declare type RICCmdParams = {
    [key: string]: number;
};
export declare type RICFetchBlobResult = {
    fileBytes: Uint8Array;
    flush: () => void;
};
export declare type RICFetchBlobFnType = (config: Object, httpType: string, filePath: string, progressCB: (received: number, total: number) => void) => RICFetchBlobResult | null;
export declare type RICConnEventFn = (eventType: RICEvent, args?: RICConnEventArgs) => void;
export interface RICEventIF {
    onRxSmartServo(smartServos: ROSSerialSmartServos): void;
    onRxIMU(imuData: ROSSerialIMU): void;
    onRxPowerStatus(powerStatus: ROSSerialPowerStatus): void;
    onRxAddOnPub(addOnInfo: ROSSerialAddOnStatusList): void;
    onConnEvent: RICConnEventFn;
}
export declare enum RICLogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    VERBOSE = 5
}
export declare type RICLogFn = (logLevel: RICLogLevel, msg: string) => void;
