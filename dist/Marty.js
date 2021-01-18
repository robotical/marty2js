"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Marty2JS
// Communications Connector for Marty V2
//
// Marty V2
// (C) Rob Dobson & Robotical 2020
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var eq_js_1 = __importDefault(require("semver/functions/eq.js"));
var gt_js_1 = __importDefault(require("semver/functions/gt.js"));
var RICMsgHandler_js_1 = __importDefault(require("./RICMsgHandler.js"));
var RICFileHandler_js_1 = __importDefault(require("./RICFileHandler.js"));
var CommsStats_js_1 = __importDefault(require("./CommsStats.js"));
var RICAddOnManager_js_1 = __importDefault(require("./RICAddOnManager.js"));
var RICConnManager_js_1 = __importDefault(require("./RICConnManager.js"));
var RICTypes_js_1 = require("./RICTypes.js");
var RICUtils_js_1 = __importDefault(require("./RICUtils.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICConnector Class
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Marty = /** @class */ (function () {
    // Mark: Constructor ---------------------------------------------------------------------------------------
    function Marty() {
        // RICUtils.debug('Starting up');
        var _this = this;
        // Event callbakcs
        this._connEventListener = null;
        // System info
        this._systemInfo = null;
        // Update info
        this._lastestVersionInfo = null;
        this._updateESPRequired = false;
        this._updateElemsRequired = false;
        // RIC friendly name
        this._ricFriendlyName = null;
        this._ricFriendlyNameIsSet = false;
        // Calibration info
        this._calibInfo = null;
        // HWElems (connected to RIC)
        this._hwElems = new Array();
        // Add-on Manager
        this._addOnManager = new RICAddOnManager_js_1.default();
        // Listener for state changes
        this._discoveryListener = null;
        // Connection
        this._connSubscrOnRx = null;
        this._connSubscrOnDisconnect = null;
        this._connSubscrOnStateChange = null;
        // Progress bar
        this._progressAfterDownload = 0.1;
        this._progressAfterUpload = 0.9;
        this._progressAfterRestart = 0.93;
        // Comms stats
        this._commsStats = new CommsStats_js_1.default();
        // Message handler
        this._ricMsgHandler = new RICMsgHandler_js_1.default(this._commsStats, this._addOnManager);
        // File handler
        this._ricFileHandler = new RICFileHandler_js_1.default(this._ricMsgHandler, this._commsStats);
        // Fetch blob function - must be provided as a callback for file transfer
        // (including firmware updates) to work
        this._fetchBlobFn = null;
        // Connection manager
        this._connManager = new RICConnManager_js_1.default(this._ricMsgHandler);
        // Latest data from servos, IMU, etc
        this._ricStateInfo = new RICTypes_js_1.RICStateInfo();
        // Joint names
        this._jointNames = {
            LeftHip: 'LeftHip',
            LeftTwist: 'LeftTwist',
            LeftKnee: 'LeftKnee',
            RightHip: 'RightHip',
            RightTwist: 'RightTwist',
            RightKnee: 'RightKnee',
            LeftArm: 'LeftArm',
            RightArm: 'RightArm',
            Eyes: 'Eyes',
        };
        // FW update
        this.FW_UPDATE_CHECKS_BEFORE_ASSUME_FAILED = 10;
        this.FIRMWARE_TYPE_FOR_MAIN_ESP32_FW = 'main';
        this.NON_FIRMWARE_ELEM_TYPES = ['sound', 'traj'];
        this.ELEM_FW_CHECK_LOOPS = 36;
        // TESTS - set to true for testing OTA updates ONLY
        this.TEST_TRUNCATE_ESP_FILE = false;
        this.TEST_PRETEND_ELEM_UPDATE_REQD = false;
        this.TEST_PRETEND_INITIAL_VERSIONS_DIFFER = false;
        this.TEST_PRETEND_FINAL_VERSIONS_MATCH = false;
        // Subscribe to connection state changes
        this._connManager.onStateChange(function (connEvent, connEventArgs) {
            _this._onConnStateChange(connEvent, connEventArgs);
        });
        // Message handling in and out
        this._ricMsgHandler.registerForResults(this);
        this._ricMsgHandler.registerMsgSender(this._connManager);
        this._ricFileHandler.registerMsgSender(this._connManager);
    }
    // Callback for connection events
    Marty.prototype.setConnEventListener = function (listener) {
        this._connEventListener = listener;
    };
    Marty.prototype.removeConnEventListener = function () {
        this._connEventListener = null;
    };
    // Set a callback to handle "fetch-blob" requests
    Marty.prototype.setFetchBlobCallback = function (fetchBlobFn) {
        this._fetchBlobFn = fetchBlobFn;
    };
    // Mark: Connection -----------------------------------------------------------------------------------------
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    Marty.prototype.connect = function (discoveredRIC) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._connManager.connect(discoveredRIC)];
                    case 1: 
                    // Request connection
                    return [2 /*return*/, _a.sent()];
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
    Marty.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Request disconnection
                    return [4 /*yield*/, this._connManager.disconnect()];
                    case 1:
                        // Request disconnection
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Robot Control ------------------------------------------------------------------------------------
    /**
     *
     * Robot Control
     * @param arg 'stop', 'stopAfterMove', 'panic', 'pause', 'resume'
     * @returns Promise<boolean> true for success
     *
     */
    Marty.prototype.robotControl = function (arg) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('robot/' + arg, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        RICUtils_js_1.default.debug('robotControl failed ' + error_1.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Power Control ------------------------------------------------------------------------------------
    /**
     *
     * Power Control
     * @param arg '5von', '5voff', 'off'
     * @returns Promise<boolean> true for success
     *
     */
    Marty.prototype.powerControl = function (arg) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('pwrctrl/' + arg, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        RICUtils_js_1.default.debug('powerControl failed ' + error_2.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: File Run ------------------------------------------------------------------------------------
    /**
     *
     * File Run
     * @param fileName name of file to run including extension (can start 'sd~' or 'spiffs~' to define
     *                 file system location of the file
     * @returns Promise<boolean> true for success
     *
     */
    Marty.prototype.fileRun = function (fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('filerun/' + fileName, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        RICUtils_js_1.default.debug('fileRun failed ' + error_3.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: RIC Naming -----------------------------------------------------------------------------------
    /**
     *
     * setRICName
     * @param newName name to refer to RIC - used for BLE advertising
     * @returns Promise<string> (name that has been set)
     *
     */
    Marty.prototype.setRICName = function (newName) {
        return __awaiter(this, void 0, void 0, function () {
            var msgRsltJsonObj, nameThatHasBeenSet, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._reportConnEvent(RICTypes_js_1.RICEvent.SET_RIC_NAME_START);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL("friendlyname/" + newName, true)];
                    case 2:
                        msgRsltJsonObj = _a.sent();
                        nameThatHasBeenSet = msgRsltJsonObj.friendlyName;
                        this._ricFriendlyName = nameThatHasBeenSet;
                        this._ricFriendlyNameIsSet = true;
                        this._reportConnEvent(RICTypes_js_1.RICEvent.SET_RIC_NAME_SUCCESS, { newName: nameThatHasBeenSet });
                        return [2 /*return*/, nameThatHasBeenSet];
                    case 3:
                        error_4 = _a.sent();
                        this._reportConnEvent(RICTypes_js_1.RICEvent.SET_RIC_NAME_FAILED);
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * getRICName
     * @returns Promise<RICNameResponse> (object containing rslt)
     *
     */
    Marty.prototype.getRICName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var msgRsltJsonObj, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('friendlyname', true)];
                    case 1:
                        msgRsltJsonObj = _a.sent();
                        if (msgRsltJsonObj.rslt === 'ok') {
                            this._ricFriendlyName = msgRsltJsonObj.friendlyName;
                            this._ricFriendlyNameIsSet = msgRsltJsonObj.friendlyNameIsSet != 0;
                        }
                        return [2 /*return*/, msgRsltJsonObj];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, new RICTypes_js_1.RICNameResponse()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: RIC System Info --------------------------------------------------------------------------------
    /**
     *
     * getRICSystemInfo
     * @returns Promise<RICSystemInfo>
     *
     */
    Marty.prototype.getRICSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ricSystemInfo, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('v', true)];
                    case 1:
                        ricSystemInfo = _a.sent();
                        RICUtils_js_1.default.debug('getRICSystemInfo returned ' + ricSystemInfo);
                        return [2 /*return*/, ricSystemInfo];
                    case 2:
                        error_6 = _a.sent();
                        RICUtils_js_1.default.debug('getRICSystemInfo Failed to get version' + error_6.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICSystemInfo()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: RIC Calibration Info --------------------------------------------------------------------------------
    /**
     *
     * getRICCalibInfo
     * @returns Promise<RICCalibInfo>
     *
     */
    Marty.prototype.getRICCalibInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ricCalibInfo, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('calibrate', true)];
                    case 1:
                        ricCalibInfo = _a.sent();
                        RICUtils_js_1.default.debug('getRICCalibInfo returned ' + ricCalibInfo);
                        return [2 /*return*/, ricCalibInfo];
                    case 2:
                        error_7 = _a.sent();
                        RICUtils_js_1.default.debug('getRICCalibInfo Failed to get version' + error_7.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICCalibInfo()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Run Trajectory --------------------------------------------------------------------------------
    /**
     *
     * runTrajectory
     * @param trajName name of trajectory
     * @param params parameters (simple name value pairs only) to parameterize trajectory
     * @returns Promise<RICOKFail>
     *
     */
    Marty.prototype.runTrajectory = function (trajName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var paramEntries, paramQueryStr, paramEntries_1, paramEntries_1_1, param, cmdUrl, error_8;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        paramEntries = this._objectEntries(params);
                        paramQueryStr = '';
                        try {
                            for (paramEntries_1 = __values(paramEntries), paramEntries_1_1 = paramEntries_1.next(); !paramEntries_1_1.done; paramEntries_1_1 = paramEntries_1.next()) {
                                param = paramEntries_1_1.value;
                                if (paramQueryStr.length > 0)
                                    paramQueryStr += '&';
                                paramQueryStr += param[0] + '=' + param[1];
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (paramEntries_1_1 && !paramEntries_1_1.done && (_a = paramEntries_1.return)) _a.call(paramEntries_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        cmdUrl = 'traj/' + trajName;
                        if (paramQueryStr.length > 0)
                            cmdUrl += '?' + paramQueryStr;
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL(cmdUrl, true)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        error_8 = _b.sent();
                        RICUtils_js_1.default.debug('runTrajectory failed' + error_8.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Run API Command -------------------------------------------------------------------------------
    /**
     *
     * runTrajectory
     * @param commandName command API string
     * @param params parameters (simple name value pairs only) to parameterize trajectory
     * @returns Promise<RICOKFail>
     *
     */
    Marty.prototype.runCommand = function (commandName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var paramEntries, paramQueryStr, paramEntries_2, paramEntries_2_1, param, error_9;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        paramEntries = this._objectEntries(params);
                        paramQueryStr = '';
                        try {
                            for (paramEntries_2 = __values(paramEntries), paramEntries_2_1 = paramEntries_2.next(); !paramEntries_2_1.done; paramEntries_2_1 = paramEntries_2.next()) {
                                param = paramEntries_2_1.value;
                                if (paramQueryStr.length > 0)
                                    paramQueryStr += '&';
                                paramQueryStr += param[0] + '=' + param[1];
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (paramEntries_2_1 && !paramEntries_2_1.done && (_a = paramEntries_2.return)) _a.call(paramEntries_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        // Format the url to send
                        if (paramQueryStr.length > 0)
                            commandName += '?' + paramQueryStr;
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL(commandName, true)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        error_9 = _b.sent();
                        RICUtils_js_1.default.debug('runCommand failed' + error_9.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Firmware update of hardware element(s) -----------------------------------------------------------
    /**
     *
     * hwElemFirmwareUpdate - initiate firmware update of one or more HWElems
     * @returns Promise<RICOKFail>
     *
     */
    Marty.prototype.hwElemFirmwareUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('hwfwupd', true)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_10 = _a.sent();
                        RICUtils_js_1.default.debug('hwElemFirmwareUpdate get status failed' + error_10.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Get HWElem list -----------------------------------------------------------
    /**
     *
     * getHWElemList - get list of HWElems on the robot (including add-ons)
     * @returns Promise<RICHWElemList>
     *
     */
    Marty.prototype.getHWElemList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ricHWList, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('hwstatus', true)];
                    case 1:
                        ricHWList = _a.sent();
                        RICUtils_js_1.default.debug('getHWElemList returned ' + JSON.stringify(ricHWList));
                        this._hwElems = ricHWList.hw;
                        this._addOnManager.setHWElems(this._hwElems);
                        return [2 /*return*/, ricHWList];
                    case 2:
                        error_11 = _a.sent();
                        RICUtils_js_1.default.debug('getHWElemList Failed to get list of HWElems' + error_11.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICHWElemList()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Set AddOn config -----------------------------------------------------------
    /**
     *
     * setAddOnConfig - set a specified add-on's configuration
     * @param serialNo used to identify the add-on
     * @param newName name to refer to add-on by
     * @returns Promise<RICOKFail>
     *
     */
    Marty.prototype.setAddOnConfig = function (serialNo, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var msgRslt, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL("addon/set?SN=" + serialNo + "&name=" + newName, true)];
                    case 1:
                        msgRslt = _a.sent();
                        return [2 /*return*/, msgRslt];
                    case 2:
                        error_12 = _a.sent();
                        return [2 /*return*/, new RICTypes_js_1.RICOKFail()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Get AddOn list -----------------------------------------------------------
    /**
     *
     * getAddOnList - get list of add-ons configured on the robot
     * @returns Promise<RICAddOnList>
     *
     */
    Marty.prototype.getAddOnList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var addOnList, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('addon/list', true)];
                    case 1:
                        addOnList = _a.sent();
                        RICUtils_js_1.default.debug('getAddOnList returned ' + addOnList);
                        return [2 /*return*/, addOnList];
                    case 2:
                        error_13 = _a.sent();
                        RICUtils_js_1.default.debug('getAddOnList Failed to get list of add-ons' + error_13.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICAddOnList()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Get file list -----------------------------------------------------------
    /**
     *
     * getFileList - get list of files on file system
     * @returns Promise<RICFileList>
     *
     */
    Marty.prototype.getFileList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ricFileList, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('filelist', true)];
                    case 1:
                        ricFileList = _a.sent();
                        RICUtils_js_1.default.debug('getFileList returned ' + ricFileList);
                        return [2 /*return*/, ricFileList];
                    case 2:
                        error_14 = _a.sent();
                        RICUtils_js_1.default.debug('getFileList Failed to get file list' + error_14.toString());
                        return [2 /*return*/, new RICTypes_js_1.RICFileList()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: File Transfer ------------------------------------------------------------------------------------
    /**
     *
     * fileSend - start file transfer
     * @param fileName name of file to send
     * @param fileType normal file or firmware
     * @param fileContents contenst of the file (binary object)
     * @returns Promise<boolean>
     *
     */
    Marty.prototype.fileSend = function (fileName, fileType, fileContents, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._connManager.isConnected()) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this._ricFileHandler.fileSend(fileName, fileType, fileContents, progressCallback)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Marty.prototype.fileSendCancel = function () {
        return this._ricFileHandler.fileSendCancel();
    };
    // Mark: Calibration -----------------------------------------------------------------------------------------
    Marty.prototype.calibrate = function (cmd, joints) {
        return __awaiter(this, void 0, void 0, function () {
            var overallResult, jointList, jointList_1, jointList_1_1, jnt, cmdUrl, rslt_1, error_15, e_3_1, _a, _b, _i, jnt, cmdUrl, rslt_2, error_16, rslt;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        overallResult = true;
                        if (!(cmd === 'set')) return [3 /*break*/, 17];
                        jointList = new Array();
                        if (joints === 'legs') {
                            jointList.push(this._jointNames.LeftHip);
                            jointList.push(this._jointNames.LeftTwist);
                            jointList.push(this._jointNames.LeftKnee);
                            jointList.push(this._jointNames.RightHip);
                            jointList.push(this._jointNames.RightTwist);
                            jointList.push(this._jointNames.RightKnee);
                        }
                        else if (joints === 'arms') {
                            jointList.push(this._jointNames.LeftArm);
                            jointList.push(this._jointNames.RightArm);
                        }
                        if (joints === 'eyes') {
                            jointList.push(this._jointNames.Eyes);
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        jointList_1 = __values(jointList), jointList_1_1 = jointList_1.next();
                        _d.label = 2;
                    case 2:
                        if (!!jointList_1_1.done) return [3 /*break*/, 7];
                        jnt = jointList_1_1.value;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        cmdUrl = 'calibrate/set/' + jnt;
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL(cmdUrl, true)];
                    case 4:
                        rslt_1 = _d.sent();
                        if (rslt_1.rslt != 'ok')
                            overallResult = false;
                        return [3 /*break*/, 6];
                    case 5:
                        error_15 = _d.sent();
                        RICUtils_js_1.default.debug("calibrate failed on joint " + jnt + error_15.toString());
                        return [3 /*break*/, 6];
                    case 6:
                        jointList_1_1 = jointList_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (jointList_1_1 && !jointList_1_1.done && (_c = jointList_1.return)) _c.call(jointList_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        _a = [];
                        for (_b in this._jointNames)
                            _a.push(_b);
                        _i = 0;
                        _d.label = 11;
                    case 11:
                        if (!(_i < _a.length)) return [3 /*break*/, 16];
                        jnt = _a[_i];
                        _d.label = 12;
                    case 12:
                        _d.trys.push([12, 14, , 15]);
                        cmdUrl = 'servo/' + jnt + '/enable/1';
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL(cmdUrl, true)];
                    case 13:
                        rslt_2 = _d.sent();
                        if (rslt_2.rslt != 'ok')
                            overallResult = false;
                        return [3 /*break*/, 15];
                    case 14:
                        error_16 = _d.sent();
                        RICUtils_js_1.default.debug("enable failed on joint " + jnt + error_16.toString());
                        return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 11];
                    case 16:
                        // Result
                        RICUtils_js_1.default.debug('Set calibration flag to true');
                        this._reportConnEvent(RICTypes_js_1.RICEvent.SET_CALIBRATION_FLAG);
                        rslt = new RICTypes_js_1.RICOKFail();
                        rslt.set(overallResult);
                        return [2 /*return*/, rslt];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Cached variable access ------------------------------------------------------------------------------------------
    Marty.prototype.getCachedSystemInfo = function () {
        return this._systemInfo;
    };
    Marty.prototype.getCachedHWElemList = function () {
        return this._hwElems;
    };
    Marty.prototype.getCachedCalibInfo = function () {
        return this._calibInfo;
    };
    Marty.prototype.getCachedRICName = function () {
        return this._ricFriendlyName;
    };
    Marty.prototype.getCachedRICNameIsSet = function () {
        return this._ricFriendlyNameIsSet;
    };
    // Mark: Check firmware versions------------------------------------------------------------------------------------------
    Marty.prototype.checkForUpdate = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var response, error_17, _c, error_18, updateRequired, error_19;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this._lastestVersionInfo = null;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get('https://updates.robotical.io/marty2/current_version.json')];
                    case 2:
                        response = _d.sent();
                        this._lastestVersionInfo = response.data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_17 = _d.sent();
                        RICUtils_js_1.default.debug('checkForUpdate failed to get latest from internet');
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_CANT_REACH_SERVER);
                        return [3 /*break*/, 4];
                    case 4:
                        if (this._lastestVersionInfo === null)
                            return [2 /*return*/];
                        // Get RIC version
                        if (!this._connManager.isConnected())
                            return [2 /*return*/];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        _c = this;
                        return [4 /*yield*/, this.getRICSystemInfo()];
                    case 6:
                        _c._systemInfo = _d.sent();
                        RICUtils_js_1.default.debug("checkForUpdate RIC Version " + this._systemInfo.SystemVersion);
                        return [3 /*break*/, 8];
                    case 7:
                        error_18 = _d.sent();
                        RICUtils_js_1.default.debug('checkForUpdate - failed to get version ' + error_18);
                        return [2 /*return*/];
                    case 8:
                        _d.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this._isUpdateRequired(this._lastestVersionInfo, this._systemInfo)];
                    case 9:
                        updateRequired = _d.sent();
                        RICUtils_js_1.default.debug('checkForUpdate systemVersion ' + ((_a = this._systemInfo) === null || _a === void 0 ? void 0 : _a.SystemVersion) +
                            ' available online ' + ((_b = this._lastestVersionInfo) === null || _b === void 0 ? void 0 : _b.main.version) +
                            ' updateRequired ' + updateRequired.toString());
                        if (updateRequired) {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_IS_AVAILABLE);
                        }
                        else {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_NOT_AVAILABLE);
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        error_19 = _d.sent();
                        RICUtils_js_1.default.debug('Failed to get latest version from internet');
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_CANT_REACH_SERVER);
                        return [2 /*return*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Marty.prototype._isUpdateRequired = function (latestVersion, systemInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var elUpdRslt, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._updateESPRequired = false;
                        this._updateElemsRequired = false;
                        if (systemInfo === null) {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_NOT_AVAILABLE);
                            return [2 /*return*/, false];
                        }
                        // Perform the version check
                        this._updateESPRequired = gt_js_1.default(latestVersion.main.version, systemInfo.SystemVersion);
                        // Test ONLY pretend an update is needed
                        if (this.TEST_PRETEND_INITIAL_VERSIONS_DIFFER) {
                            this._updateESPRequired = true;
                        }
                        if (!!this._updateESPRequired) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('hwfwupd', true)];
                    case 2:
                        elUpdRslt = _a.sent();
                        // Check result
                        this._updateElemsRequired =
                            elUpdRslt.rslt === 'ok' && elUpdRslt.st.i === 1;
                        // Debug
                        if (this._updateElemsRequired) {
                            RICUtils_js_1.default.debug('isUpdateRequired - prev incomplete');
                        }
                        else {
                            RICUtils_js_1.default.debug('isUpdateRequired - prev complete');
                        }
                        // Test ONLY pretend an element update is needed
                        if (this.TEST_PRETEND_ELEM_UPDATE_REQD) {
                            this._updateElemsRequired = true;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_20 = _a.sent();
                        RICUtils_js_1.default.debug('isUpdateRequired failed to get hw-elem firmware update status');
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        this._updateElemsRequired = true;
                        _a.label = 6;
                    case 6: return [2 /*return*/, this._updateESPRequired || this._updateElemsRequired];
                }
            });
        });
    };
    // Mark: Firmware udpate ------------------------------------------------------------------------------------------------
    Marty.prototype.firmwareUpdate = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var firmwareList, mainFwInfo, firmwareData, numFw, _loop_1, this_1, fwIdx, error_21, totalBytes, firmwareData_1, firmwareData_1_1, fileData, sentBytes_1, _loop_2, this_2, fwIdx, error_22, i, percComplete, firmwareUpdateConfirmed, fwUpdateCheckCount, _b, error_23, elemFwIdx, allElemsUpdatedOk, firmwareList_1, firmwareList_1_1, elemFw, percComplete, updateCmd, error_24, updateCheckLoop, elUpdRslt, error_25, e_4_1;
            var e_5, _c, e_4, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Check valid
                        if (this._lastestVersionInfo === null)
                            return [2 /*return*/];
                        // Update started
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_STARTED);
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                            stage: 'Downloading firmware',
                            progress: 0
                        });
                        firmwareList = __spread(this._lastestVersionInfo.addons);
                        // Add the main firware if it is required
                        if (this._updateESPRequired) {
                            mainFwInfo = this._lastestVersionInfo.main;
                            firmwareList.push(mainFwInfo);
                        }
                        firmwareData = new Array();
                        numFw = firmwareList.length;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, , 7]);
                        _loop_1 = function (fwIdx) {
                            var res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // Download the firmware
                                        RICUtils_js_1.default.debug("Downloading file URI " + firmwareList[fwIdx].firmware);
                                        res = null;
                                        if (!this_1._fetchBlobFn) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this_1._fetchBlobFn({
                                                fileCache: true,
                                                appendExt: 'bin',
                                            }, 'GET', firmwareList[fwIdx].firmware, function (received, total) {
                                                // RICUtils.debug(`${received} ${total}`);
                                                var currentProgress = ((fwIdx + received / total) / numFw) *
                                                    _this._progressAfterDownload;
                                                _this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                                                    stage: 'Downloading firmware',
                                                    progress: currentProgress
                                                });
                                            })];
                                    case 1:
                                        res = _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        // const res = await RNFetchBlob.config({
                                        //     fileCache: true,
                                        //     appendExt: 'bin',
                                        // })
                                        //     .fetch('GET', firmwareList[fwIdx].firmware)
                                        //     .progress((received: number, total: number) => {
                                        //         // RICUtils.debug(`${received} ${total}`);
                                        //         const currentProgress =
                                        //             ((fwIdx + received / total) / numFw) *
                                        //             this._progressAfterDownload;
                                        //         this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                                        //             stage: 'Downloading firmware',
                                        //             progress: currentProgress,
                                        //         });
                                        //     });
                                        // const base64Enc = await res.base64();
                                        // const fileBytes = RICUtils.atob(base64Enc);
                                        if (res) {
                                            if (res.fileBytes) {
                                                firmwareData.push(res.fileBytes);
                                            }
                                            else {
                                                throw Error('failed to get file data');
                                            }
                                            // clean up file
                                            res.flush();
                                        }
                                        else {
                                            this_1._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_FAILED);
                                            throw Error('file download res null');
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        fwIdx = 0;
                        _e.label = 2;
                    case 2:
                        if (!(fwIdx < firmwareList.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(fwIdx)];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        fwIdx++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_21 = _e.sent();
                        RICUtils_js_1.default.debug(error_21);
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_FAILED + error_21.toString());
                        return [2 /*return*/];
                    case 7:
                        // Test ONLY truncate the main firmware
                        if (this._updateESPRequired && this.TEST_TRUNCATE_ESP_FILE) {
                            firmwareData[firmwareData.length - 1] = new Uint8Array(500);
                        }
                        totalBytes = 0;
                        try {
                            for (firmwareData_1 = __values(firmwareData), firmwareData_1_1 = firmwareData_1.next(); !firmwareData_1_1.done; firmwareData_1_1 = firmwareData_1.next()) {
                                fileData = firmwareData_1_1.value;
                                totalBytes += fileData.length;
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (firmwareData_1_1 && !firmwareData_1_1.done && (_c = firmwareData_1.return)) _c.call(firmwareData_1);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        // Debug
                        RICUtils_js_1.default.debug("Got ok " + firmwareData.length + " files total " + totalBytes + " bytes");
                        // Start uploading
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                            stage: 'Starting firmware upload',
                            progress: this._progressAfterDownload,
                        });
                        _e.label = 8;
                    case 8:
                        _e.trys.push([8, 13, , 14]);
                        sentBytes_1 = 0;
                        _loop_2 = function (fwIdx) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        RICUtils_js_1.default.debug("Uploading file name " + firmwareList[fwIdx].destname + " len " + firmwareData[fwIdx].length);
                                        return [4 /*yield*/, this_2.fileSend(firmwareList[fwIdx].destname, firmwareList[fwIdx].elemType === this_2.FIRMWARE_TYPE_FOR_MAIN_ESP32_FW
                                                ? RICTypes_js_1.RICFileSendType.RIC_FIRMWARE_UPDATE
                                                : RICTypes_js_1.RICFileSendType.RIC_NORMAL_FILE, firmwareData[fwIdx], function (_, __, progress) {
                                                var percComplete = ((sentBytes_1 + progress * firmwareData[fwIdx].length) /
                                                    totalBytes) *
                                                    (_this._progressAfterUpload - _this._progressAfterDownload) +
                                                    _this._progressAfterDownload;
                                                if (percComplete > 1.0)
                                                    percComplete = 1.0;
                                                RICUtils_js_1.default.debug("progress " + progress.toFixed(2) + " sent " + sentBytes_1 + " len " + firmwareData[fwIdx].length + " " +
                                                    ("total " + totalBytes + " afterDownload " + _this._progressAfterDownload + " propComplete " + percComplete.toFixed(2)));
                                                _this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                                                    stage: 'Uploading new firmware\nThis may take a while, please be patient',
                                                    progress: percComplete,
                                                });
                                            })];
                                    case 1:
                                        _a.sent();
                                        sentBytes_1 += firmwareData[fwIdx].length;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        fwIdx = 0;
                        _e.label = 9;
                    case 9:
                        if (!(fwIdx < firmwareData.length)) return [3 /*break*/, 12];
                        return [5 /*yield**/, _loop_2(fwIdx)];
                    case 10:
                        _e.sent();
                        _e.label = 11;
                    case 11:
                        fwIdx++;
                        return [3 /*break*/, 9];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_22 = _e.sent();
                        RICUtils_js_1.default.debug(error_22);
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_FAILED);
                        return [2 /*return*/];
                    case 14:
                        if (!this._updateESPRequired) return [3 /*break*/, 25];
                        i = 0;
                        _e.label = 15;
                    case 15:
                        if (!(i < 3)) return [3 /*break*/, 18];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                    case 16:
                        _e.sent();
                        percComplete = this._progressAfterUpload +
                            ((this._progressAfterRestart - this._progressAfterUpload) * i) / 3;
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                            stage: 'Restarting Marty',
                            progress: percComplete,
                        });
                        RICUtils_js_1.default.debug('fwUpdate waiting for reset');
                        _e.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 15];
                    case 18:
                        firmwareUpdateConfirmed = false;
                        fwUpdateCheckCount = 0;
                        _e.label = 19;
                    case 19:
                        if (!(fwUpdateCheckCount < this.FW_UPDATE_CHECKS_BEFORE_ASSUME_FAILED)) return [3 /*break*/, 24];
                        _e.label = 20;
                    case 20:
                        _e.trys.push([20, 22, , 23]);
                        // Get version
                        RICUtils_js_1.default.debug('fwUpdate Attempting to get RIC version attempt ' +
                            fwUpdateCheckCount.toString());
                        _b = this;
                        return [4 /*yield*/, this.getRICSystemInfo()];
                    case 21:
                        _b._systemInfo = _e.sent();
                        RICUtils_js_1.default.debug("fwUpdate version rslt \"" + this._systemInfo.rslt + "\" RIC Version " + this._systemInfo.SystemVersion);
                        if (this._systemInfo.rslt !== 'ok') {
                            return [3 /*break*/, 23];
                        }
                        // Check version
                        firmwareUpdateConfirmed = eq_js_1.default((_a = this._lastestVersionInfo) === null || _a === void 0 ? void 0 : _a.main.version, this._systemInfo.SystemVersion);
                        RICUtils_js_1.default.debug("fwUpdate got version rslt " + firmwareUpdateConfirmed);
                        // Test fiddle to say it worked!
                        if (this.TEST_PRETEND_FINAL_VERSIONS_MATCH) {
                            firmwareUpdateConfirmed = true;
                        }
                        return [3 /*break*/, 24];
                    case 22:
                        error_23 = _e.sent();
                        RICUtils_js_1.default.debug('fwUpdate - failed to get version attempt ' +
                            fwUpdateCheckCount.toString() + 'error' + error_23.toString());
                        return [3 /*break*/, 23];
                    case 23:
                        fwUpdateCheckCount++;
                        return [3 /*break*/, 19];
                    case 24:
                        // Check if we're confirmed successful
                        if (!firmwareUpdateConfirmed) {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_FAILED);
                            return [2 /*return*/];
                        }
                        _e.label = 25;
                    case 25:
                        elemFwIdx = 0;
                        allElemsUpdatedOk = true;
                        _e.label = 26;
                    case 26:
                        _e.trys.push([26, 40, 41, 42]);
                        firmwareList_1 = __values(firmwareList), firmwareList_1_1 = firmwareList_1.next();
                        _e.label = 27;
                    case 27:
                        if (!!firmwareList_1_1.done) return [3 /*break*/, 39];
                        elemFw = firmwareList_1_1.value;
                        percComplete = this._progressAfterRestart +
                            ((1 - this._progressAfterRestart) * elemFwIdx) / firmwareList.length;
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                            stage: 'Updating elements',
                            progress: percComplete,
                        });
                        elemFwIdx++;
                        // Check element is not main
                        if (elemFw.elemType === this.FIRMWARE_TYPE_FOR_MAIN_ESP32_FW)
                            return [3 /*break*/, 38];
                        // Non-firmware elemTypes
                        if (this.NON_FIRMWARE_ELEM_TYPES.indexOf(elemFw.elemType) !== -1)
                            return [3 /*break*/, 38];
                        updateCmd = "hwfwupd/" + elemFw.elemType + "/" + elemFw.destname + "/all";
                        _e.label = 28;
                    case 28:
                        _e.trys.push([28, 30, , 31]);
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL(updateCmd, true)];
                    case 29:
                        _e.sent();
                        return [3 /*break*/, 31];
                    case 30:
                        error_24 = _e.sent();
                        RICUtils_js_1.default.debug('failed to start hw-elem firmware update cmd ' + updateCmd);
                        // Continue with other firmwares
                        return [3 /*break*/, 38];
                    case 31:
                        updateCheckLoop = 0;
                        _e.label = 32;
                    case 32:
                        if (!(updateCheckLoop < this.ELEM_FW_CHECK_LOOPS)) return [3 /*break*/, 38];
                        _e.label = 33;
                    case 33:
                        _e.trys.push([33, 36, , 37]);
                        // Wait for process to start on ESP32
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                    case 34:
                        // Wait for process to start on ESP32
                        _e.sent();
                        return [4 /*yield*/, this._ricMsgHandler.sendRICRESTURL('hwfwupd', true)];
                    case 35:
                        elUpdRslt = _e.sent();
                        // Check result
                        if (elUpdRslt.rslt === 'ok' &&
                            (elUpdRslt.st.s === 'idle' || elUpdRslt.st.s === 'done')) {
                            RICUtils_js_1.default.debug('fwUpdate hw-elem updated ok - status ' +
                                elUpdRslt.st.s +
                                ' rsltmsg ' +
                                elUpdRslt.st.m);
                            // Check if any update outstanding (incomplete === 0)
                            allElemsUpdatedOk = elUpdRslt.st.i === 0;
                            return [3 /*break*/, 38];
                        }
                        return [3 /*break*/, 37];
                    case 36:
                        error_25 = _e.sent();
                        RICUtils_js_1.default.debug('failed to get hw-elem firmware update status');
                        return [3 /*break*/, 37];
                    case 37:
                        updateCheckLoop++;
                        return [3 /*break*/, 32];
                    case 38:
                        firmwareList_1_1 = firmwareList_1.next();
                        return [3 /*break*/, 27];
                    case 39: return [3 /*break*/, 42];
                    case 40:
                        e_4_1 = _e.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 42];
                    case 41:
                        try {
                            if (firmwareList_1_1 && !firmwareList_1_1.done && (_d = firmwareList_1.return)) _d.call(firmwareList_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 42:
                        // Done update
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_PROGRESS, {
                            stage: 'Finished',
                            progress: 1,
                        });
                        if (allElemsUpdatedOk) {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_SUCCESS_ALL, {
                                systemInfo: this._systemInfo ? this._systemInfo : undefined
                            });
                        }
                        else {
                            this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_SUCCESS_MAIN_ONLY, {
                                systemInfo: this._systemInfo ? this._systemInfo : undefined
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Marty.prototype.firmwareUpdateCancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._reportConnEvent(RICTypes_js_1.RICEvent.UPDATE_CANCELLING);
                        return [4 /*yield*/, this.fileSendCancel()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Connection State Change -----------------------------------------------------------------------------------------
    Marty.prototype._onConnStateChange = function (connEvent, connEventArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_26, error_27, _b, error_28, error_29;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(connEvent === RICTypes_js_1.RICEvent.DISCONNECTED_RIC)) return [3 /*break*/, 1];
                        this._systemInfo = null;
                        this._hwElems = new Array();
                        this._addOnManager.clear();
                        this._calibInfo = null;
                        this._ricFriendlyName = null;
                        this._ricFriendlyNameIsSet = false;
                        RICUtils_js_1.default.debug('Disconnected ' + (connEventArgs === null || connEventArgs === void 0 ? void 0 : connEventArgs.name));
                        return [3 /*break*/, 15];
                    case 1:
                        if (!(connEvent === RICTypes_js_1.RICEvent.CONNECTED_RIC)) return [3 /*break*/, 15];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        _a = this;
                        return [4 /*yield*/, this.getRICSystemInfo()];
                    case 3:
                        _a._systemInfo = _c.sent();
                        RICUtils_js_1.default.debug("verificationStop - RIC Version " + this._systemInfo.SystemVersion);
                        return [3 /*break*/, 5];
                    case 4:
                        error_26 = _c.sent();
                        RICUtils_js_1.default.debug('verificationStop - failed to get version ' + error_26);
                        return [3 /*break*/, 5];
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.getRICName()];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_27 = _c.sent();
                        RICUtils_js_1.default.debug('verificationStop - failed to get RIC name ' + error_27);
                        return [3 /*break*/, 8];
                    case 8:
                        _c.trys.push([8, 10, , 11]);
                        _b = this;
                        return [4 /*yield*/, this.getRICCalibInfo()];
                    case 9:
                        _b._calibInfo = _c.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_28 = _c.sent();
                        RICUtils_js_1.default.debug('verificationStop - failed to get calib info ' + error_28);
                        return [3 /*break*/, 11];
                    case 11:
                        _c.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, this.getHWElemList()];
                    case 12:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_29 = _c.sent();
                        RICUtils_js_1.default.debug('verificationStop - failed to get HWElems ' + error_29);
                        return [3 /*break*/, 14];
                    case 14:
                        // RIC verified and connected
                        if (this._systemInfo) {
                            if (connEventArgs) {
                                connEventArgs.systemInfo = this._systemInfo;
                            }
                            else {
                                connEventArgs = {
                                    systemInfo: this._systemInfo
                                };
                            }
                        }
                        this._reportConnEvent(connEvent, connEventArgs);
                        // Debug
                        RICUtils_js_1.default.debug('Connected ' + (connEventArgs === null || connEventArgs === void 0 ? void 0 : connEventArgs.name));
                        _c.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    // Mark: Message handling -----------------------------------------------------------------------------------------
    Marty.prototype.onRxReply = function (msgHandle, msgRsltCode, msgRsltJsonObj) {
        RICUtils_js_1.default.debug("onRxReply msgHandle " + msgHandle + " rsltCode " + msgRsltCode + " obj " + JSON.stringify(msgRsltJsonObj) + " ");
    };
    Marty.prototype.onRxUnnumberedMsg = function (msgRsltJsonObj) {
        // RICUtils.debug(
        //   `onRxUnnumberedMsg rsltCode obj ${ JSON.stringify(msgRsltJsonObj) } `,
        // );
        // Inform the file handler
        if ('okto' in msgRsltJsonObj) {
            this._ricFileHandler.onOktoMsg(msgRsltJsonObj.okto);
        }
    };
    // Mark: Comms stats -----------------------------------------------------------------------------------------
    // Get comms stats
    Marty.prototype.getCommsStats = function () {
        return this._commsStats;
    };
    // Mark: Published data handling -----------------------------------------------------------------------------------------
    Marty.prototype.onRxSmartServo = function (smartServos) {
        // RICUtils.debug(`onRxSmartServo ${ JSON.stringify(smartServos) } `);
        this._ricStateInfo.smartServos = smartServos;
        this._ricStateInfo.smartServosValidMs = Date.now();
    };
    Marty.prototype.onRxIMU = function (imuData) {
        // RICUtils.debug(`onRxIMU ${ JSON.stringify(imuData) } `);
        this._ricStateInfo.imuData = imuData;
        this._ricStateInfo.imuDataValidMs = Date.now();
    };
    Marty.prototype.onRxPowerStatus = function (powerStatus) {
        // RICUtils.debug(`onRxPowerStatus ${ JSON.stringify(powerStatus) } `);
        this._ricStateInfo.power = powerStatus;
        this._ricStateInfo.powerValidMs = Date.now();
    };
    Marty.prototype.onRxAddOnPub = function (addOnInfo) {
        // RICUtils.debug(`onRxAddOnPub ${ JSON.stringify(addOnInfo) } `);
        this._ricStateInfo.addOnInfo = addOnInfo;
        this._ricStateInfo.addOnInfoValidMs = Date.now();
    };
    Marty.prototype.getRICStateInfo = function () {
        return this._ricStateInfo;
    };
    Marty.prototype._objectEntries = function (obj) {
        var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    };
    ;
    Marty.prototype._reportConnEvent = function (connEvent, connEventArgs) {
        if (this._connEventListener)
            this._connEventListener(connEvent, connEventArgs);
    };
    return Marty;
}());
exports.Marty = Marty;
