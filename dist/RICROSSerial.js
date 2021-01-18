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
import RICUtils from './RICUtils.js';
export class ROSSerialSmartServos {
    constructor() {
        this.smartServos = [];
    }
}
export class ROSSerialIMU {
    constructor() {
        this.accel = { x: 0, y: 0, z: 0 };
    }
}
export class ROSSerialPowerStatus {
    constructor() {
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
}
export class ROSSerialAddOnStatus {
    constructor() {
        this.id = 0;
        this.deviceTypeID = 0;
        this.name = '';
        this.status = 0;
        this.vals = {};
    }
}
export class ROSSerialAddOnStatusList {
    constructor() {
        this.addons = new Array();
    }
}
export default class RICROSSerial {
    static decode(rosSerialMsg, startPos, messageResult, commsStats, addOnManager) {
        // Payload may contain multiple ROSSerial messages
        let msgPos = startPos;
        while (true) {
            const remainingMsgLen = rosSerialMsg.length - msgPos;
            // ROSSerial ROSTopics
            const ROSTOPIC_V2_SMART_SERVOS = 120;
            const ROSTOPIC_V2_ACCEL = 121;
            const ROSTOPIC_V2_POWER_STATUS = 122;
            const ROSTOPIC_V2_ADDONS = 123;
            // ROSSerial message format
            const RS_MSG_MIN_LENGTH = 8;
            const RS_MSG_LEN_LOW_POS = 2;
            const RS_MSG_LEN_HIGH_POS = 3;
            const RS_MSG_TOPIC_ID_LOW_POS = 5;
            const RS_MSG_TOPIC_ID_HIGH_POS = 6;
            const RS_MSG_PAYLOAD_POS = 7;
            // Max payload length
            const MAX_VALID_PAYLOAD_LEN = 1000;
            // RICUtils.debug('ROSSerial Decode ' + remainingMsgLen);
            if (remainingMsgLen < RS_MSG_MIN_LENGTH)
                break;
            // Extract header
            const payloadLength = rosSerialMsg[msgPos + RS_MSG_LEN_LOW_POS] +
                rosSerialMsg[msgPos + RS_MSG_LEN_HIGH_POS] * 256;
            const topicID = rosSerialMsg[msgPos + RS_MSG_TOPIC_ID_LOW_POS] +
                rosSerialMsg[msgPos + RS_MSG_TOPIC_ID_HIGH_POS] * 256;
            // RICUtils.debug('ROSSerial ' + payloadLength + ' topic ' + topicID);
            // Check max length
            if (payloadLength < 0 || payloadLength > MAX_VALID_PAYLOAD_LEN)
                break;
            // Check min length
            if (rosSerialMsg.length < payloadLength + RS_MSG_MIN_LENGTH)
                break;
            // Extract payload
            const payload = rosSerialMsg.slice(msgPos + RS_MSG_PAYLOAD_POS, msgPos + RS_MSG_PAYLOAD_POS + payloadLength);
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
    }
    static extractSmartServos(buf) {
        // Each group of attributes for a servo is a fixed size
        const ROS_SMART_SERVOS_ATTR_GROUP_BYTES = 6;
        const numGroups = Math.floor(buf.length / ROS_SMART_SERVOS_ATTR_GROUP_BYTES);
        const msg = { smartServos: [] };
        let bufPos = 0;
        for (let i = 0; i < numGroups; i++) {
            const servoId = buf[bufPos];
            const servoPos = RICUtils.getBEInt16FromBuf(buf, bufPos + 1);
            const servoCurrent = RICUtils.getBEUint16FromBuf(buf, bufPos + 3);
            const servoStatus = buf[bufPos + 5];
            bufPos += ROS_SMART_SERVOS_ATTR_GROUP_BYTES;
            msg.smartServos.push({
                id: servoId,
                pos: servoPos,
                current: servoCurrent,
                status: servoStatus,
            });
        }
        return msg;
    }
    static extractAccel(buf) {
        // Three accelerometer floats
        const x = RICUtils.getBEFloatFromBuf(buf);
        const y = RICUtils.getBEFloatFromBuf(buf.slice(4));
        const z = RICUtils.getBEFloatFromBuf(buf.slice(8));
        return { accel: { x: x / 1024, y: y / 1024, z: z / 1024 } };
    }
    static extractPowerStatus(buf) {
        // Power indicator values
        // RICUtils.debug(`PowerStatus ${RICUtils.bufferToHex(buf)}`);
        const remCapPC = RICUtils.getBEUint8FromBuf(buf, 0);
        const tempDegC = RICUtils.getBEUint8FromBuf(buf, 1);
        const remCapMAH = RICUtils.getBEUint16FromBuf(buf, 2);
        const fullCapMAH = RICUtils.getBEUint16FromBuf(buf, 4);
        const currentMA = RICUtils.getBEInt16FromBuf(buf, 6);
        const power5VOnTimeSecs = RICUtils.getBEUint16FromBuf(buf, 8);
        const powerFlags = RICUtils.getBEUint16FromBuf(buf, 10);
        const isOnUSBPower = (powerFlags & 0x0001) != 0;
        const is5VOn = (powerFlags & 0x0002) != 0;
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
    }
    static extractAddOnStatus(buf, addOnManager) {
        // RICUtils.debug(`AddOnRawData ${RICUtils.bufferToHex(buf)}`);
        // Each group of attributes for a add-on is a fixed size
        const ROS_ADDON_ATTR_GROUP_BYTES = 12;
        const numGroups = Math.floor(buf.length / ROS_ADDON_ATTR_GROUP_BYTES);
        const msg = { addons: [] };
        let bufPos = 0;
        for (let i = 0; i < numGroups; i++) {
            const addOnId = buf[bufPos];
            const status = buf[bufPos + 1];
            const addOnData = buf.slice(bufPos + 2, bufPos + 12);
            bufPos += ROS_ADDON_ATTR_GROUP_BYTES;
            const addOnRec = addOnManager.processPublishedData(addOnId, status, addOnData);
            if (addOnRec !== null) {
                msg.addons.push(addOnRec);
            }
        }
        return msg;
    }
}
