"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICMsgHandler
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RICMsgTrackInfo_js_1 = __importDefault(require("./RICMsgTrackInfo.js"));
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
var RICROSSerial_js_1 = __importDefault(require("./RICROSSerial.js"));
var RICProtocolDefs_js_1 = require("./RICProtocolDefs.js");
var MiniHDLC_js_1 = __importDefault(require("./MiniHDLC.js"));
// Protocol enums
var RICRESTElemCode;
(function (RICRESTElemCode) {
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_URL"] = 0] = "RICREST_REST_ELEM_URL";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_CMDRESPJSON"] = 1] = "RICREST_REST_ELEM_CMDRESPJSON";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_BODY"] = 2] = "RICREST_REST_ELEM_BODY";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_COMMAND_FRAME"] = 3] = "RICREST_REST_ELEM_COMMAND_FRAME";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_FILEBLOCK"] = 4] = "RICREST_REST_ELEM_FILEBLOCK";
})(RICRESTElemCode = exports.RICRESTElemCode || (exports.RICRESTElemCode = {}));
var ProtocolMsgDirection;
(function (ProtocolMsgDirection) {
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_COMMAND"] = 0] = "MSG_DIRECTION_COMMAND";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_RESPONSE"] = 1] = "MSG_DIRECTION_RESPONSE";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_PUBLISH"] = 2] = "MSG_DIRECTION_PUBLISH";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_REPORT"] = 3] = "MSG_DIRECTION_REPORT";
})(ProtocolMsgDirection = exports.ProtocolMsgDirection || (exports.ProtocolMsgDirection = {}));
var ProtocolMsgProtocol;
(function (ProtocolMsgProtocol) {
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_ROSSERIAL"] = 0] = "MSG_PROTOCOL_ROSSERIAL";
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_M1SC"] = 1] = "MSG_PROTOCOL_M1SC";
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_RICREST"] = 2] = "MSG_PROTOCOL_RICREST";
})(ProtocolMsgProtocol = exports.ProtocolMsgProtocol || (exports.ProtocolMsgProtocol = {}));
// Message results
var MessageResultCode;
(function (MessageResultCode) {
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_TIMEOUT"] = 0] = "MESSAGE_RESULT_TIMEOUT";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_OK"] = 1] = "MESSAGE_RESULT_OK";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_FAIL"] = 2] = "MESSAGE_RESULT_FAIL";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_UNKNOWN"] = 3] = "MESSAGE_RESULT_UNKNOWN";
})(MessageResultCode = exports.MessageResultCode || (exports.MessageResultCode = {}));
// Message tracking
var MAX_MSG_NUM = 255;
var MSG_RESPONSE_TIMEOUT_MS = 5000;
var MSG_RETRY_COUNT = 5;
var RICMsgHandler = /** @class */ (function () {
    // Constructor
    function RICMsgHandler(commsStats, addOnManager) {
        var _this = this;
        // Message numbering and tracking
        this._currentMsgNumber = 1;
        this._currentMsgHandle = 1;
        this._msgTrackInfos = new Array(MAX_MSG_NUM + 1);
        this._msgTrackCheckTimer = null;
        this._msgTrackTimerMs = 100;
        // Interface to inform of message results
        this._msgResultHandler = null;
        // Interface to send messages
        this._msgSender = null;
        this._commsStats = commsStats;
        this._addOnManager = addOnManager;
        RICUtils_js_1.default.debug('RICMsgHandler constructor');
        // Message tracking
        for (var i = 0; i < this._msgTrackInfos.length; i++) {
            this._msgTrackInfos[i] = new RICMsgTrackInfo_js_1.default();
        }
        // Timer for checking messages
        this._msgTrackCheckTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._onMsgTrackTimer();
                return [2 /*return*/];
            });
        }); }, this._msgTrackTimerMs);
        // HDLC used to encode/decode the RICREST protocol
        this._miniHDLC = new MiniHDLC_js_1.default();
        this._miniHDLC.onRxFrame = this._onHDLCFrameDecode.bind(this);
    }
    RICMsgHandler.prototype.registerForResults = function (msgResultHandler) {
        this._msgResultHandler = msgResultHandler;
    };
    RICMsgHandler.prototype.registerMsgSender = function (messageSender) {
        this._msgSender = messageSender;
    };
    RICMsgHandler.prototype.handleNewRxMsg = function (rxMsg) {
        this._miniHDLC.addRxBytes(rxMsg);
        // RICUtils.debug(`HandleRxBytes len ${rxMsg.length} ${RICUtils.bufferToHex(rxMsg)}`)
    };
    RICMsgHandler.prototype._onHDLCFrameDecode = function (rxMsg) {
        // Add to stats
        this._commsStats.msgRx();
        // Validity
        if (rxMsg.length < RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS) {
            this._commsStats.msgTooShort();
            return;
        }
        // RICUtils.debug('handleNewRxMsg len %d', rxMsg.length);
        // Decode the RICFrame header
        var rxMsgNum = rxMsg[RICProtocolDefs_js_1.RICSERIAL_MSG_NUM_POS] & 0xff;
        var rxProtocol = rxMsg[RICProtocolDefs_js_1.RICSERIAL_PROTOCOL_POS] & 0x3f;
        var rxDirn = (rxMsg[RICProtocolDefs_js_1.RICSERIAL_PROTOCOL_POS] >> 6) & 0x03;
        // Result of message
        var msgRsltCode = MessageResultCode.MESSAGE_RESULT_UNKNOWN;
        var msgRsltJsonObj = { rslt: 'unknown' };
        // Decode payload
        if (rxProtocol == RICProtocolDefs_js_1.PROTOCOL_RICREST) {
            // RICUtils.debug(
            //   `handleNewRxMsg RICREST rx msgNum ${rxMsgNum} msgDirn ${rxDirn} ${RICUtils.bufferToHex(
            //     rxMsg,
            //   )}`,
            // );
            // Extract payload
            var ricRestElemCode = rxMsg[RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS + RICProtocolDefs_js_1.RICREST_REST_ELEM_CODE_POS] & 0xff;
            if (ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_URL ||
                ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_CMDRESPJSON ||
                ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME) {
                // Ascii messages
                var restStr = RICUtils_js_1.default.getStringFromBuffer(rxMsg, RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS + RICProtocolDefs_js_1.RICREST_HEADER_PAYLOAD_POS, rxMsg.length - RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS - RICProtocolDefs_js_1.RICREST_HEADER_PAYLOAD_POS - 1);
                // RICUtils.debug(
                //   `handleNewRxMsg RICREST rx elemCode ${ricRestElemCode} ${restStr}`,
                // );
                // Convert JSON
                if (ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_CMDRESPJSON) {
                    try {
                        msgRsltJsonObj = JSON.parse(restStr);
                        if ('rslt' in msgRsltJsonObj) {
                            var rsltStr = msgRsltJsonObj.rslt.toLowerCase();
                            if (rsltStr === 'ok') {
                                msgRsltCode = MessageResultCode.MESSAGE_RESULT_OK;
                            }
                            else if (rsltStr === 'fail') {
                                msgRsltCode = MessageResultCode.MESSAGE_RESULT_FAIL;
                            }
                            else {
                                console.warn("handleNewRxMsg RICREST rslt not recognized " + msgRsltJsonObj.rslt);
                            }
                        }
                        else {
                            console.warn("handleNewRxMsg RICREST doesn't contain rslt " + restStr);
                        }
                    }
                    catch (excp) {
                        console.warn("handleNewRxMsg Failed to parse JSON response " + excp);
                    }
                }
            }
            else {
                // const binMsgLen =
                //   rxMsg.length - RICSERIAL_PAYLOAD_POS - RICREST_HEADER_PAYLOAD_POS;
                // RICUtils.debug(
                //   `handleNewRxMsg RICREST rx binary message elemCode ${ricRestElemCode} len ${binMsgLen}`,
                // );
            }
        }
        else if (rxProtocol == ProtocolMsgProtocol.MSG_PROTOCOL_ROSSERIAL) {
            // Extract ROSSerial messages - decoded messages returned via _msgResultHandler
            RICROSSerial_js_1.default.decode(rxMsg, RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS, this._msgResultHandler, this._commsStats, this._addOnManager);
        }
        else {
            RICUtils_js_1.default.debug("handleNewRxMsg unsupported protocol " + rxProtocol);
        }
        // Handle matching of commands and responses
        //        RICUtils.debug(`onMsgRx msgRsltCode ${msgRsltCode}`);
        if (rxDirn == ProtocolMsgDirection.MSG_DIRECTION_RESPONSE) {
            this.msgTrackingRxRespMsg(rxMsgNum, msgRsltCode, msgRsltJsonObj);
        }
    };
    RICMsgHandler.prototype.sendRICRESTURL = function (cmdStr, msgTracking) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendRICREST(cmdStr, RICRESTElemCode.RICREST_REST_ELEM_URL, msgTracking)];
                    case 1: 
                    // Send
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RICMsgHandler.prototype.sendRICREST = function (cmdStr, ricRESTElemCode, msgTracking) {
        return __awaiter(this, void 0, void 0, function () {
            var cmdStrTerm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmdStrTerm = new Uint8Array(cmdStr.length + 1);
                        RICUtils_js_1.default.addStringToBuffer(cmdStrTerm, cmdStr, 0);
                        cmdStrTerm[cmdStrTerm.length - 1] = 0;
                        return [4 /*yield*/, this.sendRICRESTBytes(cmdStrTerm, ricRESTElemCode, msgTracking, true)];
                    case 1: 
                    // Send
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RICMsgHandler.prototype.sendRICRESTBytes = function (cmdBytes, ricRESTElemCode, isNumbered, withResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var cmdMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmdMsg = new Uint8Array(cmdBytes.length + RICProtocolDefs_js_1.RICREST_HEADER_PAYLOAD_POS);
                        cmdMsg[RICProtocolDefs_js_1.RICREST_REST_ELEM_CODE_POS] = ricRESTElemCode;
                        cmdMsg.set(cmdBytes, RICProtocolDefs_js_1.RICREST_HEADER_PAYLOAD_POS);
                        return [4 /*yield*/, this.sendCommsMsg(cmdMsg, ProtocolMsgDirection.MSG_DIRECTION_COMMAND, ProtocolMsgProtocol.MSG_PROTOCOL_RICREST, isNumbered, withResponse)];
                    case 1: 
                    // Send
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RICMsgHandler.prototype.sendCommsMsg = function (msgPayload, msgDirection, msgProtocol, isNumbered, withResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var msgBuf, framedMsg, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                msgBuf = new Uint8Array(msgPayload.length + RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS);
                                msgBuf[0] = isNumbered ? this._currentMsgNumber & 0xff : 0;
                                msgBuf[1] = (msgDirection << 6) + msgProtocol;
                                // Payload
                                msgBuf.set(msgPayload, RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS);
                                // Debug
                                // RICUtils.debug(
                                //   `sendCommsMsg Message tx msgNum ${
                                //     isNumbered ? this._currentMsgNumber : 'unnumbered'
                                //   } data ${RICUtils.bufferToHex(msgBuf)}`,
                                // );
                                // Update message tracking
                                if (isNumbered) {
                                    this.msgTrackingTxCmdMsg(msgBuf, withResponse, resolve, reject);
                                    this._currentMsgHandle++;
                                }
                                framedMsg = this._miniHDLC.encode(msgBuf);
                                if (!this._msgSender) return [3 /*break*/, 2];
                                return [4 /*yield*/, this._msgSender.sendTxMsg(framedMsg, withResponse)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                // Return msg handle
                                if (!isNumbered) {
                                    resolve();
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                reject(error_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                promise.catch(function (error) { return RICUtils_js_1.default.debug(error); });
                return [2 /*return*/, promise];
            });
        });
    };
    RICMsgHandler.prototype.msgTrackingTxCmdMsg = function (msgFrame, withResponse, resolve, reject) {
        // Record message re-use of number
        if (this._msgTrackInfos[this._currentMsgNumber].msgOutstanding) {
            this._commsStats.recordMsgNumCollision();
        }
        // Set tracking info
        this._msgTrackInfos[this._currentMsgNumber].set(true, msgFrame, withResponse, this._currentMsgHandle, resolve, reject);
        // Debug
        // RICUtils.debug(
        //   `msgTrackingTxCmdMsg msgNum ${
        //     this._currentMsgNumber
        //   } msg ${RICUtils.bufferToHex(msgFrame)} sanityCheck ${
        //     this._msgTrackInfos[this._currentMsgNumber].msgOutstanding
        //   }`,
        // );
        // Stats
        this._commsStats.msgTx();
        // Bump msg number
        if (this._currentMsgNumber == MAX_MSG_NUM) {
            this._currentMsgNumber = 1;
        }
        else {
            this._currentMsgNumber++;
        }
    };
    RICMsgHandler.prototype.msgTrackingRxRespMsg = function (msgNum, msgRsltCode, msgRsltJsonObj) {
        // Check message number
        if (msgNum == 0) {
            // Callback on unnumbered message
            if (this._msgResultHandler != null)
                this._msgResultHandler.onRxUnnumberedMsg(msgRsltJsonObj);
            return;
        }
        if (msgNum > MAX_MSG_NUM) {
            RICUtils_js_1.default.debug('msgTrackingRxRespMsg msgNum > 255');
            return;
        }
        if (!this._msgTrackInfos[msgNum].msgOutstanding) {
            RICUtils_js_1.default.debug("msgTrackingRxRespMsg unmatched msgNum " + msgNum);
            this._commsStats.recordMsgNumUnmatched();
            return;
        }
        // Handle message
        // RICUtils.debug(
        //   `msgTrackingRxRespMsg Message response received msgNum ${msgNum}`,
        // );
        this._commsStats.recordMsgResp(Date.now() - this._msgTrackInfos[msgNum].msgSentMs);
        this._msgCompleted(msgNum, msgRsltCode, msgRsltJsonObj);
    };
    RICMsgHandler.prototype._msgCompleted = function (msgNum, msgRsltCode, msgRsltObj) {
        var msgHandle = this._msgTrackInfos[msgNum].msgHandle;
        this._msgTrackInfos[msgNum].msgOutstanding = false;
        if (this._msgResultHandler !== null) {
            this._msgResultHandler.onRxReply(msgHandle, msgRsltCode, msgRsltObj);
        }
        if (msgRsltCode === MessageResultCode.MESSAGE_RESULT_OK) {
            var resolve = this._msgTrackInfos[msgNum].resolve;
            if (resolve) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolve(msgRsltObj);
            }
        }
        else {
            var reject = this._msgTrackInfos[msgNum].reject;
            if (reject) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reject(new Error("Message failed " + msgRsltCode));
            }
        }
        this._msgTrackInfos[msgNum].resolve = null;
        this._msgTrackInfos[msgNum].reject = null;
    };
    // Check message timeouts
    RICMsgHandler.prototype._onMsgTrackTimer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < MAX_MSG_NUM + 1)) return [3 /*break*/, 8];
                        if (!this._msgTrackInfos[i].msgOutstanding)
                            return [3 /*break*/, 7];
                        if (!(Date.now() >
                            this._msgTrackInfos[i].msgSentMs + MSG_RESPONSE_TIMEOUT_MS)) return [3 /*break*/, 7];
                        RICUtils_js_1.default.debug("msgTrackTimer Message response timeout msgNum " + i + " retrying");
                        if (!(this._msgTrackInfos[i].retryCount < MSG_RETRY_COUNT)) return [3 /*break*/, 6];
                        this._msgTrackInfos[i].retryCount++;
                        if (!(this._msgSender !== null &&
                            this._msgTrackInfos[i].msgFrame !== null)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._msgSender.sendTxMsg(this._msgTrackInfos[i].msgFrame, this._msgTrackInfos[i].withResponse)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        RICUtils_js_1.default.debug('Retry message failed' + error_2.toString());
                        return [3 /*break*/, 5];
                    case 5:
                        this._commsStats.recordMsgRetry();
                        this._msgTrackInfos[i].msgSentMs = Date.now();
                        return [3 /*break*/, 7];
                    case 6:
                        RICUtils_js_1.default.debug("msgTrackTimer TIMEOUT msgNum " + i + " after " + MSG_RETRY_COUNT + " retries");
                        this._msgCompleted(i, MessageResultCode.MESSAGE_RESULT_TIMEOUT, null);
                        this._commsStats.recordMsgTimeout();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8:
                        // Call again
                        this._msgTrackCheckTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                this._onMsgTrackTimer();
                                return [2 /*return*/];
                            });
                        }); }, this._msgTrackTimerMs);
                        return [2 /*return*/];
                }
            });
        });
    };
    return RICMsgHandler;
}());
exports.default = RICMsgHandler;
