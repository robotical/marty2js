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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import WebSocket from "isomorphic-ws";
import { RICEvent, RICIFType } from "./RICTypes.js";
import RICUtils from "./RICUtils.js";
export default class RICConnMgrWS {
    /**
     * Constructor
     *
     * @param msgHandler: RICMsgHandler - must implement send functions
     *
     */
    constructor(msgHandler) {
        // RIC msg handler
        this._ricMsgHandler = null;
        // Callback to RICConnManager
        this._onStateChangeListener = null;
        // RIC to connect to
        this._ricToConnectTo = null;
        // Websocket we are connected to
        this._webSocket = null;
        // Is connected
        this._webSocketIsConnected = false;
        this._ricMsgHandler = msgHandler;
    }
    /**
     * Attach a listener (callback) to report state changes
     *
     * @param listener: (ifType: RICIFType, stateChangeStr: string, args: RICConnEventArgs | null) => void
     *
     */
    onStateChange(listener) {
        this._onStateChangeListener = listener;
    }
    /**
     * Get WS connection status
     *
     * @returns boolean (true if connected)
     *
     */
    getIsConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._webSocketIsConnected;
        });
    }
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    connect(discoveredRIC) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("RICConnMgrWS: " + discoveredRIC.ipAddress);
            if (this._onStateChangeListener) {
                this._onStateChangeListener(RICEvent.CONNECTING_RIC, {
                    ipAddress: discoveredRIC.ipAddress,
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
            }
            // Remember RIC info
            this._ricToConnectTo = discoveredRIC;
            // Connect
            const connOk = yield this._performDeviceConnection();
            // Check if ok
            if (!connOk) {
                // Inform of failure
                if (this._onStateChangeListener) {
                    this._onStateChangeListener(RICEvent.CONNECTING_RIC_FAIL, {
                        ipAddress: discoveredRIC.ipAddress,
                        ifType: RICIFType.RIC_INTERFACE_WIFI,
                    });
                    return false;
                }
            }
            // Inform of success
            if (this._onStateChangeListener) {
                this._onStateChangeListener(RICEvent.CONNECTED_RIC, {
                    ipAddress: discoveredRIC.ipAddress,
                    name: this._ricToConnectTo.name,
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
            }
            return true;
        });
    }
    /**
    * Disconnect from RIC
    *
    * @returns None
    *
    */
    disconnect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Discard connect info
            this._ricToConnectTo = null;
            // Disconnect websocket
            (_a = this._webSocket) === null || _a === void 0 ? void 0 : _a.close();
            // Report disconnection
            if (this._onStateChangeListener !== null) {
                this._onStateChangeListener(RICEvent.DISCONNECTED_RIC, {
                    ifType: RICIFType.RIC_INTERFACE_WIFI,
                });
            }
        });
    }
    _performDeviceConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check there is a RIC to connect to
            if (this._ricToConnectTo === null) {
                return false;
            }
            // Check already connected
            if (yield this.getIsConnected()) {
                return true;
            }
            // Form websocket address
            const wsURL = "ws://" + this._ricToConnectTo._hostnameOrIPAddress + "/ws";
            // Connect to websocket
            try {
                this._webSocket = yield this.webSocketOpen(wsURL);
            }
            catch (error) {
                RICUtils.debug(`Unable to create WebSocket ${error.toString()}`);
                return false;
            }
            this._webSocket.onmessage = (evt) => {
                // RICUtils.debug("WebSocket rx");
                if (evt.data instanceof ArrayBuffer) {
                    const msg = new Uint8Array(evt.data);
                    this._onMsgRx(msg);
                }
            };
            this._webSocket.onclose = (evt) => {
                RICUtils.debug('Websocket connection closed ' + evt.toString());
                this._webSocket = null;
                this._webSocketIsConnected = false;
            };
            // Ok
            return true;
        });
    }
    webSocketOpen(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // Debug
                // RICUtils.debug('Attempting WebSocket connection');
                // Open the socket
                try {
                    const webSocket = new WebSocket(url);
                    // Open socket
                    webSocket.binaryType = "arraybuffer";
                    webSocket.onopen = (evt) => {
                        RICUtils.debug('WebSocket connection opened ' + evt.toString());
                        // // We're connected
                        this._webSocketIsConnected = true;
                        resolve(webSocket);
                    };
                    webSocket.onerror = function (evt) {
                        RICUtils.warn('Websocket error: ' + evt.toString());
                        reject(evt);
                    };
                }
                catch (error) {
                    RICUtils.warn('Websocket open failed: ' + error.toString());
                    reject(error);
                }
            });
        });
    }
    // @ts-ignore unused parameter (it is used for BLE comms)
    sendTxMsg(msg, sendWithResponse) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check connected
            if (!this._webSocketIsConnected)
                return;
            // Debug
            // RICUtils.debug("sendTxMsg " + msg.toString() + " sendWithResp " + sendWithResponse.toString());
            // Send over websocket
            yield ((_a = this._webSocket) === null || _a === void 0 ? void 0 : _a.send(msg));
        });
    }
    // @ts-ignore unused parameter (it is used for BLE comms)
    sendTxMsgNoAwait(msg, sendWithResponse) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check connected
            if (!this._webSocketIsConnected)
                return;
            // Debug
            // RICUtils.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());
            // Send over websocket
            (_a = this._webSocket) === null || _a === void 0 ? void 0 : _a.send(msg);
        });
    }
    _onMsgRx(msg) {
        // Debug
        // RICUtils.debug('_onMsgRx ' + RICUtils.bufferToHex(msg));
        // Handle message
        if (msg !== null && this._ricMsgHandler) {
            this._ricMsgHandler.handleNewRxMsg(msg);
        }
    }
}
