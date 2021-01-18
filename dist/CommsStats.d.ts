export default class CommsStats {
    _msgRxCount: number;
    _msgRxCountInWindow: number;
    _msgRxLastCalcMs: number;
    _msgRxRate: number;
    _msgTooShort: number;
    _msgTxCount: number;
    _msgTxCountInWindow: number;
    _msgTxLastCalcMs: number;
    _msgTxRate: number;
    _msgNumCollisions: number;
    _msgNumUnmatched: number;
    _msgRoundtripWorstMs: number;
    _msgRoundtripBestMs: number;
    _msgRoundtripLastMs: number;
    _msgTimeout: number;
    _msgRetry: number;
    _msgSmartServos: number;
    _msgIMU: number;
    _msgPowerStatus: number;
    _msgAddOnPub: number;
    clear(): void;
    msgRx(): void;
    getMsgRxRate(): number;
    msgTooShort(): void;
    msgTx(): void;
    getMsgTxRate(): number;
    getRTWorstMs(): number;
    getRTLastMs(): number;
    getRTBestMs(): number;
    getRetries(): number;
    recordMsgNumCollision(): void;
    recordMsgNumUnmatched(): void;
    recordMsgResp(roundTripMs: number): void;
    recordMsgTimeout(): void;
    recordMsgRetry(): void;
    recordSmartServos(): void;
    recordIMU(): void;
    recordPowerStatus(): void;
    recordAddOnPub(): void;
}
