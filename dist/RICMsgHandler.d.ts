/// <reference types="node" />
import CommsStats from './CommsStats.js';
import MsgTrackInfo from './RICMsgTrackInfo.js';
import { ROSSerialIMU, ROSSerialSmartServos, ROSSerialPowerStatus, ROSSerialAddOnStatusList } from './RICROSSerial.js';
import MiniHDLC from './MiniHDLC.js';
import RICAddOnManager from './RICAddOnManager.js';
export declare enum RICRESTElemCode {
    RICREST_REST_ELEM_URL = 0,
    RICREST_REST_ELEM_CMDRESPJSON = 1,
    RICREST_REST_ELEM_BODY = 2,
    RICREST_REST_ELEM_COMMAND_FRAME = 3,
    RICREST_REST_ELEM_FILEBLOCK = 4
}
export declare enum ProtocolMsgDirection {
    MSG_DIRECTION_COMMAND = 0,
    MSG_DIRECTION_RESPONSE = 1,
    MSG_DIRECTION_PUBLISH = 2,
    MSG_DIRECTION_REPORT = 3
}
export declare enum ProtocolMsgProtocol {
    MSG_PROTOCOL_ROSSERIAL = 0,
    MSG_PROTOCOL_M1SC = 1,
    MSG_PROTOCOL_RICREST = 2
}
export declare enum MessageResultCode {
    MESSAGE_RESULT_TIMEOUT = 0,
    MESSAGE_RESULT_OK = 1,
    MESSAGE_RESULT_FAIL = 2,
    MESSAGE_RESULT_UNKNOWN = 3
}
export interface MessageResult {
    onRxReply(msgHandle: number, msgRsltCode: MessageResultCode, msgRsltJsonObj: object | null): void;
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
export default class RICMsgHandler {
    _currentMsgNumber: number;
    _currentMsgHandle: number;
    _msgTrackInfos: Array<MsgTrackInfo>;
    _msgTrackCheckTimer: ReturnType<typeof setTimeout> | null;
    _msgTrackTimerEnabled: boolean;
    _msgTrackTimerMs: number;
    _msgResultHandler: MessageResult | null;
    _msgSender: MessageSender | null;
    _commsStats: CommsStats;
    _miniHDLC: MiniHDLC;
    _addOnManager: RICAddOnManager;
    constructor(commsStats: CommsStats, addOnManager: RICAddOnManager);
    open(): void;
    close(): void;
    registerForResults(msgResultHandler: MessageResult): void;
    registerMsgSender(messageSender: MessageSender): void;
    handleNewRxMsg(rxMsg: Uint8Array): void;
    _onHDLCFrameDecode(rxMsg: Uint8Array): void;
    sendRICRESTURL<T>(cmdStr: string, msgTracking: boolean, msgTimeoutMs?: number | undefined): Promise<T>;
    sendRICRESTCmdFrame<T>(cmdStr: string, msgTracking: boolean, msgTimeoutMs?: number | undefined): Promise<T>;
    sendRICREST<T>(cmdStr: string, ricRESTElemCode: RICRESTElemCode, msgTracking: boolean, msgTimeoutMs?: number | undefined): Promise<T>;
    sendRICRESTBytes<T>(cmdBytes: Uint8Array, ricRESTElemCode: RICRESTElemCode, isNumbered: boolean, withResponse: boolean, msgTimeoutMs?: number | undefined): Promise<T>;
    sendCommsMsg<T>(msgPayload: Uint8Array, msgDirection: ProtocolMsgDirection, msgProtocol: ProtocolMsgProtocol, isNumbered: boolean, withResponse: boolean, msgTimeoutMs: number | undefined): Promise<T>;
    msgTrackingTxCmdMsg<T>(msgFrame: Uint8Array, withResponse: boolean, msgTimeoutMs: number | undefined, resolve: (arg: T) => void, reject: (reason: Error) => void): void;
    msgTrackingRxRespMsg(msgNum: number, msgRsltCode: MessageResultCode, msgRsltJsonObj: object): void;
    _msgCompleted(msgNum: number, msgRsltCode: MessageResultCode, msgRsltObj: object | null): void;
    _onMsgTrackTimer(): Promise<void>;
}
