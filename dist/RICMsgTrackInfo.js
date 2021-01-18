"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICMsgTrackInfo
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RICUtils_1 = __importDefault(require("./RICUtils"));
var FileBlockTrackInfo = /** @class */ (function () {
    function FileBlockTrackInfo(prom) {
        var _this = this;
        this.isDone = false;
        this.prom = prom;
        this.prom.then(function () {
            // RICUtils.debug('send complete');
            _this.isDone = true;
        }, function (rej) {
            RICUtils_1.default.debug('FileBlockTrackInfo send rejected ' + rej.toString());
            _this.isDone = true;
        });
    }
    FileBlockTrackInfo.prototype.isComplete = function () {
        return this.isDone;
    };
    FileBlockTrackInfo.prototype.get = function () {
        return this.prom;
    };
    return FileBlockTrackInfo;
}());
exports.FileBlockTrackInfo = FileBlockTrackInfo;
var MsgTrackInfo = /** @class */ (function () {
    function MsgTrackInfo() {
        this.msgOutstanding = false;
        this.msgFrame = null;
        this.msgSentMs = 0;
        this.retryCount = 0;
        this.withResponse = false;
        this.msgHandle = 0;
        this.msgOutstanding = false;
    }
    MsgTrackInfo.prototype.set = function (msgOutstanding, msgFrame, withResponse, msgHandle, resolve, reject) {
        this.msgOutstanding = msgOutstanding;
        this.msgFrame = msgFrame;
        this.retryCount = 0;
        this.msgSentMs = Date.now();
        this.withResponse = withResponse;
        this.msgHandle = msgHandle;
        this.resolve = resolve;
        this.reject = reject;
    };
    return MsgTrackInfo;
}());
exports.default = MsgTrackInfo;
