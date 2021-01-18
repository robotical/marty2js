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
import MsgTrackInfo from './RICMsgTrackInfo.js';
import RICUtils from './RICUtils.js';
import RICROSSerial from './RICROSSerial.js';
import { PROTOCOL_RICREST, RICSERIAL_MSG_NUM_POS, RICSERIAL_PAYLOAD_POS, RICSERIAL_PROTOCOL_POS, RICREST_REST_ELEM_CODE_POS, RICREST_HEADER_PAYLOAD_POS, } from './RICProtocolDefs.js';
import MiniHDLC from './MiniHDLC.js';
// Protocol enums
export var RICRESTElemCode;
(function (RICRESTElemCode) {
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_URL"] = 0] = "RICREST_REST_ELEM_URL";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_CMDRESPJSON"] = 1] = "RICREST_REST_ELEM_CMDRESPJSON";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_BODY"] = 2] = "RICREST_REST_ELEM_BODY";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_COMMAND_FRAME"] = 3] = "RICREST_REST_ELEM_COMMAND_FRAME";
    RICRESTElemCode[RICRESTElemCode["RICREST_REST_ELEM_FILEBLOCK"] = 4] = "RICREST_REST_ELEM_FILEBLOCK";
})(RICRESTElemCode || (RICRESTElemCode = {}));
export var ProtocolMsgDirection;
(function (ProtocolMsgDirection) {
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_COMMAND"] = 0] = "MSG_DIRECTION_COMMAND";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_RESPONSE"] = 1] = "MSG_DIRECTION_RESPONSE";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_PUBLISH"] = 2] = "MSG_DIRECTION_PUBLISH";
    ProtocolMsgDirection[ProtocolMsgDirection["MSG_DIRECTION_REPORT"] = 3] = "MSG_DIRECTION_REPORT";
})(ProtocolMsgDirection || (ProtocolMsgDirection = {}));
export var ProtocolMsgProtocol;
(function (ProtocolMsgProtocol) {
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_ROSSERIAL"] = 0] = "MSG_PROTOCOL_ROSSERIAL";
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_M1SC"] = 1] = "MSG_PROTOCOL_M1SC";
    ProtocolMsgProtocol[ProtocolMsgProtocol["MSG_PROTOCOL_RICREST"] = 2] = "MSG_PROTOCOL_RICREST";
})(ProtocolMsgProtocol || (ProtocolMsgProtocol = {}));
// Message results
export var MessageResultCode;
(function (MessageResultCode) {
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_TIMEOUT"] = 0] = "MESSAGE_RESULT_TIMEOUT";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_OK"] = 1] = "MESSAGE_RESULT_OK";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_FAIL"] = 2] = "MESSAGE_RESULT_FAIL";
    MessageResultCode[MessageResultCode["MESSAGE_RESULT_UNKNOWN"] = 3] = "MESSAGE_RESULT_UNKNOWN";
})(MessageResultCode || (MessageResultCode = {}));
// Message tracking
const MAX_MSG_NUM = 255;
const MSG_RESPONSE_TIMEOUT_MS = 5000;
const MSG_RETRY_COUNT = 5;
export default class RICMsgHandler {
    // Constructor
    constructor(commsStats, addOnManager) {
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
        RICUtils.debug('RICMsgHandler constructor');
        // Message tracking
        for (let i = 0; i < this._msgTrackInfos.length; i++) {
            this._msgTrackInfos[i] = new MsgTrackInfo();
        }
        // Timer for checking messages
        this._msgTrackCheckTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this._onMsgTrackTimer();
        }), this._msgTrackTimerMs);
        // HDLC used to encode/decode the RICREST protocol
        this._miniHDLC = new MiniHDLC();
        this._miniHDLC.onRxFrame = this._onHDLCFrameDecode.bind(this);
    }
    registerForResults(msgResultHandler) {
        this._msgResultHandler = msgResultHandler;
    }
    registerMsgSender(messageSender) {
        this._msgSender = messageSender;
    }
    handleNewRxMsg(rxMsg) {
        this._miniHDLC.addRxBytes(rxMsg);
        // RICUtils.debug(`HandleRxBytes len ${rxMsg.length} ${RICUtils.bufferToHex(rxMsg)}`)
    }
    _onHDLCFrameDecode(rxMsg) {
        // Add to stats
        this._commsStats.msgRx();
        // Validity
        if (rxMsg.length < RICSERIAL_PAYLOAD_POS) {
            this._commsStats.msgTooShort();
            return;
        }
        // RICUtils.debug('handleNewRxMsg len %d', rxMsg.length);
        // Decode the RICFrame header
        const rxMsgNum = rxMsg[RICSERIAL_MSG_NUM_POS] & 0xff;
        const rxProtocol = rxMsg[RICSERIAL_PROTOCOL_POS] & 0x3f;
        const rxDirn = (rxMsg[RICSERIAL_PROTOCOL_POS] >> 6) & 0x03;
        // Result of message
        let msgRsltCode = MessageResultCode.MESSAGE_RESULT_UNKNOWN;
        let msgRsltJsonObj = { rslt: 'unknown' };
        // Decode payload
        if (rxProtocol == PROTOCOL_RICREST) {
            // RICUtils.debug(
            //   `handleNewRxMsg RICREST rx msgNum ${rxMsgNum} msgDirn ${rxDirn} ${RICUtils.bufferToHex(
            //     rxMsg,
            //   )}`,
            // );
            // Extract payload
            const ricRestElemCode = rxMsg[RICSERIAL_PAYLOAD_POS + RICREST_REST_ELEM_CODE_POS] & 0xff;
            if (ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_URL ||
                ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_CMDRESPJSON ||
                ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME) {
                // Ascii messages
                const restStr = RICUtils.getStringFromBuffer(rxMsg, RICSERIAL_PAYLOAD_POS + RICREST_HEADER_PAYLOAD_POS, rxMsg.length - RICSERIAL_PAYLOAD_POS - RICREST_HEADER_PAYLOAD_POS - 1);
                // RICUtils.debug(
                //   `handleNewRxMsg RICREST rx elemCode ${ricRestElemCode} ${restStr}`,
                // );
                // Convert JSON
                if (ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_CMDRESPJSON) {
                    try {
                        msgRsltJsonObj = JSON.parse(restStr);
                        if ('rslt' in msgRsltJsonObj) {
                            const rsltStr = msgRsltJsonObj.rslt.toLowerCase();
                            if (rsltStr === 'ok') {
                                msgRsltCode = MessageResultCode.MESSAGE_RESULT_OK;
                            }
                            else if (rsltStr === 'fail') {
                                msgRsltCode = MessageResultCode.MESSAGE_RESULT_FAIL;
                            }
                            else {
                                console.warn(`handleNewRxMsg RICREST rslt not recognized ${msgRsltJsonObj.rslt}`);
                            }
                        }
                        else {
                            console.warn(`handleNewRxMsg RICREST doesn't contain rslt ${restStr}`);
                        }
                    }
                    catch (excp) {
                        console.warn(`handleNewRxMsg Failed to parse JSON response ${excp}`);
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
            RICROSSerial.decode(rxMsg, RICSERIAL_PAYLOAD_POS, this._msgResultHandler, this._commsStats, this._addOnManager);
        }
        else {
            RICUtils.warn(`handleNewRxMsg unsupported protocol ${rxProtocol}`);
        }
        // Handle matching of commands and responses
        //        RICUtils.debug(`onMsgRx msgRsltCode ${msgRsltCode}`);
        if (rxDirn == ProtocolMsgDirection.MSG_DIRECTION_RESPONSE) {
            this.msgTrackingRxRespMsg(rxMsgNum, msgRsltCode, msgRsltJsonObj);
        }
    }
    sendRICRESTURL(cmdStr, msgTracking) {
        return __awaiter(this, void 0, void 0, function* () {
            // Send
            return yield this.sendRICREST(cmdStr, RICRESTElemCode.RICREST_REST_ELEM_URL, msgTracking);
        });
    }
    sendRICRESTCmdFrame(cmdStr, msgTracking) {
        return __awaiter(this, void 0, void 0, function* () {
            // Send
            return yield this.sendRICREST(cmdStr, RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, msgTracking);
        });
    }
    sendRICREST(cmdStr, ricRESTElemCode, msgTracking) {
        return __awaiter(this, void 0, void 0, function* () {
            // Put cmdStr into buffer
            const cmdStrTerm = new Uint8Array(cmdStr.length + 1);
            RICUtils.addStringToBuffer(cmdStrTerm, cmdStr, 0);
            cmdStrTerm[cmdStrTerm.length - 1] = 0;
            // Send
            return yield this.sendRICRESTBytes(cmdStrTerm, ricRESTElemCode, msgTracking, true);
        });
    }
    sendRICRESTBytes(cmdBytes, ricRESTElemCode, isNumbered, withResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            // Form message
            const cmdMsg = new Uint8Array(cmdBytes.length + RICREST_HEADER_PAYLOAD_POS);
            cmdMsg[RICREST_REST_ELEM_CODE_POS] = ricRESTElemCode;
            cmdMsg.set(cmdBytes, RICREST_HEADER_PAYLOAD_POS);
            // Send
            return yield this.sendCommsMsg(cmdMsg, ProtocolMsgDirection.MSG_DIRECTION_COMMAND, ProtocolMsgProtocol.MSG_PROTOCOL_RICREST, isNumbered, withResponse);
        });
    }
    sendCommsMsg(msgPayload, msgDirection, msgProtocol, isNumbered, withResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Header
                    const msgBuf = new Uint8Array(msgPayload.length + RICSERIAL_PAYLOAD_POS);
                    msgBuf[0] = isNumbered ? this._currentMsgNumber & 0xff : 0;
                    msgBuf[1] = (msgDirection << 6) + msgProtocol;
                    // Payload
                    msgBuf.set(msgPayload, RICSERIAL_PAYLOAD_POS);
                    // Debug
                    // RICUtils.debug(
                    //   `sendCommsMsg Message tx msgNum ${
                    //     isNumbered ? this._currentMsgNumber : 'unnumbered'
                    //   } data ${RICUtils.bufferToHex(msgBuf)}`,
                    // );
                    // Wrap into HDLC
                    const framedMsg = this._miniHDLC.encode(msgBuf);
                    // Update message tracking
                    if (isNumbered) {
                        this.msgTrackingTxCmdMsg(framedMsg, withResponse, resolve, reject);
                        this._currentMsgHandle++;
                    }
                    // Send
                    if (this._msgSender) {
                        yield this._msgSender.sendTxMsg(framedMsg, withResponse);
                    }
                    // Return msg handle
                    if (!isNumbered) {
                        resolve();
                    }
                }
                catch (error) {
                    reject(error);
                }
            }));
            promise.catch(error => RICUtils.warn(error));
            return promise;
        });
    }
    msgTrackingTxCmdMsg(msgFrame, withResponse, resolve, reject) {
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
    }
    msgTrackingRxRespMsg(msgNum, msgRsltCode, msgRsltJsonObj) {
        // Check message number
        if (msgNum == 0) {
            // Callback on unnumbered message
            if (this._msgResultHandler != null)
                this._msgResultHandler.onRxUnnumberedMsg(msgRsltJsonObj);
            return;
        }
        if (msgNum > MAX_MSG_NUM) {
            RICUtils.debug('msgTrackingRxRespMsg msgNum > 255');
            return;
        }
        if (!this._msgTrackInfos[msgNum].msgOutstanding) {
            RICUtils.debug(`msgTrackingRxRespMsg unmatched msgNum ${msgNum}`);
            this._commsStats.recordMsgNumUnmatched();
            return;
        }
        // Handle message
        // RICUtils.debug(
        //   `msgTrackingRxRespMsg Message response received msgNum ${msgNum}`,
        // );
        this._commsStats.recordMsgResp(Date.now() - this._msgTrackInfos[msgNum].msgSentMs);
        this._msgCompleted(msgNum, msgRsltCode, msgRsltJsonObj);
    }
    _msgCompleted(msgNum, msgRsltCode, msgRsltObj) {
        const msgHandle = this._msgTrackInfos[msgNum].msgHandle;
        this._msgTrackInfos[msgNum].msgOutstanding = false;
        if (this._msgResultHandler !== null) {
            this._msgResultHandler.onRxReply(msgHandle, msgRsltCode, msgRsltObj);
        }
        if (msgRsltCode === MessageResultCode.MESSAGE_RESULT_OK) {
            const resolve = this._msgTrackInfos[msgNum].resolve;
            if (resolve) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolve(msgRsltObj);
            }
        }
        else {
            const reject = this._msgTrackInfos[msgNum].reject;
            if (reject) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reject(new Error(`Message failed ${msgRsltCode}`));
            }
        }
        this._msgTrackInfos[msgNum].resolve = null;
        this._msgTrackInfos[msgNum].reject = null;
    }
    // Check message timeouts
    _onMsgTrackTimer() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check message timeouts
            for (let i = 0; i < MAX_MSG_NUM + 1; i++) {
                if (!this._msgTrackInfos[i].msgOutstanding)
                    continue;
                if (Date.now() >
                    this._msgTrackInfos[i].msgSentMs + MSG_RESPONSE_TIMEOUT_MS) {
                    RICUtils.debug(`msgTrackTimer Message response timeout msgNum ${i} retrying`);
                    if (this._msgTrackInfos[i].retryCount < MSG_RETRY_COUNT) {
                        this._msgTrackInfos[i].retryCount++;
                        if (this._msgSender !== null &&
                            this._msgTrackInfos[i].msgFrame !== null) {
                            try {
                                yield this._msgSender.sendTxMsg(this._msgTrackInfos[i].msgFrame, this._msgTrackInfos[i].withResponse);
                            }
                            catch (error) {
                                RICUtils.warn('Retry message failed' + error.toString());
                            }
                        }
                        this._commsStats.recordMsgRetry();
                        this._msgTrackInfos[i].msgSentMs = Date.now();
                    }
                    else {
                        RICUtils.debug(`msgTrackTimer TIMEOUT msgNum ${i} after ${MSG_RETRY_COUNT} retries`);
                        this._msgCompleted(i, MessageResultCode.MESSAGE_RESULT_TIMEOUT, null);
                        this._commsStats.recordMsgTimeout();
                    }
                }
            }
            // Call again
            this._msgTrackCheckTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                this._onMsgTrackTimer();
            }), this._msgTrackTimerMs);
        });
    }
}
