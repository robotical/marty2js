"use strict";
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
var RICTypes_js_1 = require("./RICTypes.js");
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
var RICConnMgrWS = /** @class */ (function () {
    /**
     * Constructor
     *
     * @param msgHandler: RICMsgHandler - must implement send functions
     *
     */
    function RICConnMgrWS(msgHandler) {
        // RIC msg handler
        this._ricMsgHandler = null;
        // Callback to RICConnManager
        this._onStateChangeListener = null;
        // RIC to connect to
        this._ricToConnectTo = null;
        // Websocket we are connected to
        this._webSocket = null;
        // Is connected
        this._isConnected = false;
        this._ricMsgHandler = msgHandler;
    }
    /**
     * Attach a listener (callback) to report state changes
     *
     * @param listener: (ifType: RICIFType, stateChangeStr: string, args: RICConnEventArgs | null) => void
     *
     */
    RICConnMgrWS.prototype.onStateChange = function (listener) {
        this._onStateChangeListener = listener;
    };
    /**
     * Get WS connection status
     *
     * @returns boolean (true if connected)
     *
     */
    RICConnMgrWS.prototype.getIsConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._isConnected];
            });
        });
    };
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    RICConnMgrWS.prototype.connect = function (discoveredRIC) {
        return __awaiter(this, void 0, void 0, function () {
            var connOk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Now connecting
                        if (this._onStateChangeListener) {
                            this._onStateChangeListener(RICTypes_js_1.RICEvent.CONNECTING_RIC, {
                                url: discoveredRIC.url,
                                ifType: RICTypes_js_1.RICIFType.RIC_INTERFACE_WIFI,
                            });
                        }
                        // Remember RIC info
                        this._ricToConnectTo = discoveredRIC;
                        return [4 /*yield*/, this._performDeviceConnection()];
                    case 1:
                        connOk = _a.sent();
                        // Check if ok
                        if (!connOk) {
                            // Inform of failure
                            if (this._onStateChangeListener) {
                                this._onStateChangeListener(RICTypes_js_1.RICEvent.CONNECTING_RIC_FAIL, {
                                    url: discoveredRIC.url,
                                    ifType: RICTypes_js_1.RICIFType.RIC_INTERFACE_WIFI,
                                });
                                return [2 /*return*/, false];
                            }
                        }
                        // Inform of success
                        if (this._onStateChangeListener) {
                            this._onStateChangeListener(RICTypes_js_1.RICEvent.CONNECTED_RIC, {
                                url: this._ricToConnectTo.url,
                                name: this._ricToConnectTo.name,
                                ifType: RICTypes_js_1.RICIFType.RIC_INTERFACE_WIFI,
                            });
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
    * Disconnect from RIC
    *
    * @returns None
    *
    */
    RICConnMgrWS.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Discard connect info
                this._ricToConnectTo = null;
                // Report disconnection
                if (this._onStateChangeListener !== null) {
                    this._onStateChangeListener(RICTypes_js_1.RICEvent.DISCONNECTED_RIC, {
                        ifType: RICTypes_js_1.RICIFType.RIC_INTERFACE_WIFI,
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    RICConnMgrWS.prototype._performDeviceConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check there is a RIC to connect to
                        if (this._ricToConnectTo === null) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.getIsConnected()];
                    case 1:
                        // Check already connected
                        if (_a.sent()) {
                            return [2 /*return*/, true];
                        }
                        // Connect to websocket
                        this._webSocket = new isomorphic_ws_1.default(this._ricToConnectTo.url);
                        if (!this._webSocket) {
                            RICUtils_js_1.default.debug("Unable to create WebSocket");
                            return [2 /*return*/, false];
                        }
                        // Debug
                        RICUtils_js_1.default.debug('Attempting WebSocket connection');
                        // Open socket
                        this._webSocket.binaryType = "arraybuffer";
                        this._webSocket.onopen = function (evt) {
                            RICUtils_js_1.default.debug('WebSocket connection opened ' + evt.toString());
                        };
                        this._webSocket.onmessage = function (evt) {
                            RICUtils_js_1.default.debug("WebSocket rx");
                            if (evt.data instanceof ArrayBuffer) {
                                var msg = new Uint8Array(evt.data);
                                _this._onMsgRx(msg, null);
                            }
                        };
                        this._webSocket.onclose = function (evt) {
                            RICUtils_js_1.default.debug('Websocket connection closed ' + evt.toString());
                            _this._webSocket = null;
                        };
                        this._webSocket.onerror = function (evt) {
                            RICUtils_js_1.default.debug('Websocket error: ' + evt);
                        };
                        // // We're connected
                        // this._isConnected = true;
                        // Ok
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RICConnMgrWS.prototype.sendTxMsg = function (msg, sendWithResponse) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO RD
                RICUtils_js_1.default.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());
                return [2 /*return*/];
            });
        });
    };
    RICConnMgrWS.prototype.sendTxMsgNoAwait = function (msg, sendWithResponse) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO RD
                RICUtils_js_1.default.debug("sendTxMsgNoAwait " + msg.toString() + " sendWithResp " + sendWithResponse.toString());
                return [2 /*return*/];
            });
        });
    };
    RICConnMgrWS.prototype._onMsgRx = function (msg, error) {
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
            RICUtils_js_1.default.debug("onMsgRx " + RICUtils_js_1.default.bufferToHex(msg));
            // Handle message
            this._ricMsgHandler.handleNewRxMsg(msg);
        }
    };
    return RICConnMgrWS;
}());
exports.default = RICConnMgrWS;
