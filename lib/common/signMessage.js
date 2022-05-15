"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var secp256k1_1 = require("secp256k1");
var toHex_1 = __importDefault(require("./toHex"));
var keccak256_1 = __importDefault(require("keccak256"));
function signMessage(privateKey, message) {
    var messageBuffer = (0, keccak256_1.default)(message);
    var privateKeyBuffer = Buffer.from(privateKey, 'hex');
    var signatureBuffer = (0, secp256k1_1.ecdsaSign)(messageBuffer, privateKeyBuffer).signature;
    var signature = (0, toHex_1.default)(signatureBuffer);
    return signature;
}
exports.default = signMessage;
