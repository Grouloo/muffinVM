"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var secp256k1_1 = require("secp256k1");
var tweetnacl_util_1 = __importDefault(require("tweetnacl-util"));
var toUint8Array_1 = __importDefault(require("./toUint8Array"));
function verifySignature(signature, message, account) {
    var signatureBuffer = (0, toUint8Array_1.default)(signature);
    var publicKey = (0, toUint8Array_1.default)(account.publicKey);
    var messageBuffer = tweetnacl_util_1.default.decodeUTF8(message);
    var verification = (0, secp256k1_1.ecdsaVerify)(signatureBuffer, messageBuffer, publicKey);
    return verification;
}
exports.default = verifySignature;
