/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICTypes
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {
    ROSSerialSmartServos,
    ROSSerialIMU,
    ROSSerialPowerStatus,
    ROSSerialAddOnStatusList,
} from './RICROSSerial.js';

export enum RICIFType {
    RIC_INTERFACE_BLE,
    RIC_INTERFACE_WIFI,
}

export enum RICFileSendType {
    RIC_NORMAL_FILE,
    RIC_FIRMWARE_UPDATE,
}

export class DiscoveredRIC {
    _localName = '';
    _name = '';
    _id = '';
    _rssi = -150;
    _hostnameOrIPAddress = '';
    _interface = RICIFType.RIC_INTERFACE_WIFI;
    constructor(localNameOrIPAddress: string, name: string, id?: string, rssi?: number) {
        if (typeof id !== 'undefined') {
            this._localName = localNameOrIPAddress;
            this._interface = RICIFType.RIC_INTERFACE_BLE;
            this._id = id;
            if (typeof rssi !== 'undefined') {
                this._rssi = rssi;
            }
        } else {
            this._interface = RICIFType.RIC_INTERFACE_WIFI;
            this._hostnameOrIPAddress = localNameOrIPAddress;
        }
        this._name = name;
    }
    get name(): string {
        if (this._localName !== null && this._localName.length > 0) {
            return this._localName;
        }
        if (this._name !== null) {
            return this._name;
        }
        return 'Un-named';
    }
    get id(): string {
        if (this._id !== null) return this._id;
        return '';
    }
    get rssi(): number {
        if (this._rssi !== null) return this._rssi;
        return -100;
    }
    get ipAddress(): string {
        if (this._hostnameOrIPAddress !== null) return this._hostnameOrIPAddress;
        return '';
    }
}

export enum DiscoveryInterfaces {
    DISCOVER_ANY,
    DISCOVER_BLE_ONLY,
    DISCOVER_IP_ONLY,
}

export enum RICDiscoveryState {
    RIC_STATE_RICS_DISCOVERED,
}

export interface RICSubscription {
    remove(): void;
}

export type RICDiscoveryListener = (
    newState: RICDiscoveryState,
    discoveredRICs: DiscoveredRIC[],
) => void;

export type DiscoveredRICsCB = (discoveredRICs: DiscoveredRIC[]) => void;

export type RICFriendlyName = {
    friendlyName: string;
};

export class RICNameResponse {
    friendlyName = '';
    friendlyNameIsSet = 0;
    req = '';
    rslt = 'commsFail';
}

export class RICSystemInfo {
    rslt = '';
    SystemName = 'Unknown';
    SystemVersion = '0.0.0';
}

export class RICCalibInfo {
    rslt = '';
    calDone = 0;
}

export class RICOKFail {
    constructor(rsltFlag: boolean | undefined = undefined) {
        this.set(rsltFlag === undefined ? false : rsltFlag);
    }
    set(rsltFlag: boolean): void {
        if (rsltFlag) {
            this.rslt = 'ok';
        } else {
            this.rslt = 'fail';
        }
    }
    rslt = 'commsFail';
}

export class RICHWFWStat {
    s = '';
    m = '';
    v = '';
    n = '';
    p = 0;
    i = 0;
    c = [];
}

export class RICHWFWUpdRslt {
    req = '';
    rslt = 'commsFail';
    st: RICHWFWStat = new RICHWFWStat();
}

export type RICFWInfo = {
    elemType: string;
    version: string;
    firmware: string;
    destname: string;
    md5: string;
    releaseNotes: string;
    comments: string;
};

export type RICUpdateInfo = {
    rslt: string;
    main: RICFWInfo;
    addons: Array<RICFWInfo>;
};

export type RICFileStartResp = {
    batchMsgSize: number;
    batchAckSize: number;
};

export type RICWifi = {
    isConn: 1 | 0;
    connState: string;
    SSID: string;
    IP: string;
    Hostname: string;
};

