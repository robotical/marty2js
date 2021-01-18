"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICROSSerial
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
var ROSSerialSmartServos = /** @class */ (function () {
    function ROSSerialSmartServos() {
        this.smartServos = [];
    }
    return ROSSerialSmartServos;
}());
exports.ROSSerialSmartServos = ROSSerialSmartServos;
var ROSSerialIMU = /** @class */ (function () {
    function ROSSerialIMU() {
        this.accel = { x: 0, y: 0, z: 0 };
    }
    return ROSSerialIMU;
}());
exports.ROSSerialIMU = ROSSerialIMU;
var ROSSerialPowerStatus = /** @class */ (function () {
    function ROSSerialPowerStatus() {
        this.powerStatus = {
            battRemainCapacityPercent: 0,
            battTempDegC: 0,
            battRemainCapacityMAH: 0,
            battFullCapacityMAH: 0,
            battCurrentMA: 0,
            power5VOnTimeSecs: 0,
            power5VIsOn: false,
            powerUSBIsConnected: false,
        };
    }
    return ROSSerialPowerStatus;
}());
exports.ROSSerialPowerStatus = ROSSerialPowerStatus;
var ROSSerialAddOnStatus = /** @class */ (function () {
    function ROSSerialAddOnStatus() {
        this.id = 0;
        this.deviceTypeID = 0;
        this.name = '';
        this.status = 0;
        this.vals = {};
    }
    return ROSSerialAddOnStatus;
}());
exports.ROSSerialAddOnStatus = ROSSerialAddOnStatus;
var ROSSerialAddOnStatusList = /** @class */ (function () {
    function ROSSerialAddOnStatusList() {
        this.addons = new Array();
    }
    return ROSSerialAddOnStatusList;
}());
exports.ROSSerialAddOnStatusList = ROSSerialAddOnStatusList;
var RICROSSerial = /** @class */ (function () {
    function RICROSSerial() {
    }
    RICROSSerial.decode = function (rosSerialMsg, startPos, messageResult, commsStats, addOnManager) {
        // Payload may contain multiple ROSSerial messages
        var msgPos = startPos;
        while (true) {
            var remainingMsgLen = rosSerialMsg.length - msgPos;
            // ROSSerial ROSTopics
            var ROSTOPIC_V2_SMART_SERVOS = 120;
            var ROSTOPIC_V2_ACCEL = 121;
            var ROSTOPIC_V2_POWER_STATUS = 122;
            var ROSTOPIC_V2_ADDONS = 123;
            // ROSSerial message format
            var RS_MSG_MIN_LENGTH = 8;
            var RS_MSG_LEN_LOW_POS = 2;
            var RS_MSG_LEN_HIGH_POS = 3;
            var RS_MSG_TOPIC_ID_LOW_POS = 5;
            var RS_MSG_TOPIC_ID_HIGH_POS = 6;
            var RS_MSG_PAYLOAD_POS = 7;
            // Max payload length
            var MAX_VALID_PAYLOAD_LEN = 1000;
            // RICUtils.debug('ROSSerial Decode ' + remainingMsgLen);
            if (remainingMsgLen < RS_MSG_MIN_LENGTH)
                break;
            // Extract header
            var payloadLength = rosSerialMsg[msgPos + RS_MSG_LEN_LOW_POS] +
                rosSerialMsg[msgPos + RS_MSG_LEN_HIGH_POS] * 256;
            var topicID = rosSerialMsg[msgPos + RS_MSG_TOPIC_ID_LOW_POS] +
                rosSerialMsg[msgPos + RS_MSG_TOPIC_ID_HIGH_POS] * 256;
            // RICUtils.debug('ROSSerial ' + payloadLength + ' topic ' + topicID);
            // Check max length
            if (payloadLength < 0 || payloadLength > MAX_VALID_PAYLOAD_LEN)
                break;
            // Check min length
            if (rosSerialMsg.length < payloadLength + RS_MSG_MIN_LENGTH)
                break;
            // Extract payload
            var payload = rosSerialMsg.slice(msgPos + RS_MSG_PAYLOAD_POS, msgPos + RS_MSG_PAYLOAD_POS + payloadLength);
            // RICUtils.debug('ROSSerial ' + RICUtils.bufferToHex(payload));
            // Extract SmartServos message
            if (topicID === ROSTOPIC_V2_SMART_SERVOS) {
                if (messageResult !== null) {
                    messageResult.onRxSmartServo(this.extractSmartServos(payload));
                    commsStats.recordSmartServos();
                }
            }
            // Extract Accelerometer message
            else if (topicID === ROSTOPIC_V2_ACCEL) {
                if (messageResult !== null) {
                    messageResult.onRxIMU(this.extractAccel(payload));
                    commsStats.recordIMU();
                }
            }
            // Extract Power status message
            else if (topicID === ROSTOPIC_V2_POWER_STATUS) {
                if (messageResult !== null) {
                    messageResult.onRxPowerStatus(this.extractPowerStatus(payload));
                    commsStats.recordPowerStatus();
                }
            }
            // Extract add-on message
            else if (topicID === ROSTOPIC_V2_ADDONS) {
                if (messageResult !== null) {
                    messageResult.onRxAddOnPub(this.extractAddOnStatus(payload, addOnManager));
                    commsStats.recordAddOnPub();
                }
            }
            // Move msgPos on
            msgPos += RS_MSG_PAYLOAD_POS + payloadLength + 1;
            // RICUtils.debug('MsgPos ' + msgPos);
        }
    };
    RICROSSerial.extractSmartServos = function (buf) {
        // Each group of attributes for a servo is a fixed size
        var ROS_SMART_SERVOS_ATTR_GROUP_BYTES = 6;
        var numGroups = Math.floor(buf.length / ROS_SMART_SERVOS_ATTR_GROUP_BYTES);
        var msg = { smartServos: [] };
        var bufPos = 0;
        for (var i = 0; i < numGroups; i++) {
            var servoId = buf[bufPos];
            var servoPos = RICUtils_js_1.default.getBEInt16FromBuf(buf, bufPos + 1);
            var servoCurrent = RICUtils_js_1.default.getBEUint16FromBuf(buf, bufPos + 3);
            var servoStatus = buf[bufPos + 5];
            bufPos += ROS_SMART_SERVOS_ATTR_GROUP_BYTES;
            msg.smartServos.push({
                id: servoId,
                pos: servoPos,
                current: servoCurrent,
                status: servoStatus,
            });
        }
        return msg;
    };
    RICROSSerial.extractAccel = function (buf) {
        // Three accelerometer floats
        var x = RICUtils_js_1.default.getBEFloatFromBuf(buf);
        var y = RICUtils_js_1.default.getBEFloatFromBuf(buf.slice(4));
        var z = RICUtils_js_1.default.getBEFloatFromBuf(buf.slice(8));
        return { accel: { x: x / 1024, y: y / 1024, z: z / 1024 } };
    };
    RICROSSerial.extractPowerStatus = function (buf) {
        // Power indicator values
        // RICUtils.debug(`PowerStatus ${RICUtils.bufferToHex(buf)}`);
        var remCapPC = RICUtils_js_1.default.getBEUint8FromBuf(buf, 0);
        var tempDegC = RICUtils_js_1.default.getBEUint8FromBuf(buf, 1);
        var remCapMAH = RICUtils_js_1.default.getBEUint16FromBuf(buf, 2);
        var fullCapMAH = RICUtils_js_1.default.getBEUint16FromBuf(buf, 4);
        var currentMA = RICUtils_js_1.default.getBEInt16FromBuf(buf, 6);
        var power5VOnTimeSecs = RICUtils_js_1.default.getBEUint16FromBuf(buf, 8);
        var powerFlags = RICUtils_js_1.default.getBEUint16FromBuf(buf, 10);
        var isOnUSBPower = (powerFlags & 0x0001) != 0;
        var is5VOn = (powerFlags & 0x0002) != 0;
        return {
            powerStatus: {
                battRemainCapacityPercent: remCapPC,
                battTempDegC: tempDegC,
                battRemainCapacityMAH: remCapMAH,
                battFullCapacityMAH: fullCapMAH,
                battCurrentMA: currentMA,
                power5VOnTimeSecs: power5VOnTimeSecs,
                power5VIsOn: is5VOn,
                powerUSBIsConnected: isOnUSBPower,
            },
        };
    };
    RICROSSerial.extractAddOnStatus = function (buf, addOnManager) {
        // RICUtils.debug(`AddOnRawData ${RICUtils.bufferToHex(buf)}`);
        // Each group of attributes for a add-on is a fixed size
        var ROS_ADDON_ATTR_GROUP_BYTES = 12;
        var numGroups = Math.floor(buf.length / ROS_ADDON_ATTR_GROUP_BYTES);
        var msg = { addons: [] };
        var bufPos = 0;
        for (var i = 0; i < numGroups; i++) {
            var addOnId = buf[bufPos];
            var status_1 = buf[bufPos + 1];
            var addOnData = buf.slice(bufPos + 2, bufPos + 12);
            bufPos += ROS_ADDON_ATTR_GROUP_BYTES;
            var addOnRec = addOnManager.processPublishedData(addOnId, status_1, addOnData);
            if (addOnRec !== null) {
                msg.addons.push(addOnRec);
            }
        }
        return msg;
    };
    return RICROSSerial;
}());
exports.default = RICROSSerial;
