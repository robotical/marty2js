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

import RICMsgHandler, {
  RICRESTElemCode,
  ProtocolMsgDirection,
  ProtocolMsgProtocol,
  MessageSender,
} from './RICMsgHandler.js';
import { RICFileSendType, RICFileStartResp } from './RICTypes.js';
import {
  RICREST_HEADER_PAYLOAD_POS,
  RICSERIAL_PAYLOAD_POS,
} from './RICProtocolDefs.js';
import CommsStats from './CommsStats.js';
import { FileBlockTrackInfo } from './RICMsgTrackInfo.js';
import RICUtils from './RICUtils.js';

// File send state
enum FileSendState {
  FILE_STATE_NONE,
  FILE_STATE_START_ACK,
  FILE_STATE_BLOCK_ACK,
  FILE_STATE_END_ACK,
}

export default class RICFileHandler {
  _msgHandler: RICMsgHandler;

  _fileSendState: FileSendState = FileSendState.FILE_STATE_NONE;
  _fileSendStateMs = 0;
  _fileSendMsgHandle = 0;

  // Timeouts
  BLOCK_ACK_TIMEOUT_MS = 30000;
  RIC_FILE_UPLOAD_START_TIMEOUT_MS = 1000;
  RIC_FW_UPLOAD_START_TIMEOUT_MS = 7000;
  RIC_FILE_UPLOAD_END_TIMEOUT_MS = 1000;
  RIC_FW_UPLOAD_END_TIMEOUT_MS = 30000;

  // Contents of file to send
  _fileBlockSize = 240;
  _batchAckSize = 1;
  _fileNumBlocks = 0;
  _fileBlockRetries = 0;
  BLOCK_MAX_RETRIES = 10;

  // File sending flow control
  _sendWithoutBatchAcks = false;
  _ackedFilePos = 0;
  _batchAckReceived = false;
  _isCancelled = false;

  // CommsStats
  _commsStats: CommsStats;

  // Interface to send messages
  _msgSender: MessageSender | null = null;

  // Message await list
  _msgAwaitList: Array<FileBlockTrackInfo> = new Array<FileBlockTrackInfo>();
  MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES = 1;
  _msgOutstanding: Promise<void> | null = null;

  constructor(msgHandler: RICMsgHandler, commsStats: CommsStats) {
    this._msgHandler = msgHandler;
    this._commsStats = commsStats;
    this.onOktoMsg = this.onOktoMsg.bind(this);
    this._fileSendState = FileSendState.FILE_STATE_NONE;
    this._fileSendStateMs = 0;
  }

  registerMsgSender(messageSender: MessageSender) {
    this._msgSender = messageSender;
  }

  async fileSend(
    fileName: string,
    fileType: RICFileSendType,
    fileContents: Uint8Array,
    progressCallback: (sent: number, total: number, progress: number) => void,
  ): Promise<boolean> {
    this._isCancelled = false;

    const binaryImageLen = fileContents.length;
    this._fileNumBlocks =
      Math.floor(binaryImageLen / this._fileBlockSize) +
      (binaryImageLen % this._fileBlockSize == 0 ? 0 : 1);

    // Send file start message
    // RICUtils.debug('XXXXXXXXX _sendFileStartMsg start');
    await this._sendFileStartMsg(fileName, fileType, fileContents);
    // RICUtils.debug('XXXXXXXXX _sendFileStartMsg done');

    // Send contents
    // RICUtils.debug('XXXXXXXXX _sendFileContents start');
    await this._sendFileContents(fileContents, progressCallback);
    // RICUtils.debug('XXXXXXXXX _sendFileContents done');

    // Send file end
    // RICUtils.debug('XXXXXXXXX _sendFileEndMsg start');
    await this._sendFileEndMsg(fileName, fileType, fileContents);
    // RICUtils.debug('XXXXXXXXX _sendFileEndMsg done');

    // Clean up
    await this.awaitOutstandingMsgPromises(true);

    // Complete
    return true;
  }

  async fileSendCancel(): Promise<void> {
    // Await outstanding promises
    await this.awaitOutstandingMsgPromises(true);
    this._isCancelled = true;
  }

