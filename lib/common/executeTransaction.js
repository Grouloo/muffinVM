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
var BackendAdapter_1 = __importDefault(require("../adapters/BackendAdapter"));
var Account_1 = __importDefault(require("../models/Account"));
var composeMessage_1 = __importDefault(require("./composeMessage"));
var verifySignature_1 = __importDefault(require("./verifySignature"));
function executeTransaction(transaction, previousStateHash, order) {
    return __awaiter(this, void 0, void 0, function () {
        var blockchain, sender, receiver, message, verifiedSignature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, BackendAdapter_1.default.instance
                        .useWorldState()
                        .read('blockchain', 'blockchain')];
                case 1:
                    blockchain = _a.sent();
                    return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useWorldState()
                            .read('accounts', transaction.from)];
                case 2:
                    sender = _a.sent();
                    return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useWorldState()
                            .read('accounts', transaction.to)
                        // If the receiver has no account yet, we have to create it
                    ];
                case 3:
                    receiver = _a.sent();
                    if (!!receiver) return [3 /*break*/, 5];
                    receiver = Account_1.default.create(transaction.to);
                    // Updating metadata
                    blockchain.meta.eoaCount += 1;
                    blockchain.meta.idealSupply =
                        blockchain.meta.eoaCount * blockchain.meta.idealSupplyPerAccount;
                    // Saving account in state
                    return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useWorldState()
                            .create('accounts', transaction.to, receiver)];
                case 4:
                    // Saving account in state
                    _a.sent();
                    _a.label = 5;
                case 5:
                    message = (0, composeMessage_1.default)(transaction.amount, sender.nonce, transaction.data);
                    verifiedSignature = (0, verifySignature_1.default)(transaction.signature, message, sender);
                    if (!verifiedSignature) {
                        throw "The signature doesn't fit the sender.";
                    }
                    if (!receiver.isContract) return [3 /*break*/, 6];
                    return [3 /*break*/, 9];
                case 6:
                    sender.withdraw(transaction.total);
                    receiver.add(transaction.amount);
                    // Updating sender's nonce
                    sender.nonce += 1;
                    // Saving edited accounts
                    return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useWorldState()
                            .update('accounts', sender.address, sender)];
                case 7:
                    // Saving edited accounts
                    _a.sent();
                    return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useWorldState()
                            .update('accounts', sender.receiver, receiver)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.default = executeTransaction;
