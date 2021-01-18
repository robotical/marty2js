"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var RICROSSerial_js_1 = require("./RICROSSerial.js");
var RICIFType;
(function (RICIFType) {
    RICIFType[RICIFType["RIC_INTERFACE_BLE"] = 0] = "RIC_INTERFACE_BLE";
    RICIFType[RICIFType["RIC_INTERFACE_WIFI"] = 1] = "RIC_INTERFACE_WIFI";
})(RICIFType = exports.RICIFType || (exports.RICIFType = {}));
var RICFileSendType;
(function (RICFileSendType) {
    RICFileSendType[RICFileSendType["RIC_NORMAL_FILE"] = 0] = "RIC_NORMAL_FILE";
    RICFileSendType[RICFileSendType["RIC_FIRMWARE_UPDATE"] = 1] = "RIC_FIRMWARE_UPDATE";
})(RICFileSendType = exports.RICFileSendType || (exports.RICFileSendType = {}));
var DiscoveredRIC = /** @class */ (function () {
    function DiscoveredRIC(localName, name, id, rssi, url) {
        this._localName = '';
        this._name = '';
        this._id = '';
        this._rssi = -150;
        this._url = '';
        this._localName = localName;
        this._name = name;
        this._id = id;
        this._rssi = rssi;
        this._url = url;
    }
    Object.defineProperty(DiscoveredRIC.prototype, "name", {
        get: function () {
            if (this._localName !== null && this._localName.length > 0) {
                return this._localName;
            }
            if (this._name !== null) {
                return this._name;
            }
            return 'Un-named';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiscoveredRIC.prototype, "id", {
        get: function () {
            if (this._id !== null)
                return this._id;
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiscoveredRIC.prototype, "rssi", {
        get: function () {
            if (this._rssi !== null)
                return this._rssi;
            return -100;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiscoveredRIC.prototype, "url", {
        get: function () {
            if (this._url !== null)
                return this._url;
            return '';
        },
        enumerable: true,
        configurable: true
    });
    return DiscoveredRIC;
}());
exports.DiscoveredRIC = DiscoveredRIC;
var DiscoveryInterfaces;
(function (DiscoveryInterfaces) {
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_ANY"] = 0] = "DISCOVER_ANY";
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_BLE_ONLY"] = 1] = "DISCOVER_BLE_ONLY";
    DiscoveryInterfaces[DiscoveryInterfaces["DISCOVER_IP_ONLY"] = 2] = "DISCOVER_IP_ONLY";
})(DiscoveryInterfaces = exports.DiscoveryInterfaces || (exports.DiscoveryInterfaces = {}));
var RICDiscoveryState;
(function (RICDiscoveryState) {
    RICDiscoveryState[RICDiscoveryState["RIC_STATE_RICS_DISCOVERED"] = 0] = "RIC_STATE_RICS_DISCOVERED";
})(RICDiscoveryState = exports.RICDiscoveryState || (exports.RICDiscoveryState = {}));
var RICNameResponse = /** @class */ (function () {
    function RICNameResponse() {
        this.friendlyName = '';
        this.friendlyNameIsSet = 0;
        this.req = '';
        this.rslt = 'commsFail';
    }
    return RICNameResponse;
}());
exports.RICNameResponse = RICNameResponse;
var RICSystemInfo = /** @class */ (function () {
    function RICSystemInfo() {
        this.rslt = '';
        this.SystemName = 'Unknown';
        this.SystemVersion = '0.0.0';
    }
    return RICSystemInfo;
}());
exports.RICSystemInfo = RICSystemInfo;
var RICCalibInfo = /** @class */ (function () {
    function RICCalibInfo() {
        this.rslt = '';
        this.calDone = 0;
    }
    return RICCalibInfo;
}());
exports.RICCalibInfo = RICCalibInfo;
var RICOKFail = /** @class */ (function () {
    function RICOKFail() {
        this.rslt = 'commsFail';
    }
    RICOKFail.prototype.set = function (rsltFlag) {
        if (rsltFlag) {
            this.rslt = 'ok';
        }
        else {
            this.rslt = 'fail';
        }
    };
    return RICOKFail;
}());
exports.RICOKFail = RICOKFail;
var RICHWFWStat = /** @class */ (function () {
    function RICHWFWStat() {
        this.s = '';
        this.m = '';
        this.v = '';
        this.n = '';
        this.p = 0;
        this.i = 0;
        this.c = [];
    }
    return RICHWFWStat;
}());
exports.RICHWFWStat = RICHWFWStat;
var RICHWFWUpdRslt = /** @class */ (function () {
    function RICHWFWUpdRslt() {
        this.req = '';
        this.rslt = 'commsFail';
        this.st = new RICHWFWStat();
    }
    return RICHWFWUpdRslt;
}());
exports.RICHWFWUpdRslt = RICHWFWUpdRslt;
var RICStateInfo = /** @class */ (function () {
    function RICStateInfo() {
        this.smartServos = new RICROSSerial_js_1.ROSSerialSmartServos();
        this.smartServosValidMs = 0;
        this.imuData = new RICROSSerial_js_1.ROSSerialIMU();
        this.imuDataValidMs = 0;
        this.power = new RICROSSerial_js_1.ROSSerialPowerStatus();
        this.powerValidMs = 0;
        this.addOnInfo = new RICROSSerial_js_1.ROSSerialAddOnStatusList();
        this.addOnInfoValidMs = 0;
    }
    return RICStateInfo;
}());
exports.RICStateInfo = RICStateInfo;
var RICFileList = /** @class */ (function () {
    function RICFileList() {
        this.req = '';
        this.rslt = 'ok';
        this.fsName = 'spiffs';
        this.fsBase = '/spiffs';
        this.diskSize = 0;
        this.diskUsed = 0;
        this.folder = '/spiffs/';
        this.files = [];
    }
    return RICFileList;
}());
exports.RICFileList = RICFileList;
var RICHWElemList = /** @class */ (function () {
    function RICHWElemList() {
        this.req = '';
        this.rslt = 'ok';
        this.hw = [];
    }
    return RICHWElemList;
}());
exports.RICHWElemList = RICHWElemList;
var RICAddOnList = /** @class */ (function () {
    function RICAddOnList() {
        this.req = '';
        this.rslt = 'ok';
        this.addons = [];
    }
    return RICAddOnList;
}());
exports.RICAddOnList = RICAddOnList;
var AddOnElemAndConfig = /** @class */ (function () {
    function AddOnElemAndConfig(addOnConfig, hwElemRec, elemIdx) {
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
    return AddOnElemAndConfig;
}());
exports.AddOnElemAndConfig = AddOnElemAndConfig;
var RICEvent;
(function (RICEvent) {
    RICEvent[RICEvent["CONNECTING_RIC"] = 0] = "CONNECTING_RIC";
    RICEvent[RICEvent["CONNECTING_RIC_FAIL"] = 1] = "CONNECTING_RIC_FAIL";
    RICEvent[RICEvent["CONNECTED_RIC"] = 2] = "CONNECTED_RIC";
    RICEvent[RICEvent["DISCONNECTED_RIC"] = 3] = "DISCONNECTED_RIC";
    RICEvent[RICEvent["SET_RIC_NAME_START"] = 4] = "SET_RIC_NAME_START";
    RICEvent[RICEvent["SET_RIC_NAME_SUCCESS"] = 5] = "SET_RIC_NAME_SUCCESS";
    RICEvent[RICEvent["SET_RIC_NAME_FAILED"] = 6] = "SET_RIC_NAME_FAILED";
    RICEvent[RICEvent["SET_CALIBRATION_FLAG"] = 7] = "SET_CALIBRATION_FLAG";
    RICEvent[RICEvent["UPDATE_CANT_REACH_SERVER"] = 8] = "UPDATE_CANT_REACH_SERVER";
    RICEvent[RICEvent["UPDATE_IS_AVAILABLE"] = 9] = "UPDATE_IS_AVAILABLE";
    RICEvent[RICEvent["UPDATE_NOT_AVAILABLE"] = 10] = "UPDATE_NOT_AVAILABLE";
    RICEvent[RICEvent["UPDATE_STARTED"] = 11] = "UPDATE_STARTED";
    RICEvent[RICEvent["UPDATE_PROGRESS"] = 12] = "UPDATE_PROGRESS";
    RICEvent[RICEvent["UPDATE_FAILED"] = 13] = "UPDATE_FAILED";
    RICEvent[RICEvent["UPDATE_SUCCESS_ALL"] = 14] = "UPDATE_SUCCESS_ALL";
    RICEvent[RICEvent["UPDATE_SUCCESS_MAIN_ONLY"] = 15] = "UPDATE_SUCCESS_MAIN_ONLY";
    RICEvent[RICEvent["UPDATE_CANCELLING"] = 16] = "UPDATE_CANCELLING";
})(RICEvent = exports.RICEvent || (exports.RICEvent = {}));
;
