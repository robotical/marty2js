import { RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT, RICAddOnLEDFoot, RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM, RICAddOnLEDArm, RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE, RICAddOnLEDEye, RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT, RICAddOnIRFoot, RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR, RICAddOnColourSensor, RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE, RICAddOnDistanceSensor, RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT, RICAddOnLightSensor, RIC_WHOAMI_TYPE_CODE_ADDON_NOISE, RICAddOnNoiseSensor, } from './RICAddOns.js';
export default class RICAddOnManager {
    constructor() {
        this._addOnMap = {};
    }
    setHWElems(hwElems) {
        this._addOnMap = this.getMappingOfAddOns(hwElems);
    }
    clear() {
        this._addOnMap = {};
    }
    getMappingOfAddOns(hwElems) {
        const addOnMap = {};
        // Iterate HWElems to find addons
        for (const hwElem of hwElems) {
            if (hwElem.type === 'RSAddOn') {
                switch (parseInt("0x" + hwElem.whoAmITypeCode)) {
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDFoot(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDArm(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDEye(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnIRFoot(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnColourSensor(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnDistanceSensor(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnLightSensor(hwElem.name);
                        break;
                    case parseInt("0x" + RIC_WHOAMI_TYPE_CODE_ADDON_NOISE):
                        addOnMap[hwElem.IDNo.toString()] = new RICAddOnNoiseSensor(hwElem.name);
                        break;
                }
            }
        }
        return addOnMap;
    }
    processPublishedData(addOnID, statusByte, rawData) {
        // Lookup in map
        const addOnIdStr = addOnID.toString();
        if (addOnIdStr in this._addOnMap) {
            const addOnHandler = this._addOnMap[addOnIdStr];
            return addOnHandler.processPublishedData(addOnID, statusByte, rawData);
        }
        return null;
    }
}
