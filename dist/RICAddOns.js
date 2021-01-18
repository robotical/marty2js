"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var DataExtractor_js_1 = __importStar(require("./DataExtractor.js"));
var RICROSSerial_js_1 = require("./RICROSSerial.js");
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
// RIC ADDON CODES
exports.RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = '0000008A';
exports.RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = '00000086';
exports.RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = '00000085';
exports.RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = '00000084';
exports.RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = '00000083';
// Format definitions
var ADDON_IRFOOT_FORMAT_DEF = {
    fields: [
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_BOOL,
            suffix: 'Touch',
            atBit: 8,
            bits: 1,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_BOOL,
            suffix: 'Air',
            atBit: 9,
            bits: 1,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Val',
            atBit: 16,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
    ],
};
var ADDON_COLOURSENSOR_FORMAT_DEF = {
    fields: [
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Clear',
            atBit: 8,
            bits: 8,
            postMult: 1,
            postAdd: 0,
            littleEndian: false,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Red',
            atBit: 16,
            bits: 8,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Green',
            atBit: 24,
            bits: 8,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Blue',
            atBit: 32,
            bits: 8,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_BOOL,
            suffix: 'Touch',
            atBit: 48,
            bits: 1,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_BOOL,
            suffix: 'Air',
            atBit: 49,
            bits: 1,
            postMult: 1,
            postAdd: 0,
        },
    ],
};
var ADDON_DISTANCESENSOR_FORMAT_DEF = {
    fields: [
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Reading',
            atBit: 8,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
    ],
};
var ADDON_LIGHTSENSOR_FORMAT_DEF = {
    fields: [
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Reading1',
            atBit: 8,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Reading2',
            atBit: 24,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Reading3',
            atBit: 40,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
    ],
};
var ADDON_NOISESENSOR_FORMAT_DEF = {
    fields: [
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Smoothed',
            atBit: 8,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'HighestSinceLastReading',
            atBit: 24,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
        {
            type: DataExtractor_js_1.DataExtractorVarType.VAR_UNSIGNED,
            suffix: 'Raw',
            atBit: 40,
            bits: 16,
            postMult: 1,
            postAdd: 0,
        },
    ],
};
function getHWElemTypeStr(whoAmITypeCode) {
    RICUtils_js_1.default.debug("getting type code for " + whoAmITypeCode);
    if (whoAmITypeCode === undefined) {
        return "Undefined whoamiTypeCode";
    }
    switch (parseInt(whoAmITypeCode)) {
        case parseInt(exports.RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT):
            return 'IRFoot';
        case parseInt(exports.RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR):
            return 'ColourSensor';
        case parseInt(exports.RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE):
            return 'DistanceSensor';
        case parseInt(exports.RIC_WHOAMI_TYPE_CODE_ADDON_NOISE):
            return 'NoiseSensor';
        case parseInt(exports.RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT):
            return 'LightSensor';
    }
    return "Unknown (" + whoAmITypeCode + ")";
}
exports.getHWElemTypeStr = getHWElemTypeStr;
var RICAddOnBase = /** @class */ (function () {
    function RICAddOnBase(name) {
        this._name = '';
        this._deviceTypeID = 0;
        this._name = name;
    }
    RICAddOnBase.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        RICUtils_js_1.default.debug("RICAddOnBase processPub NOT OVERRIDDEN addOnID " + addOnID + " statusByte " + statusByte + " dataLen " + rawData.length);
        return new RICROSSerial_js_1.ROSSerialAddOnStatus();
    };
    return RICAddOnBase;
}());
exports.RICAddOnBase = RICAddOnBase;
var RICAddOnIRFoot = /** @class */ (function (_super) {
    __extends(RICAddOnIRFoot, _super);
    function RICAddOnIRFoot(name) {
        var _this = _super.call(this, name) || this;
        _this._deviceTypeID = parseInt("0x" + exports.RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT);
        _this._dataExtractor = new DataExtractor_js_1.default(name, ADDON_IRFOOT_FORMAT_DEF);
        return _this;
    }
    RICAddOnIRFoot.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Status to return
        var retStatus = new RICROSSerial_js_1.ROSSerialAddOnStatus();
        // Extract data
        retStatus.id = addOnID;
        retStatus.deviceTypeID = this._deviceTypeID;
        retStatus.name = this._name;
        retStatus.status = statusByte;
        retStatus.vals = this._dataExtractor.extractData(rawData);
        return retStatus;
    };
    return RICAddOnIRFoot;
}(RICAddOnBase));
exports.RICAddOnIRFoot = RICAddOnIRFoot;
var RICAddOnColourSensor = /** @class */ (function (_super) {
    __extends(RICAddOnColourSensor, _super);
    function RICAddOnColourSensor(name) {
        var _this = _super.call(this, name) || this;
        _this._deviceTypeID = parseInt("0x" + exports.RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR);
        _this._dataExtractor = new DataExtractor_js_1.default(name, ADDON_COLOURSENSOR_FORMAT_DEF);
        return _this;
    }
    RICAddOnColourSensor.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Status to return
        var retStatus = new RICROSSerial_js_1.ROSSerialAddOnStatus();
        // Extract data
        retStatus.id = addOnID;
        retStatus.deviceTypeID = this._deviceTypeID;
        retStatus.name = this._name;
        retStatus.status = statusByte;
        retStatus.vals = this._dataExtractor.extractData(rawData);
        return retStatus;
    };
    return RICAddOnColourSensor;
}(RICAddOnBase));
exports.RICAddOnColourSensor = RICAddOnColourSensor;
var RICAddOnDistanceSensor = /** @class */ (function (_super) {
    __extends(RICAddOnDistanceSensor, _super);
    function RICAddOnDistanceSensor(name) {
        var _this = _super.call(this, name) || this;
        _this._deviceTypeID = parseInt("0x" + exports.RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE);
        _this._dataExtractor = new DataExtractor_js_1.default(name, ADDON_DISTANCESENSOR_FORMAT_DEF);
        return _this;
    }
    RICAddOnDistanceSensor.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Status to return
        var retStatus = new RICROSSerial_js_1.ROSSerialAddOnStatus();
        // Extract data
        retStatus.id = addOnID;
        retStatus.deviceTypeID = this._deviceTypeID;
        retStatus.name = this._name;
        retStatus.status = statusByte;
        retStatus.vals = this._dataExtractor.extractData(rawData);
        return retStatus;
    };
    return RICAddOnDistanceSensor;
}(RICAddOnBase));
exports.RICAddOnDistanceSensor = RICAddOnDistanceSensor;
var RICAddOnLightSensor = /** @class */ (function (_super) {
    __extends(RICAddOnLightSensor, _super);
    function RICAddOnLightSensor(name) {
        var _this = _super.call(this, name) || this;
        _this._deviceTypeID = parseInt("0x" + exports.RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT);
        _this._dataExtractor = new DataExtractor_js_1.default(name, ADDON_LIGHTSENSOR_FORMAT_DEF);
        return _this;
    }
    RICAddOnLightSensor.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Status to return
        var retStatus = new RICROSSerial_js_1.ROSSerialAddOnStatus();
        // Extract data
        retStatus.id = addOnID;
        retStatus.deviceTypeID = this._deviceTypeID;
        retStatus.name = this._name;
        retStatus.status = statusByte;
        retStatus.vals = this._dataExtractor.extractData(rawData);
        return retStatus;
    };
    return RICAddOnLightSensor;
}(RICAddOnBase));
exports.RICAddOnLightSensor = RICAddOnLightSensor;
var RICAddOnNoiseSensor = /** @class */ (function (_super) {
    __extends(RICAddOnNoiseSensor, _super);
    function RICAddOnNoiseSensor(name) {
        var _this = _super.call(this, name) || this;
        _this._deviceTypeID = parseInt("0x" + exports.RIC_WHOAMI_TYPE_CODE_ADDON_NOISE);
        _this._dataExtractor = new DataExtractor_js_1.default(name, ADDON_NOISESENSOR_FORMAT_DEF);
        return _this;
    }
    RICAddOnNoiseSensor.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Status to return
        var retStatus = new RICROSSerial_js_1.ROSSerialAddOnStatus();
        // Extract data
        retStatus.id = addOnID;
        retStatus.deviceTypeID = this._deviceTypeID;
        retStatus.name = this._name;
        retStatus.status = statusByte;
        retStatus.vals = this._dataExtractor.extractData(rawData);
        return retStatus;
    };
    return RICAddOnNoiseSensor;
}(RICAddOnBase));
exports.RICAddOnNoiseSensor = RICAddOnNoiseSensor;
