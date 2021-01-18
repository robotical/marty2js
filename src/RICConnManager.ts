// import RICConnMgrBLE from "./RICConnMgrBLE";
import RICConnMgrWS from "./RICConnMgrWS.js";
import RICMsgHandler from "./RICMsgHandler.js";
import { DiscoveredRIC, RICConnEventFn, RICIFType } from "./RICTypes.js";

export default class RICConnManager {

    // TODO BLE connection
    // _connMgrBLE: RICConnMgrBLE = null;

    // Websocket connection
    _connMgrWS: RICConnMgrWS | null = null;

    // Interface that is in use
    _interfaceInUse: RICIFType = RICIFType.RIC_INTERFACE_WIFI;

    constructor(msgHandler: RICMsgHandler) {

        // TODO Construct BLE connection manager
        // this._connMgrBLE = new RICConnMgrBLE(msgHandler);

        // Construct WS connection manager
        this._connMgrWS = new RICConnMgrWS(msgHandler);
    }

    onStateChange(listener: RICConnEventFn): void {
        // TODO BLE
        // this._connMgrBLE.onStateChange(listener);
        this._connMgrWS?.onStateChange(listener);
    }

    async connect(discoveredRIC: DiscoveredRIC): Promise<boolean> {
        // TODO - may want to check if already connected to different interface
        //           and decide what to do in that case ...
        this._interfaceInUse = discoveredRIC._interface;
        if (discoveredRIC._interface === RICIFType.RIC_INTERFACE_BLE) {
            // TODO handle BLE
            // if (this._connMgrBLE) {
            //     await this._connMgrBLE.connect(discoveredRIC);
            // }
        } else {
            if (this._connMgrWS) {
                return await this._connMgrWS?.connect(discoveredRIC);
            }
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
        // TODO handle BLE
        if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
            // await this._connMgrBLE.disconnect();
        } else {
            await this._connMgrWS?.disconnect();
        }
    }

    async isConnected(): Promise<boolean> {
        // TODO handle BLE
        if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
            // if (this._connMgrBLE) {
            //     return await this._connMgrBLE.getIsConnected();
            // }
        } else {
            if (this._connMgrWS) {
                return await this._connMgrWS.getIsConnected();
            }
        }
        return false;
    }

    async sendTxMsg(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
            // TODO handle BLE
            // return this._connMgrBLE?.sendTxMsg(msg, sendWithResponse);
        } else {
            return await this._connMgrWS?.sendTxMsg(msg, sendWithResponse);
        }
    }

    async sendTxMsgNoAwait(msg: Uint8Array, sendWithResponse: boolean): Promise<void> {
        if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
            // TODO handle BLE
            // return this._connMgrBLE?.sendTxMsg(msg, sendWithResponse);
        } else {
            return await this._connMgrWS?.sendTxMsgNoAwait(msg, sendWithResponse);
        }
    }
}
