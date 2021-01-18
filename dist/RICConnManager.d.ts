import RICConnMgrWS from "./RICConnMgrWS.js";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventListener } from "./RICTypes.js";
export default class RICConnManager {
    _connMgrWS: RICConnMgrWS | null;
    constructor(msgHandler: RICMsgHandler);
    onStateChange(listener: RICConnEventListener): void;
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
