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

import CommsStats from './CommsStats.js';
import MsgTrackInfo from './RICMsgTrackInfo.js';
import RICUtils from './RICUtils.js';
import RICROSSerial, {
  ROSSerialIMU,
  ROSSerialSmartServos,
  ROSSerialPowerStatus,
  ROSSerialAddOnStatusList,
} from './RICROSSerial.js';
import {
  PROTOCOL_RICREST,
  RICSERIAL_MSG_NUM_POS,
  RICSERIAL_PAYLOAD_POS,
  RICSERIAL_PROTOCOL_POS,
  RICREST_REST_ELEM_CODE_POS,
  RICREST_HEADER_PAYLOAD_POS,
} from './RICProtocolDefs.js';
import MiniHDLC from './MiniHDLC.js';
import RICAddOnManager from './RICAddOnManager.js';

// Protocol enums
export enum RICRESTElemCode {
  RICREST_REST_ELEM_URL,
  RICREST_REST_ELEM_CMDRESPJSON,
  RICREST_REST_ELEM_BODY,
  RICREST_REST_ELEM_COMMAND_FRAME,
  RICREST_REST_ELEM_FILEBLOCK,
}

export enum ProtocolMsgDirection {
  MSG_DIRECTION_COMMAND,
  MSG_DIRECTION_RESPONSE,
  MSG_DIRECTION_PUBLISH,
  MSG_DIRECTION_REPORT,
}

export enum ProtocolMsgProtocol {
  MSG_PROTOCOL_ROSSERIAL,
  MSG_PROTOCOL_M1SC,
  MSG_PROTOCOL_RICREST,
}

// Message results
export enum MessageResultCode {
  MESSAGE_RESULT_TIMEOUT,
  MESSAGE_RESULT_OK,
  MESSAGE_RESULT_FAIL,
  MESSAGE_RESULT_UNKNOWN,
}

export interface MessageResult {
  onRxReply(
    msgHandle: number,
    msgRsltCode: MessageResultCode,
    msgRsltJsonObj: object | null,
  ): void;
  onRxUnnumberedMsg(msgRsltJsonObj: {}): void;
  onRxSmartServo(smartServos: ROSSerialSmartServos): void;
  onRxIMU(imuData: ROSSerialIMU): void;
  onRxPowerStatus(powerStatus: ROSSerialPowerStatus): void;
  onRxAddOnPub(addOnInfo: ROSSerialAddOnStatusList): void;
}

export interface MessageSender {
  sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
  sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
}

// Message tracking
const MAX_MSG_NUM = 255;
const MSG_RESPONSE_TIMEOUT_MS = 500;
const MSG_RETRY_COUNT = 5;

export default class RICMsgHandler {
  // Message numbering and tracking
  _currentMsgNumber = 1;
  _currentMsgHandle = 1;
  _msgTrackInfos: Array<MsgTrackInfo> = new Array<MsgTrackInfo>(
    MAX_MSG_NUM + 1,
  );
  _msgTrackCheckTimer: ReturnType<typeof setTimeout> | null = null;
  _msgTrackTimerEnabled = false;
  _msgTrackTimerMs = 100;

  // Interface to inform of message results
  _msgResultHandler: MessageResult | null = null;

  // Interface to send messages
  _msgSender: MessageSender | null = null;

  // Comms stats
  _commsStats: CommsStats;

  // MiniHDLC - handles part of RICSerial protocol
  _miniHDLC: MiniHDLC;

  // Add-on manager
  _addOnManager: RICAddOnManager;

  // Constructor
  constructor(commsStats: CommsStats, addOnManager: RICAddOnManager) {
    this._commsStats = commsStats;
    this._addOnManager = addOnManager;
    RICUtils.debug('RICMsgHandler constructor');

    // Message tracking
    for (let i = 0; i < this._msgTrackInfos.length; i++) {
      this._msgTrackInfos[i] = new MsgTrackInfo();
    }

    // HDLC used to encode/decode the RICREST protocol
    this._miniHDLC = new MiniHDLC();
    this._miniHDLC.onRxFrame = this._onHDLCFrameDecode.bind(this);
  }

