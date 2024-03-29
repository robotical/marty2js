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

import RICUtils from "./RICUtils.js";

export class FileBlockTrackInfo {
  isDone = false;
  prom: Promise<void>;
  constructor(prom: Promise<void>) {
    this.prom = prom;
    this.prom.then(
      () => {
        // RICUtils.debug('send complete');
        this.isDone = true;
      },
      rej => {
        RICUtils.debug('FileBlockTrackInfo send rejected ' + rej.toString());
        this.isDone = true;
      },
    );
  }
  isComplete() {
    return this.isDone;
  }
  get() {
    return this.prom;
  }
}

export default class MsgTrackInfo {
  msgOutstanding = false;
  msgFrame: Uint8Array | null = null;
  msgSentMs = 0;
  retryCount = 0;
  withResponse = false;
  msgHandle = 0;
  msgTimeoutMs: number | undefined = undefined;
  resolve: ((value: any) => void) | null = null;
  reject: ((reason?: any) => void) | null = null;

  constructor() {
    this.msgOutstanding = false;
  }

  set(
    msgOutstanding: boolean,
    msgFrame: Uint8Array,
    withResponse: boolean,
    msgHandle: number,
    msgTimeoutMs: number | undefined,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ) {
    this.msgOutstanding = msgOutstanding;
    this.msgFrame = msgFrame;
    this.retryCount = 0;
    this.msgSentMs = Date.now();
    this.withResponse = withResponse;
    this.msgHandle = msgHandle;
    this.msgTimeoutMs = msgTimeoutMs;
    this.resolve = resolve;
    this.reject = reject;
  }
}
