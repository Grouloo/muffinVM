"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keccak256_1 = __importDefault(require("keccak256"));
var toHex_1 = __importDefault(require("./toHex"));
function hash(message) {
    var hash = (0, keccak256_1.default)(message);
    var hexHash = (0, toHex_1.default)(hash);
    return hexHash;
}
exports.default = hash;
