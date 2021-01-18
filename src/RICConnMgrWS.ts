/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICConnWS
// Websocket Connector for RIC V2
//
// RIC V2
// Rob Dobson 2021
// (C) Robotical 2021
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import WebSocket from "isomorphic-ws";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventFn, RICEvent, RICIFType } from "./RICTypes.js";
import RICUtils from "./RICUtils.js";

export default class RICConnMgrWS {

    // RIC msg handler
    _ricMsgHandler: RICMsgHandler | null = null;

    // Callback to RICConnManager
    _onStateChangeListener: RICConnEventFn | null = null;

    // RIC to connect to
    _ricToConnectTo: DiscoveredRIC | null = null;

    // Websocket we are connected to
    _webSocket: WebSocket | null = null;

    // Is connected
    _webSocketIsConnected: boolean = false;

    /**
     * Constructor
     *
     * @param msgHandler: RICMsgHandler - must implement send functions
     *
     */
    constructor(msgHandler: RICMsgHandler) {
        this._ricMsgHandler = msgHandler;
    }

    /**
     * Attach a listener (callback) to report state changes
     *
     * @param listener: (ifType: RICIFType, stateChangeStr: string, args: RICConnEventArgs | null) => void
     *
     */
    onStateChange(listener: RICConnEventFn): void {
        this._onStateChangeListener = listener;
    }

    /**
     * Get WS connection status
     *
     * @returns boolean (true if connected)
     *
     */
    async getIsConnected(): Promise<boolean> {
        return this._webSocketIsConnected;
    }

    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    async connect(discoveredRIC: DiscoveredRIC): Promise<boolean> {

        // Now connecting
        if (this._onStateChangeListener) {
            this._onStateChangeListener(RICEvent.CONNECTING_RIC,
                {
                    ipAddress: discoveredRIC.ipAddress,
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
        }

        // Remember RIC info
        this._ricToConnectTo = discoveredRIC;

        // Connect
        const connOk = await this._performDeviceConnection();

        // Check if ok
        if (!connOk) {
            // Inform of failure
            if (this._onStateChangeListener) {
                this._onStateChangeListener(RICEvent.CONNECTING_RIC_FAIL,
                    {
                        ipAddress: discoveredRIC.ipAddress,
                        ifType: RICIFType.RIC_INTERFACE_WIFI,
                    });
                return false;
            }
        }

        // Inform of success
        if (this._onStateChangeListener) {
            this._onStateChangeListener(RICEvent.CONNECTED_RIC,
                {
                    ipAddress: discoveredRIC.ipAddress,
                    name: this._ricToConnectTo.name,
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
        }
        
        return true;
    }

    /**
    * Disconnect from RIC
    *
    * @returns None
    *
    */
    async disconnect(): Promise<void> {

        // Discard connect info
        this._ricToConnectTo = null;

        // Disconnect websocket
        this._webSocket?.close();

        // Report disconnection
        if (this._onStateChangeListener !== null) {
            this._onStateChangeListener(RICEvent.DISCONNECTED_RIC,
                {
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
        }
    }

    async _performDeviceConnection(): Promise<boolean> {
        // Check there is a RIC to connect to
        if (this._ricToConnectTo === null) {
            return false;
        }

        // Check already connected
        if (await this.getIsConnected()) {
            return true;
        }

        // Form websocket address
        const wsURL = "ws://" + this._ricToConnectTo._hostnameOrIPAddress + "/ws";

        // Connect to websocket
        try {
            this._webSocket = await this.webSocketOpen(wsURL);
        } catch (error) {
            RICUtils.debug(`Unable to create WebSocket ${error.toString()}`);
            return false;
        }

        this._webSocket.onmessage = (evt: WebSocket.MessageEvent) => {
            // RICUtils.debug("WebSocket rx");
            if (evt.data instanceof ArrayBuffer) {
                const msg = new Uint8Array(evt.data);
                this._onMsgRx(msg);
            }
        }

        this._webSocket.onclose = (evt: WebSocket.CloseEvent) => {
            RICUtils.debug('Websocket connection closed ' + evt.toString());
            this._webSocket = null;
            this._webSocketIsConnected = false;
        }

        // Ok
        return true;
    }

    async webSocketOpen(url: string): Promise<WebSocket> {
        return new Promise((resolve, reject) => {

            // Debug
            // RICUtils.debug('Attempting WebSocket connection');

            // Open the socket
            try {
                const webSocket = new WebSocket(url);

                // Open socket
                webSocket.binaryType = "arraybuffer";
                webSocket.onopen = (evt: WebSocket.OpenEvent) => {
                    RICUtils.debug('WebSocket connection opened ' + evt.toString());
                    // // We're connected
                    this._webSocketIsConnected = true;
                    resolve(webSocket);
                };
                webSocket.onerror = function (evt) {
                    RICUtils.warn('Websocket error: ' + evt.toString());
                    reject(evt);
                }
            } catch (error) {
                RICUtils.warn('Websocket open failed: ' + error.toString());
                reject(error);
            }
        });
    }

    // @ts-ignore unused parameter (it is used for BLE comms)
    async sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // Check connected
        if (!this._webSocketIsConnected)
            return;

        // Debug
        // RICUtils.debug("sendTxMsg " + msg.toString() + " sendWithResp " + sendWithResponse.toString());

        // Send over websocket
        await this._webSocket?.send(msg);

    }

    // @ts-ignore unused parameter (it is used for BLE comms)
    async sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // Check connected
        if (!this._webSocketIsConnected)
            return;

        // Debug
        // RICUtils.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());

        // Send over websocket
        this._webSocket?.send(msg);
    }

    _onMsgRx(msg: Uint8Array | null) {

        // Debug
        // RICUtils.debug('_onMsgRx ' + RICUtils.bufferToHex(msg));

        // Handle message
        if (msg !== null && this._ricMsgHandler) {
            this._ricMsgHandler.handleNewRxMsg(msg);
        }
    }
}
