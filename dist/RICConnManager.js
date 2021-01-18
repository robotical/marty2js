"use strict";
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
// TODO RD
// import RICConnMgrBLE from "./RICConnMgrBLE";
var RICConnMgrWS_js_1 = __importDefault(require("./RICConnMgrWS.js"));
var RICConnManager = /** @class */ (function () {
    function RICConnManager(msgHandler) {
        // Construct BLE connection manager
        // TODO RD
        // this._connMgrBLE = new RICConnMgrBLE(msgHandler);
        // BLE connection
        // TODO RD
        // _connMgrBLE: RICConnMgrBLE = null;
        // Websocket connection
        this._connMgrWS = null;
        // Construct WS connection manager
        this._connMgrWS = new RICConnMgrWS_js_1.default(msgHandler);
    }
    RICConnManager.prototype.onStateChange = function (listener) {
        var _a;
        // TODO RD
        // this._connMgrBLE.onStateChange(listener);
        (_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.onStateChange(listener);
    };
    RICConnManager.prototype.connect = function (discoveredRIC) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._connMgrWS) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._connMgrWS.connect(discoveredRIC)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, false];
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
    RICConnManager.prototype.disconnect = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // TODO RD
                    // await this._connMgrBLE.disconnect();
                    return [4 /*yield*/, ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.disconnect())];
                    case 1:
                        // TODO RD
                        // await this._connMgrBLE.disconnect();
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RICConnManager.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._connMgrWS) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._connMgrWS.getIsConnected()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    RICConnManager.prototype.sendTxMsg = function (msg, sendWithResponse) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.getIsConnected())];
                    case 1:
                        // Check any connected
                        if (_c.sent()) {
                            return [2 /*return*/, (_b = this._connMgrWS) === null || _b === void 0 ? void 0 : _b.sendTxMsg(msg, sendWithResponse)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RICConnManager.prototype.sendTxMsgNoAwait = function (msg, sendWithResponse) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ((_a = this._connMgrWS) === null || _a === void 0 ? void 0 : _a.getIsConnected())];
                    case 1:
                        // Check any connected
                        if (_c.sent()) {
                            return [2 /*return*/, (_b = this._connMgrWS) === null || _b === void 0 ? void 0 : _b.sendTxMsg(msg, sendWithResponse)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return RICConnManager;
}());
exports.default = RICConnManager;
