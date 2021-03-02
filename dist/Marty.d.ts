import RICMsgHandler, { MessageResultCode } from './RICMsgHandler.js';
import RICFileHandler from './RICFileHandler.js';
import CommsStats from './CommsStats.js';
import RICAddOnManager from './RICAddOnManager.js';
import RICConnManager from './RICConnManager.js';
import { ROSSerialSmartServos, ROSSerialIMU, ROSSerialPowerStatus, ROSSerialAddOnStatusList } from './RICROSSerial.js';
import { RICDiscoveryListener, DiscoveredRIC, RICFileSendType, RICSystemInfo, RICNameResponse, RICStateInfo, RICUpdateInfo, RICOKFail, RICFileList, RICCalibInfo, RICHWElemList, RICAddOnList, RICHWElem, RICConnEventArgs, RICEvent, RICCmdParams, RICFetchBlobFnType, RICEventIF } from './RICTypes.js';
export declare class Marty {
    _ricEventListener: RICEventIF | null;
    _systemInfo: RICSystemInfo | null;
    _lastestVersionInfo: RICUpdateInfo | null;
    _updateESPRequired: boolean;
    _updateElemsRequired: boolean;
    _ricFriendlyName: string | null;
    _ricFriendlyNameIsSet: boolean;
    _calibInfo: RICCalibInfo | null;
    _hwElems: Array<RICHWElem>;
    _addOnManager: RICAddOnManager;
    _discoveryListener: RICDiscoveryListener | null;
    _progressAfterDownload: number;
    _progressAfterUpload: number;
    _progressAfterRestart: number;
    _commsStats: CommsStats;
    _ricMsgHandler: RICMsgHandler;
    _ricFileHandler: RICFileHandler;
    _fetchBlobFn: RICFetchBlobFnType | null;
    _connManager: RICConnManager;
    _ricStateInfo: RICStateInfo;
    _jointNames: {
        LeftHip: string;
        LeftTwist: string;
        LeftKnee: string;
        RightHip: string;
        RightTwist: string;
        RightKnee: string;
        LeftArm: string;
        RightArm: string;
        Eyes: string;
    };
    _subscribeRateHz: number;
    FW_UPDATE_CHECKS_BEFORE_ASSUME_FAILED: number;
    FIRMWARE_TYPE_FOR_MAIN_ESP32_FW: string;
    NON_FIRMWARE_ELEM_TYPES: string[];
    ELEM_FW_CHECK_LOOPS: number;
    TEST_TRUNCATE_ESP_FILE: boolean;
    TEST_PRETEND_ELEM_UPDATE_REQD: boolean;
    TEST_PRETEND_INITIAL_VERSIONS_DIFFER: boolean;
    TEST_PRETEND_FINAL_VERSIONS_MATCH: boolean;
    constructor();
    setEventListener(listener: RICEventIF): void;
    removeEventListener(): void;
    setFetchBlobCallback(fetchBlobFn: RICFetchBlobFnType): void;
    /**
     * Connect to a RIC
     *
     * @returns None
     *
     */
    connect(discoveredRIC: DiscoveredRIC): Promise<boolean>;
    /**
     * Disconnect from RIC
     *
     * @returns None
     *
     */
    disconnect(): Promise<void>;
    /**
     *
     * Robot Control
     * @param arg 'stop', 'stopAfterMove', 'panic', 'pause', 'resume'
     * @returns Promise<boolean> true for success
     *
     */
    robotControl(arg: string): Promise<RICOKFail>;
    /**
     *
     * Power Control
     * @param arg '5von', '5voff', 'off'
     * @returns Promise<boolean> true for success
     *
     */
    powerControl(arg: string): Promise<RICOKFail>;
    /**
     *
     * File Run
     * @param fileName name of file to run including extension (can start 'sd~' or 'spiffs~' to define
     *                 file system location of the file
     * @returns Promise<boolean> true for success
     *
     */
    fileRun(fileName: string): Promise<RICOKFail>;
    /**
     *
     * setRICName
     * @param newName name to refer to RIC - used for BLE advertising
     * @returns Promise<string> (name that has been set)
     *
     */
    setRICName(newName: string): Promise<string>;
    /**
     *
     * getRICName
     * @returns Promise<RICNameResponse> (object containing rslt)
     *
     */
    getRICName(): Promise<RICNameResponse>;
    /**
     *
     * getRICSystemInfo
     * @returns Promise<RICSystemInfo>
     *
     */
    getRICSystemInfo(): Promise<RICSystemInfo>;
    /**
     *
     * getRICCalibInfo
     * @returns Promise<RICCalibInfo>
     *
     */
    getRICCalibInfo(): Promise<RICCalibInfo>;
    /**
     *
     * subscribeForUpdates
     * @param enable - true to send command to enable subscription (false to remove sub)
     * @returns Promise<void>
     *
     */
    subscribeForUpdates(enable: boolean): Promise<void>;
    /**
     *
     * runTrajectory
     * @param trajName name of trajectory
     * @param params parameters (simple name value pairs only) to parameterize trajectory
     * @returns Promise<RICOKFail>
     *
     */
    runTrajectory(trajName: string, params: RICCmdParams): Promise<RICOKFail>;
    /**
     *
     * runTrajectory
     * @param commandName command API string
     * @param params parameters (simple name value pairs only) to parameterize trajectory
     * @returns Promise<RICOKFail>
     *
     */
    runCommand(commandName: string, params: RICCmdParams): Promise<RICOKFail>;
    /**
     *
     * hwElemFirmwareUpdate - initiate firmware update of one or more HWElems
     * @returns Promise<RICOKFail>
     *
     */
    hwElemFirmwareUpdate(): Promise<RICOKFail>;
    convertHWElemType(whoAmITypeCode: string | undefined): string;
    /**
     *
     * getHWElemList - get list of HWElems on the robot (including add-ons)
     * @returns Promise<RICHWElemList>
     *
     */
    getHWElemList(): Promise<RICHWElemList>;
    /**
     *
     * setAddOnConfig - set a specified add-on's configuration
     * @param serialNo used to identify the add-on
     * @param newName name to refer to add-on by
     * @returns Promise<RICOKFail>
     *
     */
    setAddOnConfig(serialNo: string, newName: string): Promise<RICOKFail>;
    /**
     *
     * getAddOnList - get list of add-ons configured on the robot
     * @returns Promise<RICAddOnList>
     *
     */
    getAddOnList(): Promise<RICAddOnList>;
    /**
     *
     * getFileList - get list of files on file system
     * @returns Promise<RICFileList>
     *
     */
    getFileList(): Promise<RICFileList>;
    /**
     *
     * fileSend - start file transfer
     * @param fileName name of file to send
     * @param fileType normal file or firmware
     * @param fileContents contenst of the file (binary object)
     * @returns Promise<boolean>
     *
     */
    fileSend(fileName: string, fileType: RICFileSendType, fileContents: Uint8Array, progressCallback: (sent: number, total: number, progress: number) => void): Promise<boolean>;
    fileSendCancel(): Promise<void>;
    calibrate(cmd: string, joints: string): Promise<RICOKFail | undefined>;
    getCachedSystemInfo(): RICSystemInfo | null;
    getCachedHWElemList(): Array<RICHWElem>;
    getCachedCalibInfo(): RICCalibInfo | null;
    getCachedRICName(): string | null;
    getCachedRICNameIsSet(): boolean;
    checkForUpdate(): Promise<void>;
    _isUpdateRequired(latestVersion: RICUpdateInfo, systemInfo: RICSystemInfo | null): Promise<boolean>;
    firmwareUpdate(): Promise<void>;
    firmwareUpdateCancel(): Promise<void>;
    _onConnStateChange(connEvent: RICEvent, connEventArgs: RICConnEventArgs | undefined): Promise<void>;
    onRxReply(msgHandle: number, msgRsltCode: MessageResultCode, msgRsltJsonObj: object | null): void;
    onRxUnnumberedMsg(msgRsltJsonObj: {
        [key: string]: number | string;
    }): void;
    getCommsStats(): CommsStats;
    onRxSmartServo(smartServos: ROSSerialSmartServos): void;
    onRxIMU(imuData: ROSSerialIMU): void;
    onRxPowerStatus(powerStatus: ROSSerialPowerStatus): void;
    onRxAddOnPub(addOnInfo: ROSSerialAddOnStatusList): void;
    getRICStateInfo(): RICStateInfo;
    _objectEntries(obj: RICCmdParams | undefined): Array<Array<string | number>>;
    _reportConnEvent(connEvent: RICEvent, connEventArgs?: RICConnEventArgs): void;
}
