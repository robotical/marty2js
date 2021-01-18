import RICConnMgrWS from "./RICConnMgrWS.js";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventFn, RICIFType } from "./RICTypes.js";
export default class RICConnManager {
    _connMgrWS: RICConnMgrWS | null;
    _interfaceInUse: RICIFType;
    constructor(msgHandler: RICMsgHandler);
    onStateChange(listener: RICConnEventFn): void;
    connect(discoveredRIC: DiscoveredRIC): Promise<boolean>;
    /**
   * Disconnect from RIC
   *
   * @returns None
   *
   */
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
    sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
}
