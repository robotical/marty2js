import { Dictionary, RICHWElem } from './RICTypes.js';
import {
  RICAddOnBase,
  RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT,
  RICAddOnIRFoot,
  RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR,
  RICAddOnColourSensor,
  RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE,
  RICAddOnDistanceSensor,
  RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT,
  RICAddOnLightSensor,
  RIC_WHOAMI_TYPE_CODE_ADDON_NOISE,
  RICAddOnNoiseSensor,
} from './RICAddOns.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';

export default class RICAddOnManager {
  constructor() {}

  _addOnMap: Dictionary<RICAddOnBase> = {};

  setHWElems(hwElems: Array<RICHWElem>) {
    this._addOnMap = this.getMappingOfAddOns(hwElems);
  }

  clear() {
    this._addOnMap = {};
  }

  getMappingOfAddOns(hwElems: Array<RICHWElem>): Dictionary<RICAddOnBase> {
    const addOnMap: Dictionary<RICAddOnBase> = {};
    // Iterate HWElems to find addons
    for (const hwElem of hwElems) {
      if (hwElem.type === 'RSAddOn') {
        switch (parseInt(hwElem.whoAmITypeCode)) {
          case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT):
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnIRFoot(hwElem.name);
            break;
          case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR):
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnColourSensor(
              hwElem.name,
            );
            break;
          case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE):
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnDistanceSensor(
              hwElem.name,
            );
            break;
          case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT):
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnLightSensor(
              hwElem.name,
            );
            break;
          case parseInt(RIC_WHOAMI_TYPE_CODE_ADDON_NOISE):
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnNoiseSensor(
              hwElem.name,
            );
            break;
        }
      }
    }
    return addOnMap;
  }

  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus | null {
    // Lookup in map
    const addOnIdStr = addOnID.toString();
    if (addOnIdStr in this._addOnMap) {
      const addOnHandler = this._addOnMap[addOnIdStr];
      return addOnHandler.processPublishedData(addOnID, statusByte, rawData);
    }
    return null;
  }
}