  open(): void {
    // Timer for checking messages
    this._msgTrackTimerEnabled = true;
    this._msgTrackCheckTimer = setTimeout(async () => {
      this._onMsgTrackTimer();
    }, this._msgTrackTimerMs);
  }

  close(): void {
    this._msgTrackTimerEnabled = false;
    if (this._msgTrackCheckTimer) {
      clearTimeout(this._msgTrackCheckTimer);
      this._msgTrackCheckTimer = null;
    }
  }

  registerForResults(msgResultHandler: MessageResult) {
    this._msgResultHandler = msgResultHandler;
  }

  registerMsgSender(messageSender: MessageSender) {
    this._msgSender = messageSender;
  }

  handleNewRxMsg(rxMsg: Uint8Array): void {
    this._miniHDLC.addRxBytes(rxMsg);
    RICUtils.verbose(`HandleRxBytes len ${rxMsg.length} ${RICUtils.bufferToHex(rxMsg)}`)
  }

  _onHDLCFrameDecode(rxMsg: Uint8Array): void {
    // Add to stats
    this._commsStats.msgRx();

    // Validity
    if (rxMsg.length < RICSERIAL_PAYLOAD_POS) {
      this._commsStats.msgTooShort();
      return;
    }

    RICUtils.verbose(`handleNewRxMsg len ${rxMsg.length}`);

    // Decode the RICFrame header
    const rxMsgNum = rxMsg[RICSERIAL_MSG_NUM_POS] & 0xff;
    const rxProtocol = rxMsg[RICSERIAL_PROTOCOL_POS] & 0x3f;
    const rxDirn = (rxMsg[RICSERIAL_PROTOCOL_POS] >> 6) & 0x03;

    // Result of message
    let msgRsltCode = MessageResultCode.MESSAGE_RESULT_UNKNOWN;
    let msgRsltJsonObj = { rslt: 'unknown' };

    // Decode payload
    if (rxProtocol == PROTOCOL_RICREST) {
      RICUtils.verbose(
        `handleNewRxMsg RICREST rx msgNum ${rxMsgNum} msgDirn ${rxDirn} ${RICUtils.bufferToHex(
          rxMsg,
        )}`,
      );
      // Extract payload
      const ricRestElemCode =
        rxMsg[RICSERIAL_PAYLOAD_POS + RICREST_REST_ELEM_CODE_POS] & 0xff;
      if (
        ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_URL ||
        ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_CMDRESPJSON ||
        ricRestElemCode == RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME
      ) {
        // Ascii messages
        const restStr = RICUtils.getStringFromBuffer(
          rxMsg,
          RICSERIAL_PAYLOAD_POS + RICREST_HEADER_PAYLOAD_POS,
          rxMsg.length - RICSERIAL_PAYLOAD_POS - RICREST_HEADER_PAYLOAD_POS - 1,
        );
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
              } else if (rsltStr === 'fail') {
                msgRsltCode = MessageResultCode.MESSAGE_RESULT_FAIL;
              } else {
                console.warn(
                  `handleNewRxMsg RICREST rslt not recognized ${msgRsltJsonObj.rslt}`,
                );
              }
            } else {
              console.warn(
                `handleNewRxMsg RICREST doesn't contain rslt ${restStr}`,
              );
            }
          } catch (excp) {
            console.warn(
              `handleNewRxMsg Failed to parse JSON response ${excp}`,
            );
          }
        }
      } else {
        // const binMsgLen =
        //   rxMsg.length - RICSERIAL_PAYLOAD_POS - RICREST_HEADER_PAYLOAD_POS;
        // RICUtils.debug(
        //   `handleNewRxMsg RICREST rx binary message elemCode ${ricRestElemCode} len ${binMsgLen}`,
        // );
      }
    } else if (rxProtocol == ProtocolMsgProtocol.MSG_PROTOCOL_ROSSERIAL) {
      // Extract ROSSerial messages - decoded messages returned via _msgResultHandler
      RICROSSerial.decode(
        rxMsg,
        RICSERIAL_PAYLOAD_POS,
        this._msgResultHandler,
        this._commsStats,
        this._addOnManager,
      );
    } else {
      RICUtils.warn(`handleNewRxMsg unsupported protocol ${rxProtocol}`);
    }

    // Handle matching of commands and responses
    //        RICUtils.debug(`onMsgRx msgRsltCode ${msgRsltCode}`);
    if (rxDirn == ProtocolMsgDirection.MSG_DIRECTION_RESPONSE) {
      this.msgTrackingRxRespMsg(rxMsgNum, msgRsltCode, msgRsltJsonObj);
    }
  }

  async sendRICRESTURL<T>(
    cmdStr: string, 
    msgTracking: boolean,
    msgTimeoutMs: number | undefined = undefined,
  ): Promise<T> {
    // Send
    return await this.sendRICREST(
      cmdStr,
      RICRESTElemCode.RICREST_REST_ELEM_URL,
      msgTracking,
      msgTimeoutMs,
    );
  }

  async sendRICRESTCmdFrame<T>(
    cmdStr: string, 
    msgTracking: boolean,
    msgTimeoutMs: number | undefined = undefined,
  ): Promise<T> {
    // Send
    return await this.sendRICREST(
      cmdStr,
      RICRESTElemCode.RICREST_REST_ELEM_COMMAND_FRAME,
      msgTracking,
      msgTimeoutMs,
    );
  }

  async sendRICREST<T>(
    cmdStr: string,
    ricRESTElemCode: RICRESTElemCode,
    msgTracking: boolean,
    msgTimeoutMs: number | undefined = undefined,
  ): Promise<T> {
    // Put cmdStr into buffer
    const cmdStrTerm = new Uint8Array(cmdStr.length + 1);
    RICUtils.addStringToBuffer(cmdStrTerm, cmdStr, 0);
    cmdStrTerm[cmdStrTerm.length - 1] = 0;

    // Send
    return await this.sendRICRESTBytes(
      cmdStrTerm,
      ricRESTElemCode,
      msgTracking,
      true,
      msgTimeoutMs,
    );
  }

  async sendRICRESTBytes<T>(
    cmdBytes: Uint8Array,
    ricRESTElemCode: RICRESTElemCode,
    isNumbered: boolean,
    withResponse: boolean,
    msgTimeoutMs: number | undefined = undefined,
  ): Promise<T> {
    // Form message
    const cmdMsg = new Uint8Array(cmdBytes.length + RICREST_HEADER_PAYLOAD_POS);
    cmdMsg[RICREST_REST_ELEM_CODE_POS] = ricRESTElemCode;
    cmdMsg.set(cmdBytes, RICREST_HEADER_PAYLOAD_POS);

    // Send
    return await this.sendCommsMsg<T>(
      cmdMsg,
      ProtocolMsgDirection.MSG_DIRECTION_COMMAND,
      ProtocolMsgProtocol.MSG_PROTOCOL_RICREST,
      isNumbered,
      withResponse,
      msgTimeoutMs,
    );
  }

  async sendCommsMsg<T>(
    msgPayload: Uint8Array,
    msgDirection: ProtocolMsgDirection,
    msgProtocol: ProtocolMsgProtocol,
    isNumbered: boolean,
    withResponse: boolean,
    msgTimeoutMs: number | undefined,
  ): Promise<T> {
    const promise = new Promise<T>(async (resolve, reject) => {
      try {
        // Header
        const msgBuf = new Uint8Array(
          msgPayload.length + RICSERIAL_PAYLOAD_POS,
        );
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
          this.msgTrackingTxCmdMsg<T>(framedMsg, withResponse, msgTimeoutMs, resolve, reject);
          this._currentMsgHandle++;
        }

        // Send
        if (this._msgSender) {
          await this._msgSender.sendTxMsg(framedMsg, withResponse);
        }

        // Return msg handle
        if (!isNumbered) {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
    promise.catch(error => RICUtils.warn(error));
    return promise;
  }

  msgTrackingTxCmdMsg<T>(
    msgFrame: Uint8Array,
    withResponse: boolean,
    msgTimeoutMs: number | undefined,
    resolve: (arg: T) => void,
    reject: (reason: Error) => void,
  ): void {
    // Record message re-use of number
    if (this._msgTrackInfos[this._currentMsgNumber].msgOutstanding) {
      this._commsStats.recordMsgNumCollision();
    }

    // Set tracking info
    this._msgTrackInfos[this._currentMsgNumber].set(
      true,
      msgFrame,
      withResponse,
      this._currentMsgHandle,
      msgTimeoutMs,
      resolve,
      reject,
    );

    // Debug
    RICUtils.verbose(
      `msgTrackingTxCmdMsg msgNum ${
        this._currentMsgNumber
      } msg ${RICUtils.bufferToHex(msgFrame)} sanityCheck ${
        this._msgTrackInfos[this._currentMsgNumber].msgOutstanding
      }`,
    );

    // Stats
    this._commsStats.msgTx();

    // Bump msg number
    if (this._currentMsgNumber == MAX_MSG_NUM) {
      this._currentMsgNumber = 1;
    } else {
      this._currentMsgNumber++;
    }
  }

  msgTrackingRxRespMsg(
    msgNum: number,
    msgRsltCode: MessageResultCode,
    msgRsltJsonObj: object,
  ) {
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
    this._commsStats.recordMsgResp(
      Date.now() - this._msgTrackInfos[msgNum].msgSentMs,
    );
    this._msgCompleted(msgNum, msgRsltCode, msgRsltJsonObj);
  }

  _msgCompleted(
    msgNum: number,
    msgRsltCode: MessageResultCode,
    msgRsltObj: object | null,
  ) {
    const msgHandle = this._msgTrackInfos[msgNum].msgHandle;
    this._msgTrackInfos[msgNum].msgOutstanding = false;
    if (this._msgResultHandler !== null) {
      this._msgResultHandler.onRxReply(msgHandle, msgRsltCode, msgRsltObj);
    }
    if (msgRsltCode === MessageResultCode.MESSAGE_RESULT_OK) {
      const resolve = this._msgTrackInfos[msgNum].resolve;
      if (resolve) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolve as any)(msgRsltObj);
      }
    } else {
      const reject = this._msgTrackInfos[msgNum].reject;
      if (reject) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reject as any)(new Error(`Message failed ${MessageResultCode[msgRsltCode]}`));
      }
    }
    this._msgTrackInfos[msgNum].resolve = null;
    this._msgTrackInfos[msgNum].reject = null;
  }

  // Check message timeouts
  async _onMsgTrackTimer(): Promise<void> {
    // Check message timeouts
    for (let i = 0; i < MAX_MSG_NUM + 1; i++) {
      if (!this._msgTrackInfos[i].msgOutstanding) continue;
      let msgTimeoutMs = this._msgTrackInfos[i].msgTimeoutMs;
      if (msgTimeoutMs === undefined)
        msgTimeoutMs = MSG_RESPONSE_TIMEOUT_MS;
      if (
        Date.now() >
        this._msgTrackInfos[i].msgSentMs + msgTimeoutMs
      ) {
        RICUtils.debug(
          `msgTrackTimer Message response timeout msgNum ${i} retrying`,
        );
        if (this._msgTrackInfos[i].retryCount < MSG_RETRY_COUNT) {
          this._msgTrackInfos[i].retryCount++;
          if (
            this._msgSender !== null &&
            this._msgTrackInfos[i].msgFrame !== null
          ) {
            try {
              await this._msgSender.sendTxMsg(
                this._msgTrackInfos[i].msgFrame!,
                this._msgTrackInfos[i].withResponse,
              );
            } catch (error) {
              RICUtils.warn('Retry message failed' + error.toString());
            }
          }
          this._commsStats.recordMsgRetry();
          this._msgTrackInfos[i].msgSentMs = Date.now();
        } else {
          RICUtils.debug(
            `msgTrackTimer TIMEOUT msgNum ${i} after ${MSG_RETRY_COUNT} retries`,
          );
          this._msgCompleted(i, MessageResultCode.MESSAGE_RESULT_TIMEOUT, null);
          this._commsStats.recordMsgTimeout();
        }
      }
    }

    // Call again
    if (this._msgTrackTimerEnabled) {
      this._msgTrackCheckTimer = setTimeout(async () => {
        this._onMsgTrackTimer();
      }, this._msgTrackTimerMs);
    }
  }
}
