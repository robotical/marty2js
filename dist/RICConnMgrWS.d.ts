/// <reference types="ws" />
import WebSocket from "isomorphic-ws";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventListener } from "./RICTypes.js";
export default class RICConnMgrWS {
    _ricMsgHandler: RICMsgHandler | null;
    _onStateChangeListener: RICConnEventListener | null;
    _ricToConnectTo: DiscoveredRIC | null;
    _webSocket: WebSocket | null;
    _isConnected: boolean;
    /**
     * Constructor
     *
     * @param msgHandler: RICMsgHandler - must implement send functions
     *
     */
    constructor(msgHandler: RICMsgHandler);
    /**
     * Attach a listener (callback) to report state changes
     *
     * @param listener: (ifType: RICIFType, stateChangeStr: string, args: RICConnEventArgs | null) => void
     *
     */
    onStateChange(listener: RICConnEventListener): void;
    /**
     * Get WS connection status
     *
     * @returns boolean (true if connected)
     *
     */
    getIsConnected(): Promise<boolean>;
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    connect(discoveredRIC: DiscoveredRIC): Promise<boolean>;
    /**
    * Disconnect from RIC
    *
    * @returns None
    *
    */
    disconnect(): Promise<void>;
    _performDeviceConnection(): Promise<boolean>;
    sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
    sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void>;
    _onMsgRx(msg: Uint8Array | null, error: string | null): void;
}
