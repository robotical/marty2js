import { Dictionary, RICHWElem } from './RICTypes.js';
import { RICAddOnBase } from './RICAddOns.js';
import { ROSSerialAddOnStatus } from './RICROSSerial.js';
export default class RICAddOnManager {
    constructor();
    _addOnMap: Dictionary<RICAddOnBase>;
    setHWElems(hwElems: Array<RICHWElem>): void;
    clear(): void;
    convertHWElemType(whoAmI: string | undefined): string;
    getMappingOfAddOns(hwElems: Array<RICHWElem>): Dictionary<RICAddOnBase>;
    processPublishedData(addOnID: number, statusByte: number, rawData: Uint8Array): ROSSerialAddOnStatus | null;
}