  // Send the start message
  async _sendFileStartMsg(
    fileName: string,
    fileType: RICFileSendType,
    fileContents: Uint8Array,
  ): Promise<void> {
    // File start command message
    const reqStr =
      fileType == RICFileSendType.RIC_FIRMWARE_UPDATE
        ? 'espfwupdate'
        : 'fileupload';
    const fileDest =
      fileType == RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
    const fileLen = fileContents.length;
    const cmdMsg = `{"cmdName":"ufStart","reqStr":"${reqStr}","fileType":"${fileDest}","fileName":"${fileName}","fileLen":${fileLen}}`;

    // Debug
    RICUtils.debug(`sendFileStartMsg ${cmdMsg}`);

    // Timeout calculation
    const startTimeoutMs = (fileType == RICFileSendType.RIC_FIRMWARE_UPDATE) ? 
            this.RIC_FW_UPLOAD_START_TIMEOUT_MS : 
            this.RIC_FILE_UPLOAD_START_TIMEOUT_MS;

    // Send
    const fileStartResp = await this._msgHandler.sendRICREST<RICFileStartResp>(
      cmdMsg,
      RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME,
      true,
      startTimeoutMs,
    );

    // Extract params
    if (fileStartResp.batchMsgSize) {
      this._fileBlockSize = fileStartResp.batchMsgSize;
    }
    if (fileStartResp.batchAckSize) {
      this._batchAckSize = fileStartResp.batchAckSize;
    }
    RICUtils.debug(
      `_fileSendStartMsg fileBlockSize ${this._fileBlockSize} batchAckSize ${this._batchAckSize}`,
    );
  }

  async _sendFileEndMsg(
    fileName: string,
    fileType: RICFileSendType,
    fileContents: Uint8Array,
  ): Promise<void> {
    // File end command message
    const reqStr =
      fileType == RICFileSendType.RIC_FIRMWARE_UPDATE
        ? 'espfwupdate'
        : 'fileupload';
    const fileDest =
      fileType == RICFileSendType.RIC_FIRMWARE_UPDATE ? 'ricfw' : 'fs';
    const fileLen = fileContents.length;
    const cmdMsg = `{"cmdName":"ufEnd","reqStr":"${reqStr}","fileType":"${fileDest}","fileName":"${fileName}","fileLen":${fileLen}}`;

    // Await outstanding promises
    await this.awaitOutstandingMsgPromises(true);

    // Timeout calculation
    const endTimeoutMs = (fileType == RICFileSendType.RIC_FIRMWARE_UPDATE) ? 
        this.RIC_FW_UPLOAD_END_TIMEOUT_MS : 
        this.RIC_FILE_UPLOAD_END_TIMEOUT_MS;

    // Send
    return await this._msgHandler.sendRICREST(
      cmdMsg,
      RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME,
      true,
      endTimeoutMs,
    );
  }

  async _sendFileCancelMsg(): Promise<void> {
    // File cancel command message
    const cmdMsg = `{"cmdName":"ufCancel"}`;

    // Await outstanding promises
    await this.awaitOutstandingMsgPromises(true);

    // Send
    return await this._msgHandler.sendRICREST(
      cmdMsg,
      RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME,
      true,
    );
  }

  async _sendFileContents(
    fileContents: Uint8Array,
    progressCallback: (sent: number, total: number, progress: number) => void,
  ) {
    progressCallback(0, fileContents.length, 0);

    this._batchAckReceived = false;
    this._ackedFilePos = 0;

    // Send file blocks
    let progressUpdateCtr = 0;
    while (this._ackedFilePos < fileContents.length) {
      // Sending with or without batches
      if (this._sendWithoutBatchAcks) {
        // Debug
        RICUtils.verbose(
          `_sendFileContents NO BATCH ACKS ${progressUpdateCtr} blocks total sent ${this._ackedFilePos} block len ${this._fileBlockSize}`,
        );

        await this._sendFileBlock(fileContents, this._ackedFilePos);
        this._ackedFilePos += this._fileBlockSize;
        progressUpdateCtr++;

      } else {
        // NOTE: first batch MUST be of size 1 (not _batchAckSize) because RIC performs a long-running
        // blocking task immediately after receiving the first message in a firmware
        // update - although this could be relaxed for non-firmware update file uploads
        let sendFromPos = this._ackedFilePos;
        const batchSize = sendFromPos == 0 ? 1 : this._batchAckSize;
        for (
          let i = 0;
          i < batchSize && sendFromPos < fileContents.length;
          i++
        ) {
          // Clear old batch acks
          if (i == batchSize - 1) {
            this._batchAckReceived = false;
          }

          // Debug
          RICUtils.verbose(
            `_sendFileContents sendblock pos ${sendFromPos} len ${this._fileBlockSize} ackedTo ${this._ackedFilePos} fileLen ${fileContents.length}`,
          );

          await this._sendFileBlock(fileContents, sendFromPos);
          sendFromPos += this._fileBlockSize;

        }

        // Wait for response (there is a timeout at the ESP end to ensure a response is always returned
        // even if blocks are dropped on reception at ESP) - the timeout here is for these responses
        // being dropped
        await this.batchAck(this.BLOCK_ACK_TIMEOUT_MS);
        progressUpdateCtr += this._batchAckSize;
      }

      // Show progress
      if (progressUpdateCtr >= 20) {
        // Update UI
        progressCallback(
          this._ackedFilePos,
          fileContents.length,
          this._ackedFilePos / fileContents.length,
        );

        // Debug
        RICUtils.verbose(
          `_sendFileContents ${progressUpdateCtr} blocks total sent ${this._ackedFilePos} block len ${this._fileBlockSize}`,
        );

        // Continue
        progressUpdateCtr = 0;
      }
    }
  }

