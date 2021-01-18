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
var DataExtractorVarType;
(function (DataExtractorVarType) {
    DataExtractorVarType[DataExtractorVarType["VAR_BOOL"] = 0] = "VAR_BOOL";
    DataExtractorVarType[DataExtractorVarType["VAR_SIGNED"] = 1] = "VAR_SIGNED";
    DataExtractorVarType[DataExtractorVarType["VAR_UNSIGNED"] = 2] = "VAR_UNSIGNED";
    DataExtractorVarType[DataExtractorVarType["VAR_FLOAT"] = 3] = "VAR_FLOAT";
    DataExtractorVarType[DataExtractorVarType["VAR_DOUBLE"] = 4] = "VAR_DOUBLE";
    DataExtractorVarType[DataExtractorVarType["VAR_FIXED_LEN_STRING"] = 5] = "VAR_FIXED_LEN_STRING";
})(DataExtractorVarType = exports.DataExtractorVarType || (exports.DataExtractorVarType = {}));
var DataExtractorRetVal = /** @class */ (function () {
    function DataExtractorRetVal() {
    }
    return DataExtractorRetVal;
}());
exports.DataExtractorRetVal = DataExtractorRetVal;
var DataExtractorCalcs = /** @class */ (function () {
    function DataExtractorCalcs() {
        //varName = '';
        this.bytePos = 0;
        this.bitMask = 1;
        this.numBytes = 0;
        this.postMult = 1;
        this.postAdd = 0;
        this.littleEndian = false;
    }
    return DataExtractorCalcs;
}());
exports.DataExtractorCalcs = DataExtractorCalcs;
var DataExtractorVarDef = /** @class */ (function () {
    function DataExtractorVarDef() {
        this.suffix = '';
        this.atBit = 0;
        this.bits = 1;
        this.type = DataExtractorVarType.VAR_BOOL;
        this.postMult = 1;
        this.postAdd = 0;
        this.littleEndian = false;
        this.calcs = new DataExtractorCalcs();
    }
    return DataExtractorVarDef;
}());
exports.DataExtractorVarDef = DataExtractorVarDef;
var DataExtractorDef = /** @class */ (function () {
    function DataExtractorDef() {
        this.fields = new Array();
    }
    return DataExtractorDef;
}());
exports.DataExtractorDef = DataExtractorDef;
var DataExtractor = /** @class */ (function () {
    function DataExtractor(varNameBase, formatDef) {
        this._formatDef = new DataExtractorDef();
        this._varNameBase = '';
        this._formatDef = formatDef;
        this._varNameBase = varNameBase;
        this.preCalcs();
    }
    DataExtractor.prototype.preCalcs = function () {
        var e_1, _a;
        try {
            // Perform pre-calculations to speed-up processing
            for (var _b = __values(this._formatDef.fields), _c = _b.next(); !_c.done; _c = _b.next()) {
                var fmt = _c.value;
                var calcs = new DataExtractorCalcs();
                //calcs.varName = this._varNameBase + fmt.suffix;
                calcs.bytePos = Math.floor(fmt.atBit / 8);
                calcs.bitMask =
                    (0x80000000 >> (fmt.bits - 1)) >>> (32 - fmt.bits - (fmt.atBit % 8));
                calcs.numBytes = Math.ceil(fmt.bits / 8);
                calcs.postMult = fmt.postMult === undefined ? 1 : fmt.postMult;
                calcs.postAdd = fmt.postAdd === undefined ? 0 : fmt.postAdd;
                calcs.littleEndian =
                    fmt.littleEndian === undefined ? false : fmt.littleEndian;
                fmt.calcs = calcs;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    DataExtractor.prototype.extractData = function (data) {
        var e_2, _a;
        var retVals = new DataExtractorRetVal();
        try {
            for (var _b = __values(this._formatDef.fields), _c = _b.next(); !_c.done; _c = _b.next()) {
                var fmt = _c.value;
                var calcs = fmt.calcs;
                var varName = this._varNameBase + fmt.suffix;
                switch (fmt.type) {
                    case DataExtractorVarType.VAR_BOOL: {
                        // Check read length is valid
                        if (calcs.bytePos >= data.length)
                            continue;
                        // Extract the bitfield
                        var val = data[calcs.bytePos] & calcs.bitMask;
                        retVals[varName] = val != 0;
                        break;
                    }
                    case DataExtractorVarType.VAR_SIGNED:
                    case DataExtractorVarType.VAR_UNSIGNED: {
                        // Check read length is valid
                        if (calcs.bytePos + calcs.numBytes > data.length)
                            continue;
                        // Extract the value
                        var val = 0;
                        if (calcs.littleEndian) {
                            for (var i = calcs.numBytes - 1; i >= 0; i--) {
                                val = (val << 8) | data[calcs.bytePos + i];
                            }
                        }
                        else {
                            for (var i = 0; i < calcs.numBytes; i++) {
                                val = (val << 8) | data[calcs.bytePos + i];
                            }
                        }
                        val = val & calcs.bitMask;
                        if (fmt.type == DataExtractorVarType.VAR_SIGNED &&
                            val & (1 << (fmt.bits - 1))) {
                            val = val - (1 << fmt.bits);
                        }
                        // Store the value with post-processing
                        retVals[varName] = val * calcs.postMult + calcs.postAdd;
                        break;
                    }
                    case DataExtractorVarType.VAR_FLOAT: {
                        // Check read length is valid
                        if (calcs.bytePos + 4 > data.length)
                            continue;
                        var dv = new DataView(data);
                        var val = dv.getFloat32(calcs.bytePos, calcs.littleEndian);
                        // Store the value with post-processing
                        retVals[varName] = val * calcs.postMult + calcs.postAdd;
                        break;
                    }
                    case DataExtractorVarType.VAR_DOUBLE: {
                        // Check read length is valid
                        if (calcs.bytePos + 8 > data.length)
                            continue;
                        var dv = new DataView(data);
                        var val = dv.getFloat64(calcs.bytePos, calcs.littleEndian);
                        // Store the value with post-processing
                        retVals[varName] = val * calcs.postMult + calcs.postAdd;
                        break;
                    }
                    case DataExtractorVarType.VAR_FIXED_LEN_STRING: {
                        // Check read length is valid
                        if (calcs.bytePos + calcs.numBytes > data.length)
                            continue;
                        // Extract the value
                        var val = '';
                        for (var i = 0; i < calcs.numBytes; i++) {
                            var ch = data[calcs.bytePos + i];
                            if (ch === 0)
                                break;
                            val += String.fromCharCode(ch);
                        }
                        // Store the value
                        retVals[varName] = val;
                        break;
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return retVals;
    };
    return DataExtractor;
}());
exports.default = DataExtractor;
