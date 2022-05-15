"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hdkey_1 = __importDefault(require("hdkey"));
var inquirer_1 = __importDefault(require("inquirer"));
var createAccount_1 = __importDefault(require("../../common/createAccount"));
function create() {
    return __awaiter(this, void 0, void 0, function () {
        var entries, privateKey, _a, address, publicKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            name: 'PRIVATEKEY',
                            type: 'INPUT',
                            message: 'Private key :',
                        },
                    ])];
                case 1:
                    entries = _b.sent();
                    privateKey = entries.PRIVATEKEY;
                    _a = (0, createAccount_1.default)(privateKey), address = _a.address, publicKey = _a.publicKey;
                    console.log('='.repeat(78));
                    console.log("Address: ".concat(address));
                    console.log("Public key: ".concat(publicKey));
                    return [2 /*return*/];
            }
        });
    });
}
function generatePrivateKey() {
    return __awaiter(this, void 0, void 0, function () {
        var entries, passphrase, repeatPassphrase, privateKey, _a, address, publicKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            name: 'PASSPHRASE',
                            type: 'INPUT',
                            message: 'Passphrase :',
                        },
                        {
                            name: 'REPEATPASSPHRASE',
                            type: 'INPUT',
                            message: 'Repeat passphrase :',
                        },
                    ])];
                case 1:
                    entries = _b.sent();
                    passphrase = entries.PASSPHRASE;
                    repeatPassphrase = entries.REPEATPASSPHRASE;
                    if (passphrase != repeatPassphrase) {
                        throw 'Passphrases do not match!';
                    }
                    privateKey = hdkey_1.default.fromMasterSeed(Buffer.from(passphrase, 'hex')).privateKey;
                    _a = (0, createAccount_1.default)(privateKey.toString('hex')), address = _a.address, publicKey = _a.publicKey;
                    console.log('='.repeat(78));
                    console.log("Address: ".concat(address));
                    console.log("Public key: ".concat(publicKey));
                    console.log("Private key: ".concat(privateKey.toString('hex')));
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = { create: create, generatePrivateKey: generatePrivateKey };
