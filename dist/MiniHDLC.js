"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// MiniHDLC
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
/*eslint no-bitwise: ["error", { "allow": ["&", "<<", ">>", "^"] }] */
var MiniHDLCState;
(function (MiniHDLCState) {
    MiniHDLCState[MiniHDLCState["STATE_ESCAPE"] = 0] = "STATE_ESCAPE";
    MiniHDLCState[MiniHDLCState["STATE_READ"] = 1] = "STATE_READ";
})(MiniHDLCState || (MiniHDLCState = {}));
var CRC_LUT = [
    0x0000,
    0x1021,
    0x2042,
    0x3063,
    0x4084,
    0x50a5,
    0x60c6,
    0x70e7,
    0x8108,
    0x9129,
    0xa14a,
    0xb16b,
    0xc18c,
    0xd1ad,
    0xe1ce,
    0xf1ef,
    0x1231,
    0x0210,
    0x3273,
    0x2252,
    0x52b5,
    0x4294,
    0x72f7,
    0x62d6,
    0x9339,
    0x8318,
    0xb37b,
    0xa35a,
    0xd3bd,
    0xc39c,
    0xf3ff,
    0xe3de,
    0x2462,
    0x3443,
    0x0420,
    0x1401,
    0x64e6,
    0x74c7,
    0x44a4,
    0x5485,
    0xa56a,
    0xb54b,
    0x8528,
    0x9509,
    0xe5ee,
    0xf5cf,
    0xc5ac,
    0xd58d,
    0x3653,
    0x2672,
    0x1611,
    0x0630,
    0x76d7,
    0x66f6,
    0x5695,
    0x46b4,
    0xb75b,
    0xa77a,
    0x9719,
    0x8738,
    0xf7df,
    0xe7fe,
    0xd79d,
    0xc7bc,
    0x48c4,
    0x58e5,
    0x6886,
    0x78a7,
    0x0840,
    0x1861,
    0x2802,
    0x3823,
    0xc9cc,
    0xd9ed,
    0xe98e,
    0xf9af,
    0x8948,
    0x9969,
    0xa90a,
    0xb92b,
    0x5af5,
    0x4ad4,
    0x7ab7,
    0x6a96,
    0x1a71,
    0x0a50,
    0x3a33,
    0x2a12,
    0xdbfd,
    0xcbdc,
    0xfbbf,
    0xeb9e,
    0x9b79,
    0x8b58,
    0xbb3b,
    0xab1a,
    0x6ca6,
    0x7c87,
    0x4ce4,
    0x5cc5,
    0x2c22,
    0x3c03,
    0x0c60,
    0x1c41,
    0xedae,
    0xfd8f,
    0xcdec,
    0xddcd,
    0xad2a,
    0xbd0b,
    0x8d68,
    0x9d49,
    0x7e97,
    0x6eb6,
    0x5ed5,
    0x4ef4,
    0x3e13,
    0x2e32,
    0x1e51,
    0x0e70,
    0xff9f,
    0xefbe,
    0xdfdd,
    0xcffc,
    0xbf1b,
    0xaf3a,
    0x9f59,
    0x8f78,
    0x9188,
    0x81a9,
    0xb1ca,
    0xa1eb,
    0xd10c,
    0xc12d,
    0xf14e,
    0xe16f,
    0x1080,
    0x00a1,
    0x30c2,
    0x20e3,
    0x5004,
    0x4025,
    0x7046,
    0x6067,
    0x83b9,
    0x9398,
    0xa3fb,
    0xb3da,
    0xc33d,
    0xd31c,
    0xe37f,
    0xf35e,
    0x02b1,
    0x1290,
    0x22f3,
    0x32d2,
    0x4235,
    0x5214,
    0x6277,
    0x7256,
    0xb5ea,
    0xa5cb,
    0x95a8,
    0x8589,
    0xf56e,
    0xe54f,
    0xd52c,
    0xc50d,
    0x34e2,
    0x24c3,
    0x14a0,
    0x0481,
    0x7466,
    0x6447,
    0x5424,
    0x4405,
    0xa7db,
    0xb7fa,
    0x8799,
    0x97b8,
    0xe75f,
    0xf77e,
    0xc71d,
    0xd73c,
    0x26d3,
    0x36f2,
    0x0691,
    0x16b0,
    0x6657,
    0x7676,
    0x4615,
    0x5634,
    0xd94c,
    0xc96d,
    0xf90e,
    0xe92f,
    0x99c8,
    0x89e9,
    0xb98a,
    0xa9ab,
    0x5844,
    0x4865,
    0x7806,
    0x6827,
    0x18c0,
    0x08e1,
    0x3882,
    0x28a3,
    0xcb7d,
    0xdb5c,
    0xeb3f,
    0xfb1e,
    0x8bf9,
    0x9bd8,
    0xabbb,
    0xbb9a,
    0x4a75,
    0x5a54,
    0x6a37,
    0x7a16,
    0x0af1,
    0x1ad0,
    0x2ab3,
    0x3a92,
    0xfd2e,
    0xed0f,
    0xdd6c,
    0xcd4d,
    0xbdaa,
    0xad8b,
    0x9de8,
    0x8dc9,
    0x7c26,
    0x6c07,
    0x5c64,
    0x4c45,
    0x3ca2,
    0x2c83,
    0x1ce0,
    0x0cc1,
    0xef1f,
    0xff3e,
    0xcf5d,
    0xdf7c,
    0xaf9b,
    0xbfba,
    0x8fd9,
    0x9ff8,
    0x6e17,
    0x7e36,
    0x4e55,
    0x5e74,
    0x2e93,
    0x3eb2,
    0x0ed1,
    0x1ef0,
];
var MiniHDLC = /** @class */ (function () {
    function MiniHDLC() {
        this.rxBuffer = [];
        this.frameCRC = [];
        this.FRAME_BOUNDARY_OCTET = 0xe7;
        this.CONTROL_ESCAPE_OCTET = 0xd7;
        this.INVERT_OCTET = 0x20;
        this.rxState = MiniHDLCState.STATE_READ;
        this.onRxFrame = null;
    }
    MiniHDLC.prototype.addRxByte = function (rxByte) {
        if (rxByte === this.FRAME_BOUNDARY_OCTET) {
            if (this.rxBuffer.length > 2) {
                this.frameCRC = this.rxBuffer.slice(-2);
                this.rxBuffer = this.rxBuffer.slice(0, -2);
                if (this._checkCRC()) {
                    if (this.onRxFrame) {
                        var rxFrame = new Uint8Array(this.rxBuffer);
                        this.onRxFrame(rxFrame);
                    }
                }
            }
            this.rxBuffer = [];
        }
        else {
            if (rxByte === this.CONTROL_ESCAPE_OCTET) {
                this.rxState = MiniHDLCState.STATE_ESCAPE;
            }
            else if (this.rxState == MiniHDLCState.STATE_ESCAPE) {
                this.rxState = MiniHDLCState.STATE_READ;
                this.rxBuffer.push(rxByte ^ this.INVERT_OCTET);
            }
            else {
                this.rxBuffer.push(rxByte);
            }
        }
    };
    MiniHDLC.prototype.addRxBytes = function (rxBytes) {
        var e_1, _a;
        try {
            for (var rxBytes_1 = __values(rxBytes), rxBytes_1_1 = rxBytes_1.next(); !rxBytes_1_1.done; rxBytes_1_1 = rxBytes_1.next()) {
                var rxByte = rxBytes_1_1.value;
                this.addRxByte(rxByte);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rxBytes_1_1 && !rxBytes_1_1.done && (_a = rxBytes_1.return)) _a.call(rxBytes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    MiniHDLC.prototype._checkCRC = function () {
        var calcCRC = this._crc16(this.rxBuffer);
        var rxCRC = this.frameCRC[0] * 256 + this.frameCRC[1];
        return calcCRC === rxCRC;
    };
    MiniHDLC.prototype._crc16 = function (buf) {
        var crc = 0xffff;
        for (var i = 0; i < buf.length; i++) {
            var byt = buf[i];
            if (byt > 255)
                byt = 255;
            if (byt < 0)
                byt = 0;
            var lutIdx = (byt ^ (crc >> 8)) & 0xff;
            crc = CRC_LUT[lutIdx] ^ (crc << 8);
        }
        return crc & 0xffff;
    };
    MiniHDLC.prototype.encode = function (content) {
        var maxBufferLen = content.length * 2 + 4;
        var frameData = new Uint8Array(maxBufferLen);
        var framePos = 0;
        // Prefix
        frameData.set([this.FRAME_BOUNDARY_OCTET], framePos++);
        // Data
        for (var i = 0; i < content.length; i++) {
            framePos = this._setData(frameData, content[i], framePos);
        }
        // CRC
        var frameCRC = this._crc16(content);
        framePos = this._setData(frameData, (frameCRC >> 8) & 0xff, framePos);
        framePos = this._setData(frameData, frameCRC & 0xff, framePos);
        // Suffix
        frameData.set([this.FRAME_BOUNDARY_OCTET], framePos++);
        // Frame of correct length
        var frameFinal = frameData.slice(0, framePos);
        return frameFinal;
    };
    MiniHDLC.prototype._setData = function (destBuf, dataVal, pos) {
        if (dataVal === this.FRAME_BOUNDARY_OCTET ||
            dataVal === this.CONTROL_ESCAPE_OCTET) {
            destBuf.set([this.CONTROL_ESCAPE_OCTET, dataVal ^ this.INVERT_OCTET], pos);
            pos += 2;
        }
        else {
            destBuf.set([dataVal], pos);
            pos += 1;
        }
        return pos;
    };
    return MiniHDLC;
}());
exports.default = MiniHDLC;
