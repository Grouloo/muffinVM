"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toHex(uint8) {
    var buffer = Buffer.from(uint8);
    var hex = buffer.toString('hex');
    var finalHex = "0x".concat(hex);
    return finalHex;
}
exports.default = toHex;
