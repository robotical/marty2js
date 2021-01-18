"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Struct
// Python-like Struct functionality
//
// RIC V2
// Rob Dobson 2020
// (C) Robotical 2020
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
Object.defineProperty(exports, "__esModule", { value: true });
var Struct = /** @class */ (function () {
    function Struct(format) {
        this._rechk = /^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/;
        this._refmt = /([1-9]\d*)?([xcbB?hHiIfdsp])/g;
        this._format = '';
        this._outBufferDataView = new DataView(new Uint8Array(0).buffer);
        this._outBufPos = 0;
        this._inBufferDataView = new DataView(new Uint8Array(0).buffer);
        this._inBufPos = 0;
        this._strPos = 0;
        this._formedStr = '';
        this._argIdx = 0;
        this._littleEndian = false;
        // Validate format
        var regexRslt = this._rechk.exec(format);
        if (!regexRslt) {
            throw new RangeError('Invalid format string');
        }
        // Format processing
        var fPos = 0;
        this._format = '';
        // Check for endian-ness indicator
        if (fPos < format.length) {
            if (format.charAt(fPos) == '<') {
                this._littleEndian = true;
                fPos++;
            }
            else if (format.charAt(fPos) == '>') {
                this._littleEndian = false;
                fPos++;
            }
        }
        // Expand numbers in the format
        while (fPos < format.length) {
            // Process current position in the format code
            var repeatLenCode = parseInt(format.substr(fPos), 10);
            if (isNaN(repeatLenCode)) {
                repeatLenCode = 1;
            }
            else {
                while (fPos < format.length &&
                    format.charAt(fPos) >= '0' &&
                    format.charAt(fPos) <= '9')
                    fPos++;
            }
            // Expand the single char to multiple (even in the case of string)
            for (var i = 0; i < repeatLenCode; i++) {
                this._format += format[fPos];
            }
            // In the case of strings we need to know when to move on to the next variable
            if (format[fPos] == 's')
                this._format += '0';
            // Next
            fPos++;
        }
    }
    Struct.prototype.size = function () {
        var outLen = 0;
        var fPos = 0;
        while (fPos < this._format.length) {
            var elLen = 0;
            switch (this._format[fPos]) {
                case 'x': {
                    elLen = 1;
                    break;
                }
                case '?': {
                    elLen = 1;
                    break;
                }
                case 'c': {
                    elLen = 1;
                    break;
                }
                case 'b': {
                    elLen = 1;
                    break;
                }
                case 'B': {
                    elLen = 1;
                    break;
                }
                case 'h': {
                    elLen = 2;
                    break;
                }
                case 'H': {
                    elLen = 2;
                    break;
                }
                case 'i': {
                    elLen = 4;
                    break;
                }
                case 'I': {
                    elLen = 4;
                    break;
                }
                case 'f': {
                    elLen = 4;
                    break;
                }
                case 'd': {
                    elLen = 8;
                    break;
                }
                case 's': {
                    elLen = 1;
                    break;
                }
                // this code used to indicate string end
                case '0': {
                    elLen = 0;
                    break;
                }
            }
            outLen += elLen;
            fPos += 1;
        }
        return outLen;
    };
    Struct.prototype._packElem = function (fPos, arg) {
        // Handle struct code
        var argInc = 1;
        switch (this._format[fPos]) {
            case 'x': {
                // Skip
                this._outBufPos++;
                argInc = 0;
                break;
            }
            case '?': {
                // Boolean byte value
                this._outBufferDataView.setInt8(this._outBufPos, arg ? -1 : 0);
                this._outBufPos++;
                break;
            }
            case 'c': {
                // Char
                this._outBufferDataView.setInt8(this._outBufPos, arg.charCodeAt(0));
                this._outBufPos++;
                break;
            }
            case 'b': {
                // Signed byte
                this._outBufferDataView.setInt8(this._outBufPos, Number(arg));
                this._outBufPos++;
                break;
            }
            case 'B': {
                // Unsigned byte
                this._outBufferDataView.setUint8(this._outBufPos, Number(arg));
                this._outBufPos++;
                break;
            }
            case 'h': {
                // Signed 16 bit
                this._outBufferDataView.setInt16(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 2;
                break;
            }
            case 'H': {
                // Unsigned 16 bit
                this._outBufferDataView.setUint16(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 2;
                break;
            }
            case 'i': {
                // Signed 32 bit
                this._outBufferDataView.setInt32(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 4;
                break;
            }
            case 'I': {
                // Unsigned 16 bit
                this._outBufferDataView.setUint32(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 4;
                break;
            }
            case 'f': {
                // Float (32 bit)
                this._outBufferDataView.setFloat32(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 4;
                break;
            }
            case 'd': {
                // Double (64 bit)
                this._outBufferDataView.setFloat64(this._outBufPos, Number(arg), this._littleEndian);
                this._outBufPos += 8;
                break;
            }
            case 's': {
                var inStr = arg;
                var chVal = inStr.length >= this._strPos ? inStr.charCodeAt(this._strPos++) : 0;
                this._outBufferDataView.setUint8(this._outBufPos, chVal);
                this._outBufPos += 1;
                argInc = 0;
                break;
            }
            case '0': {
                // This is to indicate string termination
                this._strPos = 0;
            }
        }
        this._argIdx += argInc;
        return fPos + 1;
    };
    Struct.prototype.packInto = function (buffer, offset) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this._outBufPos = offset;
        this._outBufferDataView = new DataView(buffer.buffer);
        this._strPos = 0;
        // Iterate format string
        this._argIdx = 0;
        var fPos = 0;
        while (fPos < this._format.length) {
            if (this._argIdx >= args.length)
                break;
            fPos = this._packElem(fPos, args[this._argIdx]);
        }
    };
    Struct.prototype.pack = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Generate out buffer
        var outBuffer = new Uint8Array(this.size());
        this.packInto.apply(this, __spread([outBuffer, 0], args));
        return outBuffer;
    };
    Struct.prototype._unpackElem = function (fPos, outArray) {
        // Handle struct code
        switch (this._format[fPos]) {
            case 'x': {
                // Skip
                this._inBufPos += 1;
                break;
            }
            case '?': {
                // Boolean byte value
                outArray.push(this._inBufferDataView.getUint8(this._inBufPos) != 0 ? true : false);
                this._inBufPos += 1;
                break;
            }
            case 'c': {
                // Character
                var charCode = this._inBufferDataView.getInt8(this._inBufPos);
                outArray.push(String.fromCharCode(charCode));
                this._inBufPos += 1;
                break;
            }
            case 'b': {
                // Signed 8 bit
                outArray.push(this._inBufferDataView.getInt8(this._inBufPos));
                this._inBufPos += 1;
                break;
            }
            case 'B': {
                // Unsigned 8 bit
                outArray.push(this._inBufferDataView.getUint8(this._inBufPos));
                this._inBufPos += 1;
                break;
            }
            case 'h': {
                // Signed 16 bit
                outArray.push(this._inBufferDataView.getInt16(this._inBufPos, this._littleEndian));
                this._inBufPos += 2;
                break;
            }
            case 'H': {
                // Unsigned 16 bit
                outArray.push(this._inBufferDataView.getUint16(this._inBufPos, this._littleEndian));
                this._inBufPos += 2;
                break;
            }
            case 'i': {
                // Signed 32 bit
                outArray.push(this._inBufferDataView.getInt32(this._inBufPos, this._littleEndian));
                this._inBufPos += 4;
                break;
            }
            case 'I': {
                // Unsigned 32 bit
                outArray.push(this._inBufferDataView.getUint32(this._inBufPos, this._littleEndian));
                this._inBufPos += 4;
                break;
            }
            case 'f': {
                // Float (32 bit)
                outArray.push(this._inBufferDataView.getFloat32(this._inBufPos, this._littleEndian));
                this._inBufPos += 4;
                break;
            }
            case 'd': {
                // Double (64 bit)
                outArray.push(this._inBufferDataView.getFloat64(this._inBufPos, this._littleEndian));
                this._inBufPos += 8;
                break;
            }
            case 's': {
                // String
                var chCode = this._inBufferDataView.getInt8(this._inBufPos);
                this._formedStr += String.fromCharCode(chCode);
                this._inBufPos += 1;
                break;
            }
            case '0': {
                // String termination
                outArray.push(this._formedStr);
                this._formedStr = '';
            }
        }
        return fPos + 1;
    };
    Struct.prototype.unpackFrom = function (buffer, offset) {
        // Get DataView onto input buffer
        this._inBufferDataView = new DataView(buffer.buffer);
        var outArray = new Array();
        this._formedStr = '';
        // Iterate format string
        var fPos = offset;
        this._inBufPos = 0;
        while (fPos < this._format.length) {
            fPos = this._unpackElem(fPos, outArray);
        }
        return outArray;
    };
    Struct.prototype.unpack = function (inBuf) {
        return this.unpackFrom(inBuf, 0);
    };
    return Struct;
}());
exports.default = Struct;
