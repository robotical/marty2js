export default class RICUtils {
    static _isEndianSet: boolean;
    static _isLittleEndian: boolean;
    /**
     *
     * Add a string to a Uint8Array buffer
     *
     * @param buffer - buffer to add to
     * @param strToAdd - string to be added
     * @param startPos - start position in buffer (i.e. offset to place string at)
     */
    static addStringToBuffer(buffer: Uint8Array, strToAdd: string, startPos: number): void;
    /**
     *
     * Get a string from a Uint8Array buffer
     *
     * @param buffer - buffer to get from
     * @param startPos - start position in buffer (i.e. offset to start of string at)
     * @param strLen - length of string to get
     * @returns strGot - string got from buffer
     */
    static getStringFromBuffer(buffer: Uint8Array, startPos: number, strLen: number): string;
    /**
     *
     * Debug code to format a Uint8Array to string for logging
     *
     * @param buffer - Uint8Array to be converted to hex string
     */
    static bufferToHex(buffer: Uint8Array): string;
    /**
     *
     * Extract a big-endian float from a uint8array
     *
     * @param buf - Uint8Array containing float
     * @returns float
     */
    static getBEFloatFromBuf(buf: Uint8Array): number;
    /**
     *
     * Extract a big-endian int16 from a uint8array
     *
     * @param buf - Uint8Array containing int16
     * @param pos - position (offset in buf) to get from
     * @returns int16
     */
    static getBEInt16FromBuf(buf: Uint8Array, bufPos: number): number;
    /**
     *
     * Extract a big-endian uint16 from a uint8array
     *
     * @param buf - Uint8Array containing uint16
     * @param pos - position (offset in buf) to get from
     * @returns int16
     */
    static getBEUint16FromBuf(buf: Uint8Array, bufPos: number): number;
    /**
     *
     * Extract a big-endian uint8 from a uint8array
     *
     * @param buf - Uint8Array containing uint8
     * @param pos - position (offset in buf) to get from
     * @returns int16
     */
    static getBEUint8FromBuf(buf: Uint8Array, pos: number): number;
    static isLittleEndian(): boolean;
    /**
     * Implementation of atob() according to the HTML and Infra specs, except that
     * instead of throwing INVALID_CHARACTER_ERR we return null.
     *
     * @param data - string containing base64 representation
     * @returns Uint8Array
     *
     */
    static atob(data: string): Uint8Array | null;
    /**
     * A lookup table for atob(), which converts an ASCII character to the
     * corresponding six-bit number.
     */
    static atobLookup(chr: string): number | undefined;
    /**
     * btoa() as defined by the HTML and Infra specs, which mostly just references
     * RFC 4648.
     *
     * @param data - Uint8Array
     * @returns string containing base64 representation
     *
     */
    static btoa(inBuf: Uint8Array): string;
    /**
     * Lookup table for btoa(), which converts a six-bit number into the
     * corresponding ASCII character.
     */
    static btoaLookup(idx: number | undefined): string | undefined;
    static buf2hex(buffer: Uint8Array): string;
    static padStartFn(inStr: string, targetLength: number, padString: string): string;
    static debug(msg: string): void;
    static info(msg: string): void;
    static warn(msg: string): void;
    static error(msg: string): void;
}