  async batchAck(timeout: number): Promise<void> {
    // Handle acknowledgement to a batch (OkTo message)
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkFunction = async () => {
        RICUtils.verbose(`this._batchAckReceived: ${this._batchAckReceived}`);
        if (this._isCancelled) {
          RICUtils.debug('Cancelling file upload');
          this._isCancelled = false;
          // Send cancel
          await this._sendFileCancelMsg();
          // abort the upload process
          reject(new Error('Update Cancelled'));
          return;
        }
        if (this._batchAckReceived) {
          this._batchAckReceived = false;
          resolve();
          return;
        } else {
          const now = Date.now();
          if (now - startTime > timeout) {
            reject(new Error('Update failed. Please try again.'));
            return;
          }
          setTimeout(checkFunction, 100);
        }
      };
      checkFunction();
    });
  }

  async _sendFileBlock(
    fileContents: Uint8Array,
    blockStart: number,
  ): Promise<number> {
    // Calc block start and end
    const blockEnd = Math.min(
      fileContents.length,
      blockStart + this._fileBlockSize,
    );
    const blockLen = blockEnd - blockStart;

    // Create entire message buffer (including protocol wrappers)
    const msgBuf = new Uint8Array(
      blockLen + 4 + RICREST_HEADER_PAYLOAD_POS + RICSERIAL_PAYLOAD_POS,
    );
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
        await this.awaitOutstandingMsgPromises(false);

        // Wrap into HDLC
        const framedMsg = this._msgHandler._miniHDLC.encode(msgBuf);

        // Send without awaiting immediately
        const promRslt = this._msgSender.sendTxMsgNoAwait(
          framedMsg,
          true,
          // Platform.OS === 'ios',
        );

        // Debug
        // RICUtils.verbose(RICUtils.buf2hex(framedMsg));

        // Add to list of pending messages
        if (promRslt !== null)
          this._msgAwaitList.push(new FileBlockTrackInfo(promRslt));
      }
    } catch (error) {
      RICUtils.warn(`_sendFileBlock error${error.toString()}`);
    }
    return blockLen;
  }

  onOktoMsg(fileOkTo: number) {
    // Get how far we've progressed in file
    this._ackedFilePos = fileOkTo;
    this._batchAckReceived = true;
    RICUtils.verbose(`onOktoMsg received file up to ${this._ackedFilePos}`);
  }

  async awaitOutstandingMsgPromises(all: boolean): Promise<void> {
    // Check if all outstanding promises to be awaited
    if (all) {
      for (const promRslt of this._msgAwaitList) {
        try {
          await promRslt.get();
        } catch (error) {
          RICUtils.warn(`awaitAll file part send failed ${error.toString()}`);
        }
      }
      this._msgAwaitList = [];
    } else {
      // RICUtils.debug('Await list len', this._msgAwaitList.length);
      if (
        this._msgAwaitList.length >=
        this.MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES
      ) {
        const fileBlockTrackInfo = this._msgAwaitList.shift();
        try {
          await fileBlockTrackInfo!.get();
        } catch (error) {
          RICUtils.warn(`awaitSome file part send failed ${error.toString()}`);
        }
      }
    }
  }
}
