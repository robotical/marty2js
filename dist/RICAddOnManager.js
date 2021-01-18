"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var RICAddOns_js_1 = require("./RICAddOns.js");
var RICAddOnManager = /** @class */ (function () {
    function RICAddOnManager() {
        this._addOnMap = {};
    }
    RICAddOnManager.prototype.setHWElems = function (hwElems) {
        this._addOnMap = this.getMappingOfAddOns(hwElems);
    };
    RICAddOnManager.prototype.clear = function () {
        this._addOnMap = {};
    };
    RICAddOnManager.prototype.getMappingOfAddOns = function (hwElems) {
        var e_1, _a;
        var addOnMap = {};
        try {
            // Iterate HWElems to find addons
            for (var hwElems_1 = __values(hwElems), hwElems_1_1 = hwElems_1.next(); !hwElems_1_1.done; hwElems_1_1 = hwElems_1.next()) {
                var hwElem = hwElems_1_1.value;
                if (hwElem.type === 'RSAddOn') {
                    switch (parseInt(hwElem.whoAmITypeCode)) {
                        case parseInt(RICAddOns_js_1.RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT):
                            addOnMap[hwElem.IDNo.toString()] = new RICAddOns_js_1.RICAddOnIRFoot(hwElem.name);
                            break;
                        case parseInt(RICAddOns_js_1.RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR):
                            addOnMap[hwElem.IDNo.toString()] = new RICAddOns_js_1.RICAddOnColourSensor(hwElem.name);
                            break;
                        case parseInt(RICAddOns_js_1.RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE):
                            addOnMap[hwElem.IDNo.toString()] = new RICAddOns_js_1.RICAddOnDistanceSensor(hwElem.name);
                            break;
                        case parseInt(RICAddOns_js_1.RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT):
                            addOnMap[hwElem.IDNo.toString()] = new RICAddOns_js_1.RICAddOnLightSensor(hwElem.name);
                            break;
                        case parseInt(RICAddOns_js_1.RIC_WHOAMI_TYPE_CODE_ADDON_NOISE):
                            addOnMap[hwElem.IDNo.toString()] = new RICAddOns_js_1.RICAddOnNoiseSensor(hwElem.name);
                            break;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (hwElems_1_1 && !hwElems_1_1.done && (_a = hwElems_1.return)) _a.call(hwElems_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return addOnMap;
    };
    RICAddOnManager.prototype.processPublishedData = function (addOnID, statusByte, rawData) {
        // Lookup in map
        var addOnIdStr = addOnID.toString();
        if (addOnIdStr in this._addOnMap) {
            var addOnHandler = this._addOnMap[addOnIdStr];
            return addOnHandler.processPublishedData(addOnID, statusByte, rawData);
        }
        return null;
    };
    return RICAddOnManager;
}());
exports.default = RICAddOnManager;