export class RICStateInfo {
    smartServos: ROSSerialSmartServos = new ROSSerialSmartServos();
    smartServosValidMs = 0;
    imuData: ROSSerialIMU = new ROSSerialIMU();
    imuDataValidMs = 0;
    power: ROSSerialPowerStatus = new ROSSerialPowerStatus();
    powerValidMs = 0;
    addOnInfo: ROSSerialAddOnStatusList = new ROSSerialAddOnStatusList();
    addOnInfoValidMs = 0;
}

export type RICFile = {
    name: string;
    size: number;
};

export class RICFileList {
    req = '';
    rslt = 'ok';
    fsName = 'spiffs';
    fsBase = '/spiffs';
    diskSize = 0;
    diskUsed = 0;
    folder = '/spiffs/';
    files: Array<RICFile> = [];
}

export type RICHWElem = {
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

export class RICHWElemList {
    req = '';
    rslt = 'ok';
    hw: Array<RICHWElem> = [];
}

export type RICAddOn = {
    name: string;
    SN: string;
    poll: string;
    pollRd: number;
    pollHz: number;
};

export class RICAddOnList {
    req = '';
    rslt = 'ok';
    addons: Array<RICAddOn> = [];
}

export class AddOnElemAndConfig {
    constructor(
        addOnConfig: RICAddOn | null,
        hwElemRec: RICHWElem | null,
        elemIdx: number,
    ) {
        this.isConfigured = addOnConfig !== null;
        this.isConnected = hwElemRec !== null;
        if (addOnConfig != null) {
            this.SN = addOnConfig.SN;
            this.name = addOnConfig.name;
        } else if (hwElemRec != null) {
            this.SN = hwElemRec.SN;
            this.name = hwElemRec.name;
        }
        this.addOnConfig = addOnConfig;
        this.hwElemRec = hwElemRec;
        this.id = elemIdx.toString();
    }

    // Fields from config (stored in RIC NVS using addon REST API)
    addOnConfig: RICAddOn | null = null;
    // Fields from HWElem (from hwstatus command)
    hwElemRec: RICHWElem | null = null;
    // Fields allocated when combining records
    name = '';
    SN = '';
    id = '0';
    isConnected = false;
    isConfigured = false;
}

export interface Dictionary<T> {
    [key: string]: T;
}

export type RICConnEventArgs = {
    ipAddress?: string;
    name?: string;
    ifType?: RICIFType;
    systemInfo?: RICSystemInfo;
    newName?: string;
    stage?: string;
    progress?: number;
}

export enum RICEvent {
    CONNECTING_RIC,
    CONNECTING_RIC_FAIL,
    CONNECTED_TRANSPORT_LAYER,
    CONNECTED_RIC,
    DISCONNECTED_RIC,
    SET_RIC_NAME_START,
    SET_RIC_NAME_SUCCESS,
    SET_RIC_NAME_FAILED,
    SET_CALIBRATION_FLAG,
    UPDATE_CANT_REACH_SERVER,
    UPDATE_IS_AVAILABLE,
    UPDATE_NOT_AVAILABLE,
    UPDATE_STARTED,
    UPDATE_PROGRESS,
    UPDATE_FAILED,
    UPDATE_SUCCESS_ALL,
    UPDATE_SUCCESS_MAIN_ONLY,
    UPDATE_CANCELLING,
};

export type RICCmdParams = { [key: string]: number };

export type RICFetchBlobResult = {
    fileBytes: Uint8Array,
    flush: () => void
};

export type RICFetchBlobFnType = (
    config: Object,
    httpType: string,
    filePath: string,
    progressCB: (received: number, total: number) => void,
) => RICFetchBlobResult | null;

export type RICConnEventFn = (
    eventType: RICEvent,
    args?: RICConnEventArgs
) => void;

export interface RICEventIF {
    onRxSmartServo(smartServos: ROSSerialSmartServos): void;
    onRxIMU(imuData: ROSSerialIMU): void;
    onRxPowerStatus(powerStatus: ROSSerialPowerStatus): void;
    onRxAddOnPub(addOnInfo: ROSSerialAddOnStatusList): void;
    onConnEvent: RICConnEventFn;
}

export enum RICLogLevel {
    NONE,
    ERROR,
    WARN,
    INFO,
    DEBUG,
    VERBOSE
}

export type RICLogFn = (logLevel: RICLogLevel, msg: string) => void;