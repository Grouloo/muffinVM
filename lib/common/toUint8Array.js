"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toUint8Array(hex) {
    var parsedHex = hex.replace('0x', '');
    var buffer = Buffer.from(parsedHex);
    var uint8 = Uint8Array.from(buffer);
    return uint8;
}
exports.default = toUint8Array;
