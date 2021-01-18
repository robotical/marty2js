// TODO RD
// import RICConnMgrBLE from "./RICConnMgrBLE";
import RICConnMgrWS from "./RICConnMgrWS.js";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventListener } from "./RICTypes.js";

export default class RICConnManager {

    // BLE connection
    // TODO RD
    // _connMgrBLE: RICConnMgrBLE = null;

    // Websocket connection
    _connMgrWS: RICConnMgrWS | null = null;

    constructor(msgHandler: RICMsgHandler) {

        // Construct BLE connection manager
        // TODO RD
        // this._connMgrBLE = new RICConnMgrBLE(msgHandler);

        // Construct WS connection manager
        this._connMgrWS = new RICConnMgrWS(msgHandler);
    }

    onStateChange(listener: RICConnEventListener): void {
        // TODO RD
        // this._connMgrBLE.onStateChange(listener);
        this._connMgrWS?.onStateChange(listener);
    }

    async connect(discoveredRIC: DiscoveredRIC): Promise<boolean> {
        // TODO RD - handle different connection types
        // await this._connMgrBLE.connect(discoveredRIC);
        if (this._connMgrWS) {
            return await this._connMgrWS.connect(discoveredRIC);
        }
        return false;
    }

    /**
   * Disconnect from RIC
   *
   * @returns None
   *
   */
    async disconnect(): Promise<void> {
        // TODO RD
        // await this._connMgrBLE.disconnect();
        await this._connMgrWS?.disconnect();
    }

    async isConnected(): Promise<boolean> {
        // TODO RD
        // if (this._connMgrBLE.getIsConnected())
        //     return true;
        if (this._connMgrWS) {
            return await this._connMgrWS.getIsConnected();
        }
        return false;
    }

    async sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // Check any connected
        if (await this._connMgrWS?.getIsConnected()) {
            return this._connMgrWS?.sendTxMsg(msg, sendWithResponse);
        }
        // TODO RD
    }

    async sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        // Check any connected
        if (await this._connMgrWS?.getIsConnected()) {
            return this._connMgrWS?.sendTxMsg(msg, sendWithResponse);
        }
        // TODO RD
    }
}
