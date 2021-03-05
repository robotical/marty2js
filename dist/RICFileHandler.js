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
import { RICRESTElemCode, ProtocolMsgDirection, ProtocolMsgProtocol, } from './RICMsgHandler.js';
import { RICFileSendType } from './RICTypes.js';
import { RICREST_HEADER_PAYLOAD_POS, RICSERIAL_PAYLOAD_POS, } from './RICProtocolDefs.js';
import { FileBlockTrackInfo } from './RICMsgTrackInfo.js';
import RICUtils from './RICUtils.js';
// File send state
var FileSendState;
(function (FileSendState) {
    FileSendState[FileSendState["FILE_STATE_NONE"] = 0] = "FILE_STATE_NONE";
    FileSendState[FileSendState["FILE_STATE_START_ACK"] = 1] = "FILE_STATE_START_ACK";
    FileSendState[FileSendState["FILE_STATE_BLOCK_ACK"] = 2] = "FILE_STATE_BLOCK_ACK";
    FileSendState[FileSendState["FILE_STATE_END_ACK"] = 3] = "FILE_STATE_END_ACK";
})(FileSendState || (FileSendState = {}));
export default class RICFileHandler {
    constructor(msgHandler, commsStats) {
        this._fileSendState = FileSendState.FILE_STATE_NONE;
        this._fileSendStateMs = 0;
        this._fileSendMsgHandle = 0;
        // Timeouts
        this.BLOCK_ACK_TIMEOUT_MS = 30000;
        this.RIC_FILE_UPLOAD_START_TIMEOUT_MS = 1000;
        this.RIC_FW_UPLOAD_START_TIMEOUT_MS = 7000;
        this.RIC_FILE_UPLOAD_END_TIMEOUT_MS = 1000;
        this.RIC_FW_UPLOAD_END_TIMEOUT_MS = 30000;
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
    registerMsgSender(messageSender) {
        this._msgSender = messageSender;
    }
    fileSend(fileName, fileType, fileContents, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this._isCancelled = false;
            const binaryImageLen = fileContents.length;
            this._fileNumBlocks =
                Math.floor(binaryImageLen / this._fileBlockSize) +
                    (binaryImageLen % this._fileBlockSize == 0 ? 0 : 1);
            // Send file start message
            // RICUtils.debug('XXXXXXXXX _sendFileStartMsg start');
            yield this._sendFileStartMsg(fileName, fileType, fileContents);
            // RICUtils.debug('XXXXXXXXX _sendFileStartMsg done');
            // Send contents
            // RICUtils.debug('XXXXXXXXX _sendFileContents start');
            yield this._sendFileContents(fileContents, progressCallback);
            // RICUtils.debug('XXXXXXXXX _sendFileContents done');
            // Send file end
            // RICUtils.debug('XXXXXXXXX _sendFileEndMsg start');
            yield this._sendFileEndMsg(fileName, fileType, fileContents);
            // RICUtils.debug('XXXXXXXXX _sendFileEndMsg done');
            // Clean up
            yield this.awaitOutstandingMsgPromises(true);
            // Complete
            return true;
        });
    }
    fileSendCancel() {
        return __awaiter(this, void 0, void 0, function* () {
            // Await outstanding promises
            yield this.awaitOutstandingMsgPromises(true);
            this._isCancelled = true;
        });
    }
    // Send the start message
    _sendFileStartMsg(fileName, fileType, fileContents) {
        return __awaiter(this, void 0, void 0, function* () {
            // File start command message
            const reqStr = fileType == RICFileSendType.RIC_FIRMWARE_UPDATE
                ? 'espfwupdate'
                : 'fileupload';
            const fileDest = fileType == RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
            const fileLen = fileContents.length;
            const cmdMsg = `{"cmdName":"ufStart","reqStr":"${reqStr}","fileType":"${fileDest}","fileName":"${fileName}","fileLen":${fileLen}}`;
            // Debug
            RICUtils.debug(`sendFileStartMsg ${cmdMsg}`);
            // Timeout calculation
            const startTimeoutMs = (fileType == RICFileSendType.RIC_FIRMWARE_UPDATE) ?
                this.RIC_FW_UPLOAD_START_TIMEOUT_MS :
                this.RIC_FILE_UPLOAD_START_TIMEOUT_MS;
            // Send
            const fileStartResp = yield this._msgHandler.sendRICREST(cmdMsg, RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true, startTimeoutMs);
            // Extract params
            if (fileStartResp.batchMsgSize) {
                this._fileBlockSize = fileStartResp.batchMsgSize;
            }
            if (fileStartResp.batchAckSize) {
                this._batchAckSize = fileStartResp.batchAckSize;
            }
            RICUtils.debug(`_fileSendStartMsg fileBlockSize ${this._fileBlockSize} batchAckSize ${this._batchAckSize}`);
        });
    }
    _sendFileEndMsg(fileName, fileType, fileContents) {
        return __awaiter(this, void 0, void 0, function* () {
            // File end command message
            const reqStr = fileType == RICFileSendType.RIC_FIRMWARE_UPDATE
                ? 'espfwupdate'
                : 'fileupload';
            const fileDest = fileType == RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
            const fileLen = fileContents.length;
            const cmdMsg = `{"cmdName":"ufEnd","reqStr":"${reqStr}","fileType":"${fileDest}","fileName":"${fileName}","fileLen":${fileLen}}`;
            // Await outstanding promises
            yield this.awaitOutstandingMsgPromises(true);
            // Timeout calculation
            const endTimeoutMs = (fileType == RICFileSendType.RIC_FIRMWARE_UPDATE) ?
                this.RIC_FW_UPLOAD_END_TIMEOUT_MS :
                this.RIC_FILE_UPLOAD_END_TIMEOUT_MS;
            // Send
            return yield this._msgHandler.sendRICREST(cmdMsg, RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true, endTimeoutMs);
        });
    }
    _sendFileCancelMsg() {
        return __awaiter(this, void 0, void 0, function* () {
            // File cancel command message
            const cmdMsg = `{"cmdName":"ufCancel"}`;
            // Await outstanding promises
            yield this.awaitOutstandingMsgPromises(true);
            // Send
            return yield this._msgHandler.sendRICREST(cmdMsg, RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME, true);
        });
    }
    _sendFileContents(fileContents, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (progressCallback) {
                progressCallback(0, fileContents.length, 0);
            }
            this._batchAckReceived = false;
            this._ackedFilePos = 0;
            // Send file blocks
            let progressUpdateCtr = 0;
            while (this._ackedFilePos < fileContents.length) {
                // Sending with or without batches
                if (this._sendWithoutBatchAcks) {
                    // Debug
                    RICUtils.verbose(`_sendFileContents NO BATCH ACKS ${progressUpdateCtr} blocks total sent ${this._ackedFilePos} block len ${this._fileBlockSize}`);
                    yield this._sendFileBlock(fileContents, this._ackedFilePos);
                    this._ackedFilePos += this._fileBlockSize;
                    progressUpdateCtr++;
                }
                else {
                    // NOTE: first batch MUST be of size 1 (not _batchAckSize) because RIC performs a long-running
                    // blocking task immediately after receiving the first message in a firmware
                    // update - although this could be relaxed for non-firmware update file uploads
                    let sendFromPos = this._ackedFilePos;
                    const batchSize = sendFromPos == 0 ? 1 : this._batchAckSize;
                    for (let i = 0; i < batchSize && sendFromPos < fileContents.length; i++) {
                        // Clear old batch acks
                        if (i == batchSize - 1) {
                            this._batchAckReceived = false;
                        }
                        // Debug
                        RICUtils.verbose(`_sendFileContents sendblock pos ${sendFromPos} len ${this._fileBlockSize} ackedTo ${this._ackedFilePos} fileLen ${fileContents.length}`);
                        yield this._sendFileBlock(fileContents, sendFromPos);
                        sendFromPos += this._fileBlockSize;
                    }
                    // Wait for response (there is a timeout at the ESP end to ensure a response is always returned
                    // even if blocks are dropped on reception at ESP) - the timeout here is for these responses
                    // being dropped
                    yield this.batchAck(this.BLOCK_ACK_TIMEOUT_MS);
                    progressUpdateCtr += this._batchAckSize;
                }
                // Show progress
                if ((progressUpdateCtr >= 20) && progressCallback) {
                    // Update UI
                    progressCallback(this._ackedFilePos, fileContents.length, this._ackedFilePos / fileContents.length);
                    // Debug
                    RICUtils.verbose(`_sendFileContents ${progressUpdateCtr} blocks total sent ${this._ackedFilePos} block len ${this._fileBlockSize}`);
                    // Continue
                    progressUpdateCtr = 0;
                }
            }
        });
    }
    batchAck(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            // Handle acknowledgement to a batch (OkTo message)
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const checkFunction = () => __awaiter(this, void 0, void 0, function* () {
                    RICUtils.verbose(`this._batchAckReceived: ${this._batchAckReceived}`);
                    if (this._isCancelled) {
                        RICUtils.debug('Cancelling file upload');
                        this._isCancelled = false;
                        // Send cancel
                        yield this._sendFileCancelMsg();
                        // abort the upload process
                        reject(new Error('Update Cancelled'));
                        return;
                    }
                    if (this._batchAckReceived) {
                        this._batchAckReceived = false;
                        resolve();
                        return;
                    }
                    else {
                        const now = Date.now();
                        if (now - startTime > timeout) {
                            reject(new Error('Update failed. Please try again.'));
                            return;
                        }
                        setTimeout(checkFunction, 100);
                    }
                });
                checkFunction();
            });
        });
    }
    _sendFileBlock(fileContents, blockStart) {
        return __awaiter(this, void 0, void 0, function* () {
            // Calc block start and end
            const blockEnd = Math.min(fileContents.length, blockStart + this._fileBlockSize);
            const blockLen = blockEnd - blockStart;
            // Create entire message buffer (including protocol wrappers)
            const msgBuf = new Uint8Array(blockLen + 4 + RICREST_HEADER_PAYLOAD_POS + RICSERIAL_PAYLOAD_POS);
            let msgBufPos = 0;
            // RICSERIAL protocol
            msgBuf[msgBufPos++] = 0; // not numbered
            msgBuf[msgBufPos++] =
                (ProtocolMsgDirection.MSG_DIRECTION_COMMAND << 6) +
                    ProtocolMsgProtocol.MSG_PROTOCOL_RICREST;
            // RICREST protocol
            msgBuf[msgBufPos++] = RICRESTElemCode.RICREST_REST_ELEM_FILEBLOCK;
            // Buffer header
            msgBuf[msgBufPos++] = (blockStart >> 24) & 0xff;
            msgBuf[msgBufPos++] = (blockStart >> 16) & 0xff;
            msgBuf[msgBufPos++] = (blockStart >> 8) & 0xff;
            msgBuf[msgBufPos++] = blockStart & 0xff;
            // Copy file info
            msgBuf.set(fileContents.subarray(blockStart, blockEnd), msgBufPos);
            // // Debug
            // RICUtils.debug(
            //   `sendFileBlock frameLen ${msgBuf.length} start ${blockStart} end ${blockEnd} len ${blockLen}`,
            // );
            // Send
            try {
                // Send
                if (this._msgSender) {
                    // Check if we need to await a message send promise
                    yield this.awaitOutstandingMsgPromises(false);
                    // Wrap into HDLC
                    const framedMsg = this._msgHandler._miniHDLC.encode(msgBuf);
                    // Send without awaiting immediately
                    const promRslt = this._msgSender.sendTxMsgNoAwait(framedMsg, true);
                    // Debug
                    // RICUtils.verbose(RICUtils.buf2hex(framedMsg));
                    // Add to list of pending messages
                    if (promRslt !== null)
                        this._msgAwaitList.push(new FileBlockTrackInfo(promRslt));
                }
            }
            catch (error) {
                RICUtils.warn(`_sendFileBlock error${error.toString()}`);
            }
            return blockLen;
        });
    }
    onOktoMsg(fileOkTo) {
        // Get how far we've progressed in file
        this._ackedFilePos = fileOkTo;
        this._batchAckReceived = true;
        RICUtils.verbose(`onOktoMsg received file up to ${this._ackedFilePos}`);
    }
    awaitOutstandingMsgPromises(all) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if all outstanding promises to be awaited
            if (all) {
                for (const promRslt of this._msgAwaitList) {
                    try {
                        yield promRslt.get();
                    }
                    catch (error) {
                        RICUtils.warn(`awaitAll file part send failed ${error.toString()}`);
                    }
                }
                this._msgAwaitList = [];
            }
            else {
                // RICUtils.debug('Await list len', this._msgAwaitList.length);
                if (this._msgAwaitList.length >=
                    this.MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES) {
                    const fileBlockTrackInfo = this._msgAwaitList.shift();
                    try {
                        yield fileBlockTrackInfo.get();
                    }
                    catch (error) {
                        RICUtils.warn(`awaitSome file part send failed ${error.toString()}`);
                    }
                }
            }
        });
    }
}
