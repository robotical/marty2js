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
import { DiscoveredRIC, RICConnEventListener, RICEvent, RICIFType } from "./RICTypes.js";
import RICUtils from "./RICUtils.js";

export default class RICConnMgrWS {

    // RIC msg handler
    _ricMsgHandler: RICMsgHandler | null = null;

    // Callback to RICConnManager
    _onStateChangeListener: RICConnEventListener | null = null;

    // RIC to connect to
    _ricToConnectTo: DiscoveredRIC | null = null;

    // Websocket we are connected to
    _webSocket: WebSocket | null = null;

    // Is connected
    _isConnected: boolean = false;

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
    onStateChange(listener: RICConnEventListener): void {
        this._onStateChangeListener = listener;
    }

    /**
     * Get WS connection status
     *
     * @returns boolean (true if connected)
     *
     */
    async getIsConnected(): Promise<boolean> {
        return this._isConnected;
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
                    url: discoveredRIC.url,
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
                        url: discoveredRIC.url,
                        ifType: RICIFType.RIC_INTERFACE_WIFI,
                    });
                return false;
            }
        }

        // Inform of success
        if (this._onStateChangeListener) {
            this._onStateChangeListener(RICEvent.CONNECTED_RIC,
                {
                    url: this._ricToConnectTo.url,
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

        // Connect to websocket
        this._webSocket = new WebSocket(this._ricToConnectTo.url);
        if (!this._webSocket) {
            RICUtils.debug("Unable to create WebSocket");
            return false;
        }

        // Debug
        RICUtils.debug('Attempting WebSocket connection');

        // Open socket
        this._webSocket.binaryType = "arraybuffer";
        this._webSocket.onopen = (evt: WebSocket.OpenEvent) => {
            RICUtils.debug('WebSocket connection opened ' + evt.toString());
        };

        this._webSocket.onmessage = (evt: WebSocket.MessageEvent) => {
            RICUtils.debug("WebSocket rx");
            if (evt.data instanceof ArrayBuffer) {
                const msg = new Uint8Array(evt.data);
                this._onMsgRx(msg, null);
            }
        }

        this._webSocket.onclose = (evt: WebSocket.CloseEvent) => {
            RICUtils.debug('Websocket connection closed ' + evt.toString());
            this._webSocket = null;
        }

        this._webSocket.onerror = function (evt) {
            RICUtils.debug('Websocket error: ' + evt);
        }

        // // We're connected
        // this._isConnected = true;

        // Ok
        return true;
    }

    async sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // TODO RD

        RICUtils.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());

        // // Check valid
        // if (this._bleDevice === null) {
        //   return;
        // }

        // // Convert to Base64
        // const msgFrameBase64 = RICUtils.btoa(msg);

        // // Write to the characteristic
        // if (sendWithResponse) {
        //   // RICUtils.debug('sendFrame withResponse');
        //   await this._bleDevice.writeCharacteristicWithResponseForService(
        //     this._RICServiceUUID,
        //     this._RICCmdUUID,
        //     msgFrameBase64!,
        //   );
        // } else {
        //   // RICUtils.debug('sendFrame withoutResponse');
        //   await this._bleDevice.writeCharacteristicWithoutResponseForService(
        //     this._RICServiceUUID,
        //     this._RICCmdUUID,
        //     msgFrameBase64!,
        //   );
        // }
    }

    async sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // TODO RD

        RICUtils.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());
        // // Convert to Base64
        // const msgFrameBase64 = RICUtils.btoa(msg);

        // // Write to the characteristic
        // if (sendWithResponse) {
        //   // RICUtils.debug('sendFrame withResponse');
        //   return this._bleDevice!.writeCharacteristicWithResponseForService(
        //     this._RICServiceUUID,
        //     this._RICCmdUUID,
        //     msgFrameBase64!,
        //   );
        // } else {
        //   // RICUtils.debug('sendFrame withoutResponse');
        //   return this._bleDevice!.writeCharacteristicWithoutResponseForService(
        //     this._RICServiceUUID,
        //     this._RICCmdUUID,
        //     msgFrameBase64!,
        //   );
        // }
    }

    _onMsgRx(msg: Uint8Array | null, error: string | null) {

        if (error) {
            // TODO RD
            // this.emit(maybe dont want to emit here - just add to comms stats?);
            // this.reportError(error.message);
            return;
        }

        // TODO RD
        // // Extract message
        // const msgFrameBase64 = characteristic!.value;
        // //@ts-ignore
        // const rxFrame = RICUtils.atob(msgFrameBase64);

        // // Debug
        // // RICUtils.debug('_onMsgRx from BLE ' + RICUtils.bufferToHex(rxFrame));

        // Handle
        if (msg !== null && this._ricMsgHandler) {

            // Debug
            RICUtils.debug("onMsgRx " + RICUtils.bufferToHex(msg));

            // Handle message
            this._ricMsgHandler.handleNewRxMsg(msg);
        }
    }
}
