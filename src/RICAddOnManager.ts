import { Dictionary, RICHWElem } from './RICTypes.js';
import {
  getHWElemTypeStr,
  RICAddOnBase,
  RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO,
  RICAddOnGripServo,
  RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT,
  RICAddOnLEDFoot,
  RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM,
  RICAddOnLEDArm,
  RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE,
  RICAddOnLEDEye,
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


  convertHWElemType(whoAmI: string | undefined){
    return getHWElemTypeStr(whoAmI);
  } 


  getMappingOfAddOns(hwElems: Array<RICHWElem>): Dictionary<RICAddOnBase> {
    const addOnMap: Dictionary<RICAddOnBase> = {};
    // Iterate HWElems to find addons
    for (const hwElem of hwElems) {
      console.log(hwElem.whoAmI, 'RICAddOnManager.ts', 'line: ', '50');
      if (hwElem.type === 'RSAddOn') {
        switch (hwElem.whoAmI) {
          case RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnGripServo(
              hwElem.name
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDFoot(
              hwElem.name
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDArm(
              hwElem.name
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnLEDEye(
              hwElem.name
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnIRFoot(
              hwElem.name,
             );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnColourSensor(
              hwElem.name,
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnDistanceSensor(
              hwElem.name,
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT:
            addOnMap[hwElem.IDNo.toString()] = new RICAddOnLightSensor(
              hwElem.name,
            );
            break;
          case RIC_WHOAMI_TYPE_CODE_ADDON_NOISE:
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
