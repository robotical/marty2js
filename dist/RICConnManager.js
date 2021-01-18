var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import RICConnMgrBLE from "./RICConnMgrBLE";
import RICConnMgrWS from "./RICConnMgrWS.js";
import { RICIFType } from "./RICTypes.js";
export default class RICConnManager {
    constructor(msgHandler) {
        // TODO Construct BLE connection manager
        // this._connMgrBLE = new RICConnMgrBLE(msgHandler);
        // TODO BLE connection
        // _connMgrBLE: RICConnMgrBLE = null;
        // Websocket connection
        this._connMgrWS = null;
        // Interface that is in use
        this._interfaceInUse = RICIFType.RIC_INTERFACE_WIFI;
        // Construct WS connection manager
        this._connMgrWS = new RICConnMgrWS(msgHandler);
    }
    onStateChange(listener) {
        var _a;
        // TODO BLE
        // this._connMgrBLE.onStateChange(listener);
        (_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.onStateChange(listener);
    }
    connect(discoveredRIC) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // TODO - may want to check if already connected to different interface
            //           and decide what to do in that case ...
            this._interfaceInUse = discoveredRIC._interface;
            if (discoveredRIC._interface === RICIFType.RIC_INTERFACE_BLE) {
                // TODO handle BLE
                // if (this._connMgrBLE) {
                //     await this._connMgrBLE.connect(discoveredRIC);
                // }
            }
            else {
                if (this._connMgrWS) {
                    return yield ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.connect(discoveredRIC));
                }
            }
            return false;
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
            // TODO handle BLE
            if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
                // await this._connMgrBLE.disconnect();
            }
            else {
                yield ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.disconnect());
            }
        });
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO handle BLE
            if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
                // if (this._connMgrBLE) {
                //     return await this._connMgrBLE.getIsConnected();
                // }
            }
            else {
                if (this._connMgrWS) {
                    return yield this._connMgrWS.getIsConnected();
                }
            }
            return false;
        });
    }
    sendTxMsg(msg, sendWithResponse) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
                // TODO handle BLE
                // return this._connMgrBLE?.sendTxMsg(msg, sendWithResponse);
            }
            else {
                return yield ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.sendTxMsg(msg, sendWithResponse));
            }
        });
    }
    sendTxMsgNoAwait(msg, sendWithResponse) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._interfaceInUse === RICIFType.RIC_INTERFACE_BLE) {
                // TODO handle BLE
                // return this._connMgrBLE?.sendTxMsg(msg, sendWithResponse);
            }
            else {
                return yield ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.sendTxMsgNoAwait(msg, sendWithResponse));
            }
        });
    }
}
