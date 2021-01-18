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
import RICUtils from "./RICUtils";
export class FileBlockTrackInfo {
    constructor(prom) {
        this.isDone = false;
        this.prom = prom;
        this.prom.then(() => {
            // RICUtils.debug('send complete');
            this.isDone = true;
        }, rej => {
            RICUtils.debug('FileBlockTrackInfo send rejected ' + rej.toString());
            this.isDone = true;
        });
    }
    isComplete() {
        return this.isDone;
    }
    get() {
        return this.prom;
    }
}
export default class MsgTrackInfo {
    constructor() {
        this.msgOutstanding = false;
        this.msgFrame = null;
        this.msgSentMs = 0;
        this.retryCount = 0;
        this.withResponse = false;
        this.msgHandle = 0;
        this.msgOutstanding = false;
    }
    set(msgOutstanding, msgFrame, withResponse, msgHandle, resolve, reject) {
        this.msgOutstanding = msgOutstanding;
        this.msgFrame = msgFrame;
        this.retryCount = 0;
        this.msgSentMs = Date.now();
        this.withResponse = withResponse;
        this.msgHandle = msgHandle;
        this.resolve = resolve;
        this.reject = reject;
    }
}
