import RICMsgHandler, { MessageSender } from './RICMsgHandler.js';
import { RICFileSendType } from './RICTypes.js';
import CommsStats from './CommsStats.js';
import { FileBlockTrackInfo } from './RICMsgTrackInfo.js';
declare enum FileSendState {
    FILE_STATE_NONE = 0,
    FILE_STATE_START_ACK = 1,
    FILE_STATE_BLOCK_ACK = 2,
    FILE_STATE_END_ACK = 3
}
export default class RICFileHandler {
    _msgHandler: RICMsgHandler;
    _fileSendState: FileSendState;
    _fileSendStateMs: number;
    _fileSendMsgHandle: number;
    BLOCK_ACK_TIMEOUT_MS: number;
    RIC_FILE_UPLOAD_START_TIMEOUT_MS: number;
    _fileBlockSize: number;
    _batchAckSize: number;
    _fileNumBlocks: number;
    _fileBlockRetries: number;
    BLOCK_MAX_RETRIES: number;
    _sendWithoutBatchAcks: boolean;
    _ackedFilePos: number;
    _batchAckReceived: boolean;
    _isCancelled: boolean;
    _commsStats: CommsStats;
    _msgSender: MessageSender | null;
    _msgAwaitList: Array<FileBlockTrackInfo>;
    MAX_OUTSTANDING_FILE_BLOCK_SEND_PROMISES: number;
    _msgOutstanding: Promise<void> | null;
    constructor(msgHandler: RICMsgHandler, commsStats: CommsStats);
    registerMsgSender(messageSender: MessageSender): void;
    fileSend(fileName: string, fileType: RICFileSendType, fileContents: Uint8Array, progressCallback: (sent: number, total: number, progress: number) => void): Promise<boolean>;
    fileSendCancel(): Promise<void>;
    _sendFileStartMsg(fileName: string, fileType: RICFileSendType, fileContents: Uint8Array): Promise<void>;
    _sendFileEndMsg(fileName: string, fileType: RICFileSendType, fileContents: Uint8Array): Promise<void>;
    _sendFileCancelMsg(): Promise<void>;
    _sendFileContents(fileContents: Uint8Array, progressCallback: (sent: number, total: number, progress: number) => void): Promise<void>;
    batchAck(timeout: number): Promise<void>;
    _sendFileBlock(fileContents: Uint8Array, blockStart: number): Promise<number>;
    onOktoMsg(fileOkTo: number): void;
    awaitOutstandingMsgPromises(all: boolean): Promise<void>;
}
export {};
