"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// CommsStats
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
var CommsStats = /** @class */ (function () {
    function CommsStats() {
        this._msgRxCount = 0;
        this._msgRxCountInWindow = 0;
        this._msgRxLastCalcMs = 0;
        this._msgRxRate = 0;
        this._msgTooShort = 0;
        this._msgTxCount = 0;
        this._msgTxCountInWindow = 0;
        this._msgTxLastCalcMs = 0;
        this._msgTxRate = 0;
        this._msgNumCollisions = 0;
        this._msgNumUnmatched = 0;
        this._msgRoundtripWorstMs = 0;
        this._msgRoundtripBestMs = 0;
        this._msgRoundtripLastMs = 0;
        this._msgTimeout = 0;
        this._msgRetry = 0;
        this._msgSmartServos = 0;
        this._msgIMU = 0;
        this._msgPowerStatus = 0;
        this._msgAddOnPub = 0;
    }
    CommsStats.prototype.clear = function () {
        this._msgRxCount = 0;
        this._msgRxCountInWindow = 0;
        this._msgRxLastCalcMs = Date.now();
        this._msgRxRate = 0;
        this._msgTooShort = 0;
        this._msgTxCount = 0;
        this._msgTxCountInWindow = 0;
        this._msgTxLastCalcMs = Date.now();
        this._msgTxRate = 0;
        this._msgNumCollisions = 0;
        this._msgNumUnmatched = 0;
        this._msgRoundtripBestMs = 0;
        this._msgRoundtripWorstMs = 0;
        this._msgRoundtripLastMs = 0;
        this._msgTimeout = 0;
        this._msgRetry = 0;
        this._msgSmartServos = 0;
        this._msgIMU = 0;
        this._msgPowerStatus = 0;
        this._msgAddOnPub = 0;
    };
    CommsStats.prototype.msgRx = function () {
        this._msgRxCount++;
        this._msgRxCountInWindow++;
    };
    CommsStats.prototype.getMsgRxRate = function () {
        if (this._msgRxLastCalcMs + 1000 < Date.now()) {
            this._msgRxRate =
                (1000.0 * this._msgRxCountInWindow) /
                    (Date.now() - this._msgRxLastCalcMs);
            this._msgRxLastCalcMs = Date.now();
            this._msgRxCountInWindow = 0;
        }
        return this._msgRxRate;
    };
    CommsStats.prototype.msgTooShort = function () {
        this._msgTooShort++;
    };
    CommsStats.prototype.msgTx = function () {
        this._msgTxCount++;
        this._msgTxCountInWindow++;
    };
    CommsStats.prototype.getMsgTxRate = function () {
        if (this._msgTxLastCalcMs + 1000 < Date.now()) {
            this._msgTxRate =
                (1000.0 * this._msgTxCountInWindow) /
                    (Date.now() - this._msgTxLastCalcMs);
            this._msgTxLastCalcMs = Date.now();
            this._msgTxCountInWindow = 0;
        }
        return this._msgTxRate;
    };
    CommsStats.prototype.getRTWorstMs = function () {
        return this._msgRoundtripWorstMs;
    };
    CommsStats.prototype.getRTLastMs = function () {
        return this._msgRoundtripLastMs;
    };
    CommsStats.prototype.getRTBestMs = function () {
        return this._msgRoundtripBestMs;
    };
    CommsStats.prototype.getRetries = function () {
        return this._msgRetry;
    };
    CommsStats.prototype.recordMsgNumCollision = function () {
        this._msgNumCollisions++;
    };
    CommsStats.prototype.recordMsgNumUnmatched = function () {
        this._msgNumUnmatched++;
    };
    CommsStats.prototype.recordMsgResp = function (roundTripMs) {
        if (this._msgRoundtripWorstMs < roundTripMs)
            this._msgRoundtripWorstMs = roundTripMs;
        if (this._msgRoundtripBestMs == 0 || this._msgRoundtripBestMs > roundTripMs)
            this._msgRoundtripBestMs = roundTripMs;
        this._msgRoundtripLastMs = roundTripMs;
    };
    CommsStats.prototype.recordMsgTimeout = function () {
        this._msgTimeout++;
    };
    CommsStats.prototype.recordMsgRetry = function () {
        this._msgRetry++;
    };
    CommsStats.prototype.recordSmartServos = function () {
        this._msgSmartServos++;
        this.msgRx();
    };
    CommsStats.prototype.recordIMU = function () {
        this._msgIMU++;
        // Don't call msgRx() as double counting msgs with smartServos
    };
    CommsStats.prototype.recordPowerStatus = function () {
        this._msgPowerStatus++;
        this.msgRx();
    };
    CommsStats.prototype.recordAddOnPub = function () {
        this._msgAddOnPub++;
        this.msgRx();
    };
    return CommsStats;
}());
exports.default = CommsStats;
