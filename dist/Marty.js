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
import axios from 'axios';
import semverEq from 'semver/functions/eq.js';
import semverGt from 'semver/functions/gt.js';
import RICMsgHandler from './RICMsgHandler.js';
import RICFileHandler from './RICFileHandler.js';
import CommsStats from './CommsStats.js';
import RICAddOnManager from './RICAddOnManager.js';
import RICConnManager from './RICConnManager.js';
import { RICFileSendType, RICSystemInfo, RICNameResponse, RICStateInfo, RICOKFail, RICFileList, RICCalibInfo, RICHWElemList, RICAddOnList, RICEvent, } from './RICTypes.js';
import RICUtils from './RICUtils.js';
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICConnector Class
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Marty {
    // Mark: Constructor ---------------------------------------------------------------------------------------
    constructor() {
        // RICUtils.info('Marty connector starting up');
        // Event callbakcs
        this._ricEventListener = null;
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
        this._addOnManager = new RICAddOnManager();
        // Listener for state changes
        this._discoveryListener = null;
        // Progress bar constants
        this._progressAfterDownload = 0.1;
        this._progressAfterUpload = 0.9;
        this._progressAfterRestart = 0.93;
        // Comms stats
        this._commsStats = new CommsStats();
        // Message handler
        this._ricMsgHandler = new RICMsgHandler(this._commsStats, this._addOnManager);
        // File handler
        this._ricFileHandler = new RICFileHandler(this._ricMsgHandler, this._commsStats);
        // Fetch blob function - must be provided as a callback for file transfer
        // (including firmware updates) to work
        this._fetchBlobFn = null;
        // Connection manager
        this._connManager = new RICConnManager(this._ricMsgHandler);
        // Latest data from servos, IMU, etc
        this._ricStateInfo = new RICStateInfo();
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
        // Subscription rate
        this._subscribeRateHz = 10;
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
        this._connManager.onStateChange((connEvent, connEventArgs) => {
            this._onConnStateChange(connEvent, connEventArgs);
        });
        // Message handling in and out
        this._ricMsgHandler.registerForResults(this);
        this._ricMsgHandler.registerMsgSender(this._connManager);
        this._ricFileHandler.registerMsgSender(this._connManager);
    }
    // Callback for RIC events including data
    setEventListener(listener) {
        this._ricEventListener = listener;
    }
    removeEventListener() {
        this._ricEventListener = null;
    }
    // Get event string
    getEventStr(connEvent) {
        return (RICEvent[connEvent]);
    }
    // Set a callback to handle "fetch-blob" requests
    setFetchBlobCallback(fetchBlobFn) {
        this._fetchBlobFn = fetchBlobFn;
    }
    // Set log listener
    setLogListener(listener) {
        RICUtils.setLogListener(listener);
    }
    // Remove log listener
    removeLogListener() {
        RICUtils.setLogListener(null);
    }
    // Set log level
    setLogLevel(logLevel) {
        RICUtils.setLogLevel(logLevel);
    }
    // Mark: Connection -----------------------------------------------------------------------------------------
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    connect(discoveredRIC) {
        return __awaiter(this, void 0, void 0, function* () {
            // Request connection
            const connRslt = yield this._connManager.connect(discoveredRIC);
            if (!connRslt) {
                this._reportConnEvent(RICEvent.CONNECTING_RIC_FAIL, {});
                return false;
            }
            // Open message handler
            this._ricMsgHandler.open();
            // Get system info
            try {
                this._systemInfo = yield this.getRICSystemInfo();
                RICUtils.debug(`eventConnect - RIC Version ${this._systemInfo.SystemVersion}`);
            }
            catch (error) {
                RICUtils.warn('eventConnect - failed to get version ' + error);
            }
            // Get RIC name
            try {
                yield this.getRICName();
            }
            catch (error) {
                RICUtils.warn('eventConnect - failed to get RIC name ' + error);
            }
            // Get calibration info
            try {
                this._calibInfo = yield this.getRICCalibInfo();
            }
            catch (error) {
                RICUtils.warn('eventConnect - failed to get calib info ' + error);
            }
            // Get HWElems (connected to RIC)
            try {
                yield this.getHWElemList();
            }
            catch (error) {
                RICUtils.warn('eventConnect - failed to get HWElems ' + error);
            }
            // Subscribe for updates
            try {
                yield this.subscribeForUpdates(true);
            }
            catch (error) {
                RICUtils.warn(`eventConnect - subscribe for updates failed ${error.toString()}`);
            }
            // RIC verified and connected
            const connEventArgs = {
                systemInfo: this._systemInfo ? this._systemInfo : undefined
            };
            this._reportConnEvent(RICEvent.CONNECTED_RIC, connEventArgs);
            // Debug
            RICUtils.debug(`Connected RIC called ${this._ricFriendlyName}`);
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
        return __awaiter(this, void 0, void 0, function* () {
            // Request disconnection
            yield this._connManager.disconnect();
            this._ricMsgHandler.close();
        });
    }
    // Mark: Robot Control ------------------------------------------------------------------------------------
    /**
     *
     * Robot Control
     * @param arg 'stop', 'stopAfterMove', 'panic', 'pause', 'resume'
     * @returns Promise<boolean> true for success
     *
     */
    robotControl(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._ricMsgHandler.sendRICRESTURL('robot/' + arg, true);
            }
            catch (error) {
                RICUtils.warn('robotControl failed ' + error.toString());
                return new RICOKFail();
            }
        });
    }
    // Mark: Power Control ------------------------------------------------------------------------------------
    /**
     *
     * Power Control
     * @param arg '5von', '5voff', 'off'
     * @returns Promise<boolean> true for success
     *
     */
    powerControl(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._ricMsgHandler.sendRICRESTURL('pwrctrl/' + arg, true);
            }
            catch (error) {
                RICUtils.warn('powerControl failed ' + error.toString());
                return new RICOKFail();
            }
        });
    }
    // Mark: File Run ------------------------------------------------------------------------------------
    /**
     *
     * File Run
     * @param fileName name of file to run including extension (can start 'sd~' or 'spiffs~' to define
     *                 file system location of the file
     * @returns Promise<boolean> true for success
     *
     */
    fileRun(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._ricMsgHandler.sendRICRESTURL('filerun/' + fileName, true);
            }
            catch (error) {
                RICUtils.warn('fileRun failed ' + error.toString());
                return new RICOKFail();
            }
        });
    }
    // Mark: RIC Naming -----------------------------------------------------------------------------------
    /**
     *
     * setRICName
     * @param newName name to refer to RIC - used for BLE advertising
     * @returns Promise<string> (name that has been set)
     *
     */
    setRICName(newName) {
        return __awaiter(this, void 0, void 0, function* () {
            this._reportConnEvent(RICEvent.SET_RIC_NAME_START);
            try {
                const msgRsltJsonObj = yield this._ricMsgHandler.sendRICRESTURL(`friendlyname/${newName}`, true);
                const nameThatHasBeenSet = msgRsltJsonObj.friendlyName;
                this._ricFriendlyName = nameThatHasBeenSet;
                this._ricFriendlyNameIsSet = true;
                this._reportConnEvent(RICEvent.SET_RIC_NAME_SUCCESS, { newName: nameThatHasBeenSet });
                return nameThatHasBeenSet;
            }
            catch (error) {
                this._reportConnEvent(RICEvent.SET_RIC_NAME_FAILED);
                return '';
            }
        });
    }
    /**
     *
     * getRICName
     * @returns Promise<RICNameResponse> (object containing rslt)
     *
     */
    getRICName() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const msgRsltJsonObj = yield this._ricMsgHandler.sendRICRESTURL('friendlyname', true);
                if (msgRsltJsonObj.rslt === 'ok') {
                    this._ricFriendlyName = msgRsltJsonObj.friendlyName;
                    this._ricFriendlyNameIsSet = msgRsltJsonObj.friendlyNameIsSet != 0;
                }
                return msgRsltJsonObj;
            }
            catch (error) {
                return new RICNameResponse();
            }
        });
    }
    // Mark: RIC System Info --------------------------------------------------------------------------------
    /**
     *
     * getRICSystemInfo
     * @returns Promise<RICSystemInfo>
     *
     */
    getRICSystemInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ricSystemInfo = yield this._ricMsgHandler.sendRICRESTURL('v', true);
                RICUtils.debug(`getRICSystemInfo returned ${JSON.stringify(ricSystemInfo)}`);
                return ricSystemInfo;
            }
            catch (error) {
                RICUtils.warn(`getRICSystemInfo Failed to get version ${error.toString()}`);
                return new RICSystemInfo();
            }
        });
    }
    // Mark: RIC Calibration Info --------------------------------------------------------------------------------
    /**
     *
     * getRICCalibInfo
     * @returns Promise<RICCalibInfo>
     *
     */
    getRICCalibInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ricCalibInfo = yield this._ricMsgHandler.sendRICRESTURL('calibrate', true);
                RICUtils.debug(`getRICCalibInfo returned ${JSON.stringify(ricCalibInfo)}`);
                return ricCalibInfo;
            }
            catch (error) {
                RICUtils.warn(`getRICCalibInfo Failed to get version ${error.toString()}`);
                return new RICCalibInfo();
            }
        });
    }
    // Mark: RIC Subscription to Updates --------------------------------------------------------------------------------
    /**
     *
     * subscribeForUpdates
     * @param enable - true to send command to enable subscription (false to remove sub)
     * @returns Promise<void>
     *
     */
    subscribeForUpdates(enable) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscribeDisable = '{"cmdName":"subscription","action":"update",' +
                    '"pubRecs":[' +
                    `{"name":"MultiStatus","rateHz":0,}` +
                    '{"name":"PowerStatus","rateHz":0},' +
                    `{"name":"AddOnStatus","rateHz":0}` +
                    ']}';
                const subscribeEnable = '{"cmdName":"subscription","action":"update",' +
                    '"pubRecs":[' +
                    `{"name":"MultiStatus","rateHz":${this._subscribeRateHz.toString()}}` +
                    `{"name":"PowerStatus","rateHz":1.0},` +
                    `{"name":"AddOnStatus","rateHz":${this._subscribeRateHz.toString()}}` +
                    ']}';
                const ricResp = yield this._ricMsgHandler.sendRICRESTCmdFrame(enable ? subscribeEnable : subscribeDisable, true);
                RICUtils.debug(`subscribe enable/disable returned ${JSON.stringify(ricResp)}`);
            }
            catch (error) {
                RICUtils.warn(`getRICCalibInfo Failed to get version ${error.toString()}`);
            }
        });
    }
    // Mark: Run Trajectory --------------------------------------------------------------------------------
    /**
     *
     * runTrajectory
     * @param trajName name of trajectory
     * @param params parameters (simple name value pairs only) to parameterize trajectory
     * @returns Promise<RICOKFail>
     *
     */
    runTrajectory(trajName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Format the paramList as query string
                const paramEntries = this._objectEntries(params);
                let paramQueryStr = '';
                for (const param of paramEntries) {
                    if (paramQueryStr.length > 0)
                        paramQueryStr += '&';
                    paramQueryStr += param[0] + '=' + param[1];
                }
                // Format the url to send
                let cmdUrl = 'traj/' + trajName;
                if (paramQueryStr.length > 0)
                    cmdUrl += '?' + paramQueryStr;
                return yield this._ricMsgHandler.sendRICRESTURL(cmdUrl, true);
            }
            catch (error) {
                RICUtils.warn('runTrajectory failed' + error.toString());
                return new RICOKFail();
            }
        });
    }
    // Mark: Run API Command -------------------------------------------------------------------------------
    /**
     *
     * runCommand
     * @param restCmdOrJsonCmd command REST API string OR JSON command string
     * @param params parameters (simple name value pairs only) to parameterize command (e.g. trajectory parameters)
     * @returns Promise<RICOKFail>
     *
     */
    runCommand(restCmdOrJsonCmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (restCmdOrJsonCmd == null) {
                return new RICOKFail();
            }
            // Check if this is in JSON format
            if (restCmdOrJsonCmd.startsWith('{')) {
                try {
                    const msgContent = JSON.parse(restCmdOrJsonCmd);
                    if (msgContent.command === 'listFiles') {
                        try {
                            // TODO
                        }
                        catch (error) {
                            return new RICOKFail();
                        }
                    }
                    else if (msgContent.command === 'saveFile') {
                        try {
                            // TODO
                        }
                        catch (error) {
                            return new RICOKFail();
                        }
                    }
                    else if (msgContent.command === 'deleteFile') {
                        try {
                            // TODO
                        }
                        catch (error) {
                            return new RICOKFail();
                        }
                    }
                    else if (msgContent.command === 'loadFile') {
                        try {
                            // TODO
                        }
                        catch (error) {
                            return new RICOKFail();
                        }
                    }
                    else if (msgContent.command === 'playRawSound') {
                        try {
                            const soundData = RICUtils.atob(msgContent.soundData);
                            if (soundData === null)
                                return new RICOKFail();
                            const fsResult = yield this.fileSend("__tmpsnd.raw", RICFileSendType.RIC_NORMAL_FILE, soundData);
                            if (fsResult) {
                                this.fileRun("__tmpsnd.raw");
                            }
                            return new RICOKFail(fsResult);
                        }
                        catch (err) {
                            console.log("Send failed", err);
                        }
                        return new RICOKFail();
                    }
                }
                catch (error) {
                    RICUtils.warn('runCommand failed to parse JSON ' + error.toString());
                    return new RICOKFail();
                }
            }
            else {
                try {
                    // Format the paramList as query string
                    const paramEntries = this._objectEntries(params);
                    let paramQueryStr = '';
                    for (const param of paramEntries) {
                        if (paramQueryStr.length > 0)
                            paramQueryStr += '&';
                        paramQueryStr += param[0] + '=' + param[1];
                    }
                    // Format the url to send
                    if (paramQueryStr.length > 0)
                        restCmdOrJsonCmd += '?' + paramQueryStr;
                    return yield this._ricMsgHandler.sendRICRESTURL(restCmdOrJsonCmd, true);
                }
                catch (error) {
                    RICUtils.warn('runCommand failed' + error.toString());
                    return new RICOKFail();
                }
            }
            return new RICOKFail();
        });
    }
    // Mark: Firmware update of hardware element(s) -----------------------------------------------------------
    /**
     *
     * hwElemFirmwareUpdate - initiate firmware update of one or more HWElems
     * @returns Promise<RICOKFail>
     *
     */
    hwElemFirmwareUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._ricMsgHandler.sendRICRESTURL('hwfwupd', true);
            }
            catch (error) {
                RICUtils.warn('hwElemFirmwareUpdate get status failed' + error.toString());
                return new RICOKFail();
            }
        });
    }
    // Mark: Get HWElem list -----------------------------------------------------------
    /**
     *
     * getHWElemList - get list of HWElems on the robot (including add-ons)
     * @returns Promise<RICHWElemList>
     *
     */
    getHWElemList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ricHWList = yield this._ricMsgHandler.sendRICRESTURL('hwstatus', true);
                RICUtils.debug('getHWElemList returned ' + JSON.stringify(ricHWList));
                this._hwElems = ricHWList.hw;
                this._addOnManager.setHWElems(this._hwElems);
                return ricHWList;
            }
            catch (error) {
                RICUtils.warn('getHWElemList Failed to get list of HWElems' + error.toString());
                return new RICHWElemList();
            }
        });
    }
    // Mark: Set AddOn config -----------------------------------------------------------
    /**
     *
     * setAddOnConfig - set a specified add-on's configuration
     * @param serialNo used to identify the add-on
     * @param newName name to refer to add-on by
     * @returns Promise<RICOKFail>
     *
     */
    setAddOnConfig(serialNo, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const msgRslt = yield this._ricMsgHandler.sendRICRESTURL(`addon/set?SN=${serialNo}&name=${newName}`, true);
                return msgRslt;
            }
            catch (error) {
                return new RICOKFail();
            }
        });
    }
    // Mark: Get AddOn list -----------------------------------------------------------
    /**
     *
     * getAddOnList - get list of add-ons configured on the robot
     * @returns Promise<RICAddOnList>
     *
     */
    getAddOnList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addOnList = yield this._ricMsgHandler.sendRICRESTURL('addon/list', true);
                RICUtils.debug('getAddOnList returned ' + addOnList);
                return addOnList;
            }
            catch (error) {
                RICUtils.warn('getAddOnList Failed to get list of add-ons' + error.toString());
                return new RICAddOnList();
            }
        });
    }
    // Mark: Get file list -----------------------------------------------------------
    /**
     *
     * getFileList - get list of files on file system
     * @returns Promise<RICFileList>
     *
     */
    getFileList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ricFileList = yield this._ricMsgHandler.sendRICRESTURL('filelist', true);
                RICUtils.debug('getFileList returned ' + ricFileList);
                return ricFileList;
            }
            catch (error) {
                RICUtils.warn('getFileList Failed to get file list' + error.toString());
                return new RICFileList();
            }
        });
    }
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
    fileSend(fileName, fileType, fileContents, progressCallback = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._connManager.isConnected()) {
                return false;
            }
            return yield this._ricFileHandler.fileSend(fileName, fileType, fileContents, progressCallback);
        });
    }
    fileSendCancel() {
        return this._ricFileHandler.fileSendCancel();
    }
    // Mark: Calibration -----------------------------------------------------------------------------------------
    calibrate(cmd, joints) {
        return __awaiter(this, void 0, void 0, function* () {
            let overallResult = true;
            if (cmd === 'set') {
                // Make a list of joints to set calibration on
                const jointList = new Array();
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
                // Set calibration
                for (const jnt of jointList) {
                    try {
                        // Set calibration on joint
                        const cmdUrl = 'calibrate/set/' + jnt;
                        const rslt = yield this._ricMsgHandler.sendRICRESTURL(cmdUrl, true);
                        if (rslt.rslt != 'ok')
                            overallResult = false;
                    }
                    catch (error) {
                        RICUtils.warn(`calibrate failed on joint ${jnt}` + error.toString());
                    }
                    // Wait as writing to flash blocks servo access
                    // as of v0.0.113 of firmware, the pause is no longer required
                    //await new Promise(resolve => setTimeout(resolve, 3000));
                }
                // ensure all joints are enabled
                for (const jnt in this._jointNames) {
                    try {
                        // enable joint
                        const cmdUrl = 'servo/' + jnt + '/enable/1';
                        const rslt = yield this._ricMsgHandler.sendRICRESTURL(cmdUrl, true);
                        if (rslt.rslt != 'ok')
                            overallResult = false;
                    }
                    catch (error) {
                        RICUtils.warn(`enable failed on joint ${jnt}` + error.toString());
                    }
                }
                // Result
                RICUtils.info('Set calibration flag to true');
                this._reportConnEvent(RICEvent.SET_CALIBRATION_FLAG);
                const rslt = new RICOKFail();
                rslt.set(overallResult);
                return rslt;
            }
        });
    }
    // Mark: Cached variable access ------------------------------------------------------------------------------------------
    getCachedSystemInfo() {
        return this._systemInfo;
    }
    getCachedHWElemList() {
        return this._hwElems;
    }
    getCachedCalibInfo() {
        return this._calibInfo;
    }
    getCachedRICName() {
        return this._ricFriendlyName;
    }
    getCachedRICNameIsSet() {
        return this._ricFriendlyNameIsSet;
    }
    // Mark: Check firmware versions------------------------------------------------------------------------------------------
    checkForUpdate() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this._lastestVersionInfo = null;
            try {
                const response = yield axios.get('https://updates.robotical.io/marty2/current_version.json');
                this._lastestVersionInfo = response.data;
            }
            catch (error) {
                RICUtils.warn('checkForUpdate failed to get latest from internet');
                this._reportConnEvent(RICEvent.UPDATE_CANT_REACH_SERVER);
            }
            if (this._lastestVersionInfo === null) {
                return false;
            }
            // Get RIC version
            if (!this._connManager.isConnected()) {
                return false;
            }
            try {
                this._systemInfo = yield this.getRICSystemInfo();
                RICUtils.debug(`checkForUpdate RIC Version ${this._systemInfo.SystemVersion}`);
            }
            catch (error) {
                RICUtils.warn('checkForUpdate - failed to get version ' + error);
                return false;
            }
            // Check the version and incomplete previous hw-elem update if needed
            try {
                const updateRequired = yield this._isUpdateRequired(this._lastestVersionInfo, this._systemInfo);
                RICUtils.debug('checkForUpdate systemVersion ' + ((_a = this._systemInfo) === null || _a === void 0 ? void 0 : _a.SystemVersion) +
                    ' available online ' + ((_b = this._lastestVersionInfo) === null || _b === void 0 ? void 0 : _b.main.version) +
                    ' updateRequired ' + updateRequired.toString());
                if (updateRequired) {
                    this._reportConnEvent(RICEvent.UPDATE_IS_AVAILABLE);
                    return true;
                }
                else {
                    this._reportConnEvent(RICEvent.UPDATE_NOT_AVAILABLE);
                    return false;
                }
            }
            catch (error) {
                RICUtils.warn('Failed to get latest version from internet');
                this._reportConnEvent(RICEvent.UPDATE_CANT_REACH_SERVER);
                return false;
            }
        });
    }
    _isUpdateRequired(latestVersion, systemInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            this._updateESPRequired = false;
            this._updateElemsRequired = false;
            if (systemInfo === null) {
                this._reportConnEvent(RICEvent.UPDATE_NOT_AVAILABLE);
                return false;
            }
            // Perform the version check
            this._updateESPRequired = semverGt(latestVersion.main.version, systemInfo.SystemVersion);
            // Test ONLY pretend an update is needed
            if (this.TEST_PRETEND_INITIAL_VERSIONS_DIFFER) {
                this._updateESPRequired = true;
            }
            // Check if a previous hw-elem update didn't complete - but no point if we would update anyway
            if (!this._updateESPRequired) {
                try {
                    const elUpdRslt = yield this._ricMsgHandler.sendRICRESTURL('hwfwupd', true);
                    // Check result
                    this._updateElemsRequired =
                        elUpdRslt.rslt === 'ok' && elUpdRslt.st.i === 1;
                    // Debug
                    if (this._updateElemsRequired) {
                        RICUtils.debug('isUpdateRequired - prev incomplete');
                    }
                    else {
                        RICUtils.debug('isUpdateRequired - prev complete');
                    }
                    // Test ONLY pretend an element update is needed
                    if (this.TEST_PRETEND_ELEM_UPDATE_REQD) {
                        this._updateElemsRequired = true;
                    }
                }
                catch (error) {
                    RICUtils.warn('isUpdateRequired failed to get hw-elem firmware update status');
                }
            }
            else {
                this._updateElemsRequired = true;
            }
            return this._updateESPRequired || this._updateElemsRequired;
        });
    }
    // Mark: Firmware udpate ------------------------------------------------------------------------------------------------
    firmwareUpdate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check valid
            if (this._lastestVersionInfo === null)
                return;
            // Update started
            this._reportConnEvent(RICEvent.UPDATE_STARTED);
            this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                stage: 'Downloading firmware',
                progress: 0
            });
            // Make a list of firmware entities - starting with the hw-elems
            const firmwareList = [...this._lastestVersionInfo.addons];
            // Add the main firware if it is required
            if (this._updateESPRequired) {
                const mainFwInfo = this._lastestVersionInfo.main;
                firmwareList.push(mainFwInfo);
            }
            // Binary data downloaded from the internet
            const firmwareData = new Array();
            // Iterate through the firmware entities
            const numFw = firmwareList.length;
            try {
                for (let fwIdx = 0; fwIdx < firmwareList.length; fwIdx++) {
                    // Download the firmware
                    RICUtils.debug(`Downloading file URI ${firmwareList[fwIdx].firmware}`);
                    let res = null;
                    if (this._fetchBlobFn) {
                        res = yield this._fetchBlobFn({
                            fileCache: true,
                            appendExt: 'bin',
                        }, 'GET', firmwareList[fwIdx].firmware, (received, total) => {
                            // RICUtils.debug(`${received} ${total}`);
                            const currentProgress = ((fwIdx + received / total) / numFw) *
                                this._progressAfterDownload;
                            this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                                stage: 'Downloading firmware',
                                progress: currentProgress
                            });
                        });
                    }
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
                        this._reportConnEvent(RICEvent.UPDATE_FAILED);
                        throw Error('file download res null');
                    }
                }
            }
            catch (error) {
                RICUtils.warn(error);
                this._reportConnEvent(RICEvent.UPDATE_FAILED + error.toString());
                return;
            }
            // Test ONLY truncate the main firmware
            if (this._updateESPRequired && this.TEST_TRUNCATE_ESP_FILE) {
                firmwareData[firmwareData.length - 1] = new Uint8Array(500);
            }
            // Calculate total length of data
            let totalBytes = 0;
            for (const fileData of firmwareData) {
                totalBytes += fileData.length;
            }
            // Debug
            RICUtils.debug(`Got ok ${firmwareData.length} files total ${totalBytes} bytes`);
            // Start uploading
            this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                stage: 'Starting firmware upload',
                progress: this._progressAfterDownload,
            });
            // Upload each file
            try {
                let sentBytes = 0;
                for (let fwIdx = 0; fwIdx < firmwareData.length; fwIdx++) {
                    RICUtils.debug(`Uploading file name ${firmwareList[fwIdx].destname} len ${firmwareData[fwIdx].length}`);
                    yield this.fileSend(firmwareList[fwIdx].destname, firmwareList[fwIdx].elemType === this.FIRMWARE_TYPE_FOR_MAIN_ESP32_FW
                        ? RICFileSendType.RIC_FIRMWARE_UPDATE
                        : RICFileSendType.RIC_NORMAL_FILE, firmwareData[fwIdx], (_, __, progress) => {
                        let percComplete = ((sentBytes + progress * firmwareData[fwIdx].length) /
                            totalBytes) *
                            (this._progressAfterUpload - this._progressAfterDownload) +
                            this._progressAfterDownload;
                        if (percComplete > 1.0)
                            percComplete = 1.0;
                        RICUtils.debug(`progress ${progress.toFixed(2)} sent ${sentBytes} len ${firmwareData[fwIdx].length} ` +
                            `total ${totalBytes} afterDownload ${this._progressAfterDownload} propComplete ${percComplete.toFixed(2)}`);
                        this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                            stage: 'Uploading new firmware\nThis may take a while, please be patient',
                            progress: percComplete,
                        });
                    });
                    sentBytes += firmwareData[fwIdx].length;
                }
            }
            catch (error) {
                RICUtils.warn(error);
                this._reportConnEvent(RICEvent.UPDATE_FAILED);
                return;
            }
            // If we did an ESP32 update
            if (this._updateESPRequired) {
                // Wait for firmware update to complete, restart to occur
                // and BLE reconnection to happen
                for (let i = 0; i < 3; i++) {
                    yield new Promise(resolve => setTimeout(resolve, 5000));
                    const percComplete = this._progressAfterUpload +
                        ((this._progressAfterRestart - this._progressAfterUpload) * i) / 3;
                    this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                        stage: 'Restarting Marty',
                        progress: percComplete,
                    });
                    RICUtils.debug('fwUpdate waiting for reset');
                }
                // Attempt to get status from main ESP32 update
                // The ESP32 will power cycle at this point so we need to wait a while
                let firmwareUpdateConfirmed = false;
                for (let fwUpdateCheckCount = 0; fwUpdateCheckCount < this.FW_UPDATE_CHECKS_BEFORE_ASSUME_FAILED; fwUpdateCheckCount++) {
                    try {
                        // Get version
                        RICUtils.debug('fwUpdate Attempting to get RIC version attempt ' +
                            fwUpdateCheckCount.toString());
                        this._systemInfo = yield this.getRICSystemInfo();
                        RICUtils.debug(`fwUpdate version rslt "${this._systemInfo.rslt}" RIC Version ${this._systemInfo.SystemVersion}`);
                        if (this._systemInfo.rslt !== 'ok') {
                            continue;
                        }
                        // Check version
                        firmwareUpdateConfirmed = semverEq((_a = this._lastestVersionInfo) === null || _a === void 0 ? void 0 : _a.main.version, this._systemInfo.SystemVersion);
                        RICUtils.debug(`fwUpdate got version rslt ${firmwareUpdateConfirmed}`);
                        // Test fiddle to say it worked!
                        if (this.TEST_PRETEND_FINAL_VERSIONS_MATCH) {
                            firmwareUpdateConfirmed = true;
                        }
                        break;
                    }
                    catch (error) {
                        RICUtils.warn('fwUpdate - failed to get version attempt ' +
                            fwUpdateCheckCount.toString() + 'error' + error.toString());
                    }
                }
                // Check if we're confirmed successful
                if (!firmwareUpdateConfirmed) {
                    this._reportConnEvent(RICEvent.UPDATE_FAILED);
                    return;
                }
            }
            // Issue requests for hw-elem firmware updates
            let elemFwIdx = 0;
            let allElemsUpdatedOk = true;
            for (const elemFw of firmwareList) {
                // Update progress
                const percComplete = this._progressAfterRestart +
                    ((1 - this._progressAfterRestart) * elemFwIdx) / firmwareList.length;
                this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                    stage: 'Updating elements',
                    progress: percComplete,
                });
                elemFwIdx++;
                // Check element is not main
                if (elemFw.elemType === this.FIRMWARE_TYPE_FOR_MAIN_ESP32_FW)
                    continue;
                // Non-firmware elemTypes
                if (this.NON_FIRMWARE_ELEM_TYPES.indexOf(elemFw.elemType) !== -1)
                    continue;
                // Start hw-elem update
                const updateCmd = `hwfwupd/${elemFw.elemType}/${elemFw.destname}/all`;
                try {
                    yield this._ricMsgHandler.sendRICRESTURL(updateCmd, true);
                }
                catch (error) {
                    RICUtils.warn('failed to start hw-elem firmware update cmd ' + updateCmd);
                    // Continue with other firmwares
                    continue;
                }
                // Check the status
                for (let updateCheckLoop = 0; updateCheckLoop < this.ELEM_FW_CHECK_LOOPS; updateCheckLoop++) {
                    try {
                        // Wait for process to start on ESP32
                        yield new Promise(resolve => setTimeout(resolve, 5000));
                        // Get result (or status)
                        const elUpdRslt = yield this._ricMsgHandler.sendRICRESTURL('hwfwupd', true);
                        // Check result
                        if (elUpdRslt.rslt === 'ok' &&
                            (elUpdRslt.st.s === 'idle' || elUpdRslt.st.s === 'done')) {
                            RICUtils.debug('fwUpdate hw-elem updated ok - status ' +
                                elUpdRslt.st.s +
                                ' rsltmsg ' +
                                elUpdRslt.st.m);
                            // Check if any update outstanding (incomplete === 0)
                            allElemsUpdatedOk = elUpdRslt.st.i === 0;
                            break;
                        }
                    }
                    catch (error) {
                        RICUtils.warn('failed to get hw-elem firmware update status');
                    }
                }
            }
            // Done update
            this._reportConnEvent(RICEvent.UPDATE_PROGRESS, {
                stage: 'Finished',
                progress: 1,
            });
            if (allElemsUpdatedOk) {
                this._reportConnEvent(RICEvent.UPDATE_SUCCESS_ALL, {
                    systemInfo: this._systemInfo ? this._systemInfo : undefined
                });
            }
            else {
                this._reportConnEvent(RICEvent.UPDATE_SUCCESS_MAIN_ONLY, {
                    systemInfo: this._systemInfo ? this._systemInfo : undefined
                });
            }
        });
    }
    firmwareUpdateCancel() {
        return __awaiter(this, void 0, void 0, function* () {
            this._reportConnEvent(RICEvent.UPDATE_CANCELLING);
            yield this.fileSendCancel();
        });
    }
    // Mark: Connection State Change -----------------------------------------------------------------------------------------
    _onConnStateChange(connEvent, connEventArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connEvent === RICEvent.DISCONNECTED_RIC) {
                const ricName = this._ricFriendlyName ? this._ricFriendlyName : connEventArgs === null || connEventArgs === void 0 ? void 0 : connEventArgs.name;
                this._systemInfo = null;
                this._hwElems = new Array();
                this._addOnManager.clear();
                this._calibInfo = null;
                this._ricFriendlyName = null;
                this._ricFriendlyNameIsSet = false;
                RICUtils.debug(`Disconnected ${ricName}`);
                this._reportConnEvent(connEvent, connEventArgs);
            }
            else if (connEvent === RICEvent.CONNECTED_RIC) {
                this._reportConnEvent(RICEvent.CONNECTED_TRANSPORT_LAYER, connEventArgs);
                // Debug
                RICUtils.debug('ConnectedTransportLayer ' + (connEventArgs === null || connEventArgs === void 0 ? void 0 : connEventArgs.name));
            }
            else {
                this._reportConnEvent(connEvent, connEventArgs);
            }
        });
    }
    // Mark: Message handling -----------------------------------------------------------------------------------------
    onRxReply(msgHandle, msgRsltCode, msgRsltJsonObj) {
        RICUtils.debug(`onRxReply msgHandle ${msgHandle} rsltCode ${msgRsltCode} obj ${JSON.stringify(msgRsltJsonObj)} `);
    }
    onRxUnnumberedMsg(msgRsltJsonObj) {
        // RICUtils.debug(
        //   `onRxUnnumberedMsg rsltCode obj ${ JSON.stringify(msgRsltJsonObj) } `,
        // );
        // Inform the file handler
        if ('okto' in msgRsltJsonObj) {
            this._ricFileHandler.onOktoMsg(msgRsltJsonObj.okto);
        }
    }
    // Mark: Comms stats -----------------------------------------------------------------------------------------
    // Get comms stats
    getCommsStats() {
        return this._commsStats;
    }
    // Mark: Published data handling -----------------------------------------------------------------------------------------
    onRxSmartServo(smartServos) {
        var _a;
        // RICUtils.debug(`onRxSmartServo ${ JSON.stringify(smartServos) } `);
        this._ricStateInfo.smartServos = smartServos;
        this._ricStateInfo.smartServosValidMs = Date.now();
        (_a = this._ricEventListener) === null || _a === void 0 ? void 0 : _a.onRxSmartServo(smartServos);
    }
    onRxIMU(imuData) {
        var _a;
        // RICUtils.debug(`onRxIMU ${ JSON.stringify(imuData) } `);
        this._ricStateInfo.imuData = imuData;
        this._ricStateInfo.imuDataValidMs = Date.now();
        (_a = this._ricEventListener) === null || _a === void 0 ? void 0 : _a.onRxIMU(imuData);
    }
    onRxPowerStatus(powerStatus) {
        var _a;
        // RICUtils.debug(`onRxPowerStatus ${ JSON.stringify(powerStatus) } `);
        this._ricStateInfo.power = powerStatus;
        this._ricStateInfo.powerValidMs = Date.now();
        (_a = this._ricEventListener) === null || _a === void 0 ? void 0 : _a.onRxPowerStatus(powerStatus);
    }
    onRxAddOnPub(addOnInfo) {
        var _a;
        // RICUtils.debug(`onRxAddOnPub ${ JSON.stringify(addOnInfo) } `);
        this._ricStateInfo.addOnInfo = addOnInfo;
        this._ricStateInfo.addOnInfoValidMs = Date.now();
        (_a = this._ricEventListener) === null || _a === void 0 ? void 0 : _a.onRxAddOnPub(addOnInfo);
    }
    getRICStateInfo() {
        return this._ricStateInfo;
    }
    _objectEntries(obj) {
        if (!obj) {
            return [];
        }
        var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    }
    ;
    _reportConnEvent(connEvent, connEventArgs) {
        var _a;
        (_a = this._ricEventListener) === null || _a === void 0 ? void 0 : _a.onConnEvent(connEvent, connEventArgs);
    }
}
