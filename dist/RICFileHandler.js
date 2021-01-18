"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICFileHandler
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RICMsgHandler_js_1 = require("./RICMsgHandler.js");
var RICTypes_js_1 = require("./RICTypes.js");
var RICProtocolDefs_js_1 = require("./RICProtocolDefs.js");
var RICMsgTrackInfo_js_1 = require("./RICMsgTrackInfo.js");
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
// File send state
var FileSendState;
(function (FileSendState) {
    FileSendState[FileSendState["FILE_STATE_NONE"] = 0] = "FILE_STATE_NONE";
    FileSendState[FileSendState["FILE_STATE_START_ACK"] = 1] = "FILE_STATE_START_ACK";
    FileSendState[FileSendState["FILE_STATE_BLOCK_ACK"] = 2] = "FILE_STATE_BLOCK_ACK";
    FileSendState[FileSendState["FILE_STATE_END_ACK"] = 3] = "FILE_STATE_END_ACK";
})(FileSendState || (FileSendState = {}));
var RICFileHandler = /** @class */ (function () {
    function RICFileHandler(msgHandler, commsStats) {
        this._fileSendState = FileSendState.FILE_STATE_NONE;
        this._fileSendStateMs = 0;
        this._fileSendMsgHandle = 0;
        // Timeouts
        this.BLOCK_ACK_TIMEOUT_MS = 30000;
        // Contents of file to send
        this._fileBlockSize = 240;
        this._batchAckSize = 1;
        this._fileNumBlocks = 0;
        this._fileBlockRetries = 0;
        this.BLOCK_MAX_RETRIES = 10;
        // File sending flow control
        this._sendWithoutBatchAcks = false;
        this._ackedFilePos = 0;
        this._batchAckReceived = false;
        this._isCancelled = false;
        // Interface to send messages
        this._msgSender = null;
        // Message await list
        this._msgAwaitList = new Array();
        this.MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES = 1;
        this._msgOutstanding = null;
        this._msgHandler = msgHandler;
        this._commsStats = commsStats;
        this.onOktoMsg = this.onOktoMsg.bind(this);
        this._fileSendState = FileSendState.FILE_STATE_NONE;
        this._fileSendStateMs = 0;
    }
    RICFileHandler.prototype.registerMsgSender = function (messageSender) {
        this._msgSender = messageSender;
    };
    RICFileHandler.prototype.fileSend = function (fileName, fileType, fileContents, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var binaryImageLen;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._isCancelled = false;
                        binaryImageLen = fileContents.length;
                        this._fileNumBlocks =
                            Math.floor(binaryImageLen / this._fileBlockSize) +
                                (binaryImageLen % this._fileBlockSize == 0 ? 0 : 1);
                        // Send file start message
                        // RICUtils.debug('XXXXXXXXX _sendFileStartMsg start');
                        return [4 /*yield*/, this._sendFileStartMsg(fileName, fileType, fileContents)];
                    case 1:
                        // Send file start message
                        // RICUtils.debug('XXXXXXXXX _sendFileStartMsg start');
                        _a.sent();
                        // RICUtils.debug('XXXXXXXXX _sendFileStartMsg done');
                        // Send contents
                        // RICUtils.debug('XXXXXXXXX _sendFileContents start');
                        return [4 /*yield*/, this._sendFileContents(fileContents, progressCallback)];
                    case 2:
                        // RICUtils.debug('XXXXXXXXX _sendFileStartMsg done');
                        // Send contents
                        // RICUtils.debug('XXXXXXXXX _sendFileContents start');
                        _a.sent();
                        // RICUtils.debug('XXXXXXXXX _sendFileContents done');
                        // Send file end
                        // RICUtils.debug('XXXXXXXXX _sendFileEndMsg start');
                        return [4 /*yield*/, this._sendFileEndMsg(fileName, fileType, fileContents)];
                    case 3:
                        // RICUtils.debug('XXXXXXXXX _sendFileContents done');
                        // Send file end
                        // RICUtils.debug('XXXXXXXXX _sendFileEndMsg start');
                        _a.sent();
                        // RICUtils.debug('XXXXXXXXX _sendFileEndMsg done');
                        // Clean up
                        return [4 /*yield*/, this.awaitOutstandingMsgPromises(true)];
                    case 4:
                        // RICUtils.debug('XXXXXXXXX _sendFileEndMsg done');
                        // Clean up
                        _a.sent();
                        // Complete
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RICFileHandler.prototype.fileSendCancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Await outstanding promises
                    return [4 /*yield*/, this.awaitOutstandingMsgPromises(true)];
                    case 1:
                        // Await outstanding promises
                        _a.sent();
                        this._isCancelled = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    // Send the start message
    RICFileHandler.prototype._sendFileStartMsg = function (fileName, fileType, fileContents) {
        return __awaiter(this, void 0, void 0, function () {
            var reqStr, fileDest, fileLen, cmdMsg, fileStartResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reqStr = fileType == RICTypes_js_1.RICFileSendType.RIC_FIRMWARE_UPDATE
                            ? 'espfwupdate'
                            : 'fileupload';
                        fileDest = fileType == RICTypes_js_1.RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
                        fileLen = fileContents.length;
                        cmdMsg = "{\"cmdName\":\"ufStart\",\"reqStr\":\"" + reqStr + "\",\"fileType\":\"" + fileDest + "\",\"fileName\":\"" + fileName + "\",\"fileLen\":" + fileLen + "}";
                        // Debug
                        RICUtils_js_1.default.debug("sendFileStartMsg " + cmdMsg);
                        return [4 /*yield*/, this._msgHandler.sendRICREST(cmdMsg, RICMsgHandler_js_1.RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true)];
                    case 1:
                        fileStartResp = _a.sent();
                        // Extract params
                        if (fileStartResp.batchMsgSize) {
                            this._fileBlockSize = fileStartResp.batchMsgSize;
                        }
                        if (fileStartResp.batchAckSize) {
                            this._batchAckSize = fileStartResp.batchAckSize;
                        }
                        RICUtils_js_1.default.debug("_fileSendStartMsg fileBlockSize " + this._fileBlockSize + " batchAckSize " + this._batchAckSize);
                        return [2 /*return*/];
                }
            });
        });
    };
    RICFileHandler.prototype._sendFileEndMsg = function (fileName, fileType, fileContents) {
        return __awaiter(this, void 0, void 0, function () {
            var reqStr, fileDest, fileLen, cmdMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reqStr = fileType == RICTypes_js_1.RICFileSendType.RIC_FIRMWARE_UPDATE
                            ? 'espfwupdate'
                            : 'fileupload';
                        fileDest = fileType == RICTypes_js_1.RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
                        fileLen = fileContents.length;
                        cmdMsg = "{\"cmdName\":\"ufEnd\",\"reqStr\":\"" + reqStr + "\",\"fileType\":\"" + fileDest + "\",\"fileName\":\"" + fileName + "\",\"fileLen\":" + fileLen + "}";
                        // Await outstanding promises
                        return [4 /*yield*/, this.awaitOutstandingMsgPromises(true)];
                    case 1:
                        // Await outstanding promises
                        _a.sent();
                        return [4 /*yield*/, this._msgHandler.sendRICREST(cmdMsg, RICMsgHandler_js_1.RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true)];
                    case 2: 
                    // Send
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RICFileHandler.prototype._sendFileCancelMsg = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmdMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmdMsg = "{\"cmdName\":\"ufCancel\"}";
                        // Await outstanding promises
                        return [4 /*yield*/, this.awaitOutstandingMsgPromises(true)];
                    case 1:
                        // Await outstanding promises
                        _a.sent();
                        return [4 /*yield*/, this._msgHandler.sendRICREST(cmdMsg, RICMsgHandler_js_1.RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true)];
                    case 2: 
                    // Send
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RICFileHandler.prototype._sendFileContents = function (fileContents, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var progressUpdateCtr, sendFromPos, batchSize, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        progressCallback(0, fileContents.length, 0);
                        this._batchAckReceived = false;
                        this._ackedFilePos = 0;
                        progressUpdateCtr = 0;
                        _a.label = 1;
                    case 1:
                        if (!(this._ackedFilePos < fileContents.length)) return [3 /*break*/, 10];
                        if (!this._sendWithoutBatchAcks) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._sendFileBlock(fileContents, this._ackedFilePos)];
                    case 2:
                        _a.sent();
                        this._ackedFilePos += this._fileBlockSize;
                        progressUpdateCtr++;
                        return [3 /*break*/, 9];
                    case 3:
                        sendFromPos = this._ackedFilePos;
                        batchSize = sendFromPos == 0 ? 1 : this._batchAckSize;
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < batchSize && sendFromPos < fileContents.length)) return [3 /*break*/, 7];
                        // Clear old batch acks
                        if (i == batchSize - 1) {
                            this._batchAckReceived = false;
                        }
                        return [4 /*yield*/, this._sendFileBlock(fileContents, sendFromPos)];
                    case 5:
                        _a.sent();
                        sendFromPos += this._fileBlockSize;
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7: 
                    // Wait for response (there is a timeout at the ESP end to ensure a response is always returned
                    // even if blocks are dropped on reception at ESP) - the timeout here is for these responses
                    // being dropped
                    return [4 /*yield*/, this.batchAck(this.BLOCK_ACK_TIMEOUT_MS)];
                    case 8:
                        // Wait for response (there is a timeout at the ESP end to ensure a response is always returned
                        // even if blocks are dropped on reception at ESP) - the timeout here is for these responses
                        // being dropped
                        _a.sent();
                        progressUpdateCtr += this._batchAckSize;
                        _a.label = 9;
                    case 9:
                        // Show progress
                        if (progressUpdateCtr >= 20) {
                            // Update UI
                            progressCallback(this._ackedFilePos, fileContents.length, this._ackedFilePos / fileContents.length);
                            // Debug
                            RICUtils_js_1.default.debug("_sendFileContents " + progressUpdateCtr + " blocks total sent " + this._ackedFilePos + " block len " + this._fileBlockSize);
                            // Continue
                            progressUpdateCtr = 0;
                        }
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    RICFileHandler.prototype.batchAck = function (timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Handle acknowledgement to a batch (OkTo message)
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var startTime = Date.now();
                        var checkFunction = function () { return __awaiter(_this, void 0, void 0, function () {
                            var now;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        RICUtils_js_1.default.debug("this._batchAckReceived: " + this._batchAckReceived);
                                        if (!this._isCancelled) return [3 /*break*/, 2];
                                        RICUtils_js_1.default.debug('Cancelling file upload');
                                        this._isCancelled = false;
                                        // Send cancel
                                        return [4 /*yield*/, this._sendFileCancelMsg()];
                                    case 1:
                                        // Send cancel
                                        _a.sent();
                                        // abort the upload process
                                        reject(new Error('Update Cancelled'));
                                        return [2 /*return*/];
                                    case 2:
                                        if (this._batchAckReceived) {
                                            this._batchAckReceived = false;
                                            resolve();
                                            return [2 /*return*/];
                                        }
                                        else {
                                            now = Date.now();
                                            if (now - startTime > timeout) {
                                                reject(new Error('Update failed. Please try again.'));
                                                return [2 /*return*/];
                                            }
                                            setTimeout(checkFunction, 100);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        checkFunction();
                    })];
            });
        });
    };
    RICFileHandler.prototype._sendFileBlock = function (fileContents, blockStart) {
        return __awaiter(this, void 0, void 0, function () {
            var blockEnd, blockLen, msgBuf, msgBufPos, framedMsg, promRslt, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blockEnd = Math.min(fileContents.length, blockStart + this._fileBlockSize);
                        blockLen = blockEnd - blockStart;
                        msgBuf = new Uint8Array(blockLen + 4 + RICProtocolDefs_js_1.RICREST_HEADER_PAYLOAD_POS + RICProtocolDefs_js_1.RICSERIAL_PAYLOAD_POS);
                        msgBufPos = 0;
                        // RICSERIAL protocol
                        msgBuf[msgBufPos++] = 0; // not numbered
                        msgBuf[msgBufPos++] =
                            (RICMsgHandler_js_1.ProtocolMsgDirection.MSG_DIRECTION_COMMAND << 6) +
                                RICMsgHandler_js_1.ProtocolMsgProtocol.MSG_PROTOCOL_RICREST;
                        // RICREST protocol
                        msgBuf[msgBufPos++] = RICMsgHandler_js_1.RICRESTElemCode.RICREST_REST_ELEM_FILEBLOCK;
                        // Buffer header
                        msgBuf[msgBufPos++] = (blockStart >> 24) & 0xff;
                        msgBuf[msgBufPos++] = (blockStart >> 16) & 0xff;
                        msgBuf[msgBufPos++] = (blockStart >> 8) & 0xff;
                        msgBuf[msgBufPos++] = blockStart & 0xff;
                        // Copy file info
                        msgBuf.set(fileContents.subarray(blockStart, blockEnd), msgBufPos);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!this._msgSender) return [3 /*break*/, 3];
                        // Check if we need to await a message send promise
                        return [4 /*yield*/, this.awaitOutstandingMsgPromises(false)];
                    case 2:
                        // Check if we need to await a message send promise
                        _a.sent();
                        framedMsg = this._msgHandler._miniHDLC.encode(msgBuf);
                        promRslt = this._msgSender.sendTxMsgNoAwait(framedMsg, true);
                        // Add to list of pending messages
                        if (promRslt !== null)
                            this._msgAwaitList.push(new RICMsgTrackInfo_js_1.FileBlockTrackInfo(promRslt));
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        RICUtils_js_1.default.debug("_sendFileBlock error" + error_1.toString());
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, blockLen];
                }
            });
        });
    };
    RICFileHandler.prototype.onOktoMsg = function (fileOkTo) {
        // Get how far we've progressed in file
        this._ackedFilePos = fileOkTo;
        this._batchAckReceived = true;
        RICUtils_js_1.default.debug("onOktoMsg received file up to " + this._ackedFilePos);
    };
    RICFileHandler.prototype.awaitOutstandingMsgPromises = function (all) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, promRslt, error_2, e_1_1, fileBlockTrackInfo, error_3;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!all) return [3 /*break*/, 11];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        _a = __values(this._msgAwaitList), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 7];
                        promRslt = _b.value;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, promRslt.get()];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _d.sent();
                        RICUtils_js_1.default.debug("awaitAll file part send failed " + error_2.toString());
                        return [3 /*break*/, 6];
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        this._msgAwaitList = [];
                        return [3 /*break*/, 15];
                    case 11:
                        if (!(this._msgAwaitList.length >=
                            this.MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES)) return [3 /*break*/, 15];
                        fileBlockTrackInfo = this._msgAwaitList.shift();
                        _d.label = 12;
                    case 12:
                        _d.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, fileBlockTrackInfo.get()];
                    case 13:
                        _d.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_3 = _d.sent();
                        RICUtils_js_1.default.debug("awaitSome file part send failed " + error_3.toString());
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    return RICFileHandler;
}());
exports.default = RICFileHandler;
