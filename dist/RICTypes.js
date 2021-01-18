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
import { ROSSerialSmartServos, ROSSerialIMU, ROSSerialPowerStatus, ROSSerialAddOnStatusList, } from './RICROSSerial.js';
export var RICIFType;
(function (RICIFType) {
    RICIFType[RICIFType["RIC_INTERFACE_BLE"] = 0] = "RIC_INTERFACE_BLE";
    RICIFType[RICIFType["RIC_INTERFACE_WIFI"] = 1] = "RIC_INTERFACE_WIFI";
})(RICIFType || (RICIFType = {}));
export var RICFileSendType;
(function (RICFileSendType) {
    RICFileSendType[RICFileSendType["RIC_NORMAL_FILE"] = 0] = "RIC_NORMAL_FILE";
    RICFileSendType[RICFileSendType["RIC_FIRMWARE_UPDATE"] = 1] = "RIC_FIRMWARE_UPDATE";
})(RICFileSendType || (RICFileSendType = {}));
export class DiscoveredRIC {
    constructor(localNameOrIPAddress, name, id, rssi) {
        this._localName = '';
        this._name = '';
        this._id = '';
        this._rssi = -150;
        this._hostnameOrIPAddress = '';
        this._interface = RICIFType.RIC_INTERFACE_WIFI;
        if (typeof id !== 'undefined') {
            this._localName = localNameOrIPAddress;
            this._interface = RICIFType.RIC_INTERFACE_BLE;
            this._id = id;
            if (typeof rssi !== 'undefined') {
                this._rssi = rssi;
            }
        }
        else {
            this._interface = RICIFType.RIC_INTERFACE_WIFI;
            this._hostnameOrIPAddress = localNameOrIPAddress;
        }
        this._name = name;
    }
    get name() {
        if (this._localName !== null && this._localName.length > 0) {
            return this._localName;
        }
        if (this._name !== null) {
            return this._name;
        }
        return 'Un-named';
    }
    get id() {
        if (this._id !== null)
            return this._id;
        return '';
    }
    get rssi() {
        if (this._rssi !== null)
            return this._rssi;
        return -100;
    }
    get ipAddress() {
        if (this._hostnameOrIPAddress !== null)
            return this._hostnameOrIPAddress;
        return '';
    }
}
export var DiscoveryInterfaces;
(function (DiscoveryInterfaces) {
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_ANY"] = 0] = "DISCOVER_ANY";
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_BLE_ONLY"] = 1] = "DISCOVER_BLE_ONLY";
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_IP_ONLY"] = 2] = "DISCOVER_IP_ONLY";
})(DiscoveryInterfaces || (DiscoveryInterfaces = {}));
export var RICDiscoveryState;
(function (RICDiscoveryState) {
    RICDiscoveryState[RICDiscoveryState["RIC_STATE_RICS_DISCOVERED"] = 0] = "RIC_STATE_RICS_DISCOVERED";
})(RICDiscoveryState || (RICDiscoveryState = {}));
export class RICNameResponse {
    constructor() {
        this.friendlyName = '';
        this.friendlyNameIsSet = 0;
        this.req = '';
        this.rslt = 'commsFail';
    }
}
export class RICSystemInfo {
    constructor() {
        this.rslt = '';
        this.SystemName = 'Unknown';
        this.SystemVersion = '0.0.0';
    }
}
export class RICCalibInfo {
    constructor() {
        this.rslt = '';
        this.calDone = 0;
    }
}
export class RICOKFail {
    constructor() {
        this.rslt = 'commsFail';
    }
    set(rsltFlag) {
        if (rsltFlag) {
            this.rslt = 'ok';
        }
        else {
            this.rslt = 'fail';
        }
    }
}
export class RICHWFWStat {
    constructor() {
        this.s = '';
        this.m = '';
        this.v = '';
        this.n = '';
        this.p = 0;
        this.i = 0;
        this.c = [];
    }
}
export class RICHWFWUpdRslt {
    constructor() {
        this.req = '';
        this.rslt = 'commsFail';
        this.st = new RICHWFWStat();
    }
}
export class RICStateInfo {
    constructor() {
        this.smartServos = new ROSSerialSmartServos();
        this.smartServosValidMs = 0;
        this.imuData = new ROSSerialIMU();
        this.imuDataValidMs = 0;
        this.power = new ROSSerialPowerStatus();
        this.powerValidMs = 0;
        this.addOnInfo = new ROSSerialAddOnStatusList();
        this.addOnInfoValidMs = 0;
    }
}
export class RICFileList {
    constructor() {
        this.req = '';
        this.rslt = 'ok';
        this.fsName = 'spiffs';
        this.fsBase = '/spiffs';
        this.diskSize = 0;
        this.diskUsed = 0;
        this.folder = '/spiffs/';
        this.files = [];
    }
}
export class RICHWElemList {
    constructor() {
        this.req = '';
        this.rslt = 'ok';
        this.hw = [];
    }
}
export class RICAddOnList {
    constructor() {
        this.req = '';
        this.rslt = 'ok';
        this.addons = [];
    }
}
export class AddOnElemAndConfig {
    constructor(addOnConfig, hwElemRec, elemIdx) {
        // Fields from config (stored in RIC NVS using addon REST API)
        this.addOnConfig = null;
        // Fields from HWElem (from hwstatus command)
        this.hwElemRec = null;
        // Fields allocated when combining records
        this.name = '';
        this.SN = '';
        this.id = '0';
        this.isConnected = false;
        this.isConfigured = false;
        this.isConfigured = addOnConfig !== null;
        this.isConnected = hwElemRec !== null;
        if (addOnConfig != null) {
            this.SN = addOnConfig.SN;
            this.name = addOnConfig.name;
        }
        else if (hwElemRec != null) {
            this.SN = hwElemRec.SN;
            this.name = hwElemRec.name;
        }
        this.addOnConfig = addOnConfig;
        this.hwElemRec = hwElemRec;
        this.id = elemIdx.toString();
    }
}
export var RICEvent;
(function (RICEvent) {
    RICEvent[RICEvent["CONNECTING_RIC"] = 0] = "CONNECTING_RIC";
    RICEvent[RICEvent["CONNECTING_RIC_FAIL"] = 1] = "CONNECTING_RIC_FAIL";
    RICEvent[RICEvent["CONNECTED_TRANSPORT_LAYER"] = 2] = "CONNECTED_TRANSPORT_LAYER";
    RICEvent[RICEvent["CONNECTED_RIC"] = 3] = "CONNECTED_RIC";
    RICEvent[RICEvent["DISCONNECTED_RIC"] = 4] = "DISCONNECTED_RIC";
    RICEvent[RICEvent["SET_RIC_NAME_START"] = 5] = "SET_RIC_NAME_START";
    RICEvent[RICEvent["SET_RIC_NAME_SUCCESS"] = 6] = "SET_RIC_NAME_SUCCESS";
    RICEvent[RICEvent["SET_RIC_NAME_FAILED"] = 7] = "SET_RIC_NAME_FAILED";
    RICEvent[RICEvent["SET_CALIBRATION_FLAG"] = 8] = "SET_CALIBRATION_FLAG";
    RICEvent[RICEvent["UPDATE_CANT_REACH_SERVER"] = 9] = "UPDATE_CANT_REACH_SERVER";
    RICEvent[RICEvent["UPDATE_IS_AVAILABLE"] = 10] = "UPDATE_IS_AVAILABLE";
    RICEvent[RICEvent["UPDATE_NOT_AVAILABLE"] = 11] = "UPDATE_NOT_AVAILABLE";
    RICEvent[RICEvent["UPDATE_STARTED"] = 12] = "UPDATE_STARTED";
    RICEvent[RICEvent["UPDATE_PROGRESS"] = 13] = "UPDATE_PROGRESS";
    RICEvent[RICEvent["UPDATE_FAILED"] = 14] = "UPDATE_FAILED";
    RICEvent[RICEvent["UPDATE_SUCCESS_ALL"] = 15] = "UPDATE_SUCCESS_ALL";
    RICEvent[RICEvent["UPDATE_SUCCESS_MAIN_ONLY"] = 16] = "UPDATE_SUCCESS_MAIN_ONLY";
    RICEvent[RICEvent["UPDATE_CANCELLING"] = 17] = "UPDATE_CANCELLING";
})(RICEvent || (RICEvent = {}));
;
