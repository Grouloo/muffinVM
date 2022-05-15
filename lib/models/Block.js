"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var common_1 = require("../common");
var executeTransaction_1 = __importDefault(require("../common/executeTransaction"));
var hash_1 = __importDefault(require("../common/hash"));
var Account_1 = __importDefault(require("./Account"));
var BaseObject_1 = __importDefault(require("./BaseObject"));
var Transaction_1 = __importDefault(require("./Transaction"));
var Block = /** @class */ (function (_super) {
    __extends(Block, _super);
    function Block(data) {
        var _this = _super.call(this, data) || this;
        _this.volume = 0;
        _this.burned = 0;
        _this.calculateHash = function () {
            if (!_this.transactions) {
                throw 'Empty block!';
            }
            if (!_this.parentHash) {
                throw 'No parent hash!';
            }
            var summedData = _this.parentHash +
                JSON.stringify(_this.transactions) +
                _this.timestamp.toTimeString();
            var mixHash = (0, hash_1.default)(summedData);
            _this.hash = mixHash;
            return mixHash;
        };
        _this.executeBlock = function (previousStateHash, validator, bond) { return __awaiter(_this, void 0, void 0, function () {
            var previousState, transactionsBash, interest, repayment, blockchain;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        previousState = BackendAdapter_1.default.instance.useState(previousStateHash);
                        transactionsBash = [];
                        interest = Transaction_1.default.instantiate({
                            to: validator.address,
                            amount: bond.interest,
                            gas: 0,
                            value: bond.interest,
                        });
                        this.transactions.push(interest);
                        bond.remainingBlocks -= 1;
                        transactionsBash.push(interest.toJSON());
                        // When all the blocks of the bond have been validated,
                        // the validator is fully repayed and the bond is marked as payed
                        if (bond.remainingBlocks <= 0) {
                            repayment = Transaction_1.default.instantiate({
                                to: validator.address,
                                amount: bond.principal,
                                gas: 0,
                                total: bond.principal,
                                value: bond.principal,
                            });
                            bond.status = 'payed';
                            this.transactions.push(repayment);
                        }
                        return [4 /*yield*/, previousState.read('blockchain', 'blockchain')
                            // Generating state hash
                        ];
                    case 1:
                        blockchain = _a.sent();
                        // Generating state hash
                        this.hash = (0, hash_1.default)(JSON.stringify(this.transactions));
                        this.transactions.map(function (tx, index) { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, executeTransaction_1.default)(tx, previousStateHash, index)];
                                    case 1:
                                        _a.sent();
                                        tx.status = 'done';
                                        tx.order = index;
                                        blockchain.meta.totalSupply -= tx.gas;
                                        this.volume += tx.total;
                                        this.burned += tx.gas;
                                        transactionsBash.push(tx);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        tx.status = 'aborted';
                                        tx.abortReason = e_1.message;
                                        transactionsBash.push(tx);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        // Updating chain's metadata
                        BackendAdapter_1.default.instance
                            .useWorldState()
                            .update('blockchain', 'blockchain', blockchain);
                        return [2 /*return*/, { bond: bond, transactionsBash: transactionsBash }];
                }
            });
        }); };
        _this.validate = function (previousStateHash, privateKey, bond) { return __awaiter(_this, void 0, void 0, function () {
            var state, validator, _a, newBond, transactionsBash, bonds;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useState(previousStateHash)
                            .all()];
                    case 1:
                        state = _b.sent();
                        validator = Account_1.default.instantiate(state.accounts[(0, hash_1.default)(privateKey)]);
                        return [4 /*yield*/, this.executeBlock(state, validator, bond)
                            // Saving the transactions
                        ];
                    case 2:
                        _a = _b.sent(), newBond = _a.bond, transactionsBash = _a.transactionsBash;
                        // Saving the transactions
                        transactionsBash.map(function (tx) {
                            BackendAdapter_1.default.instance
                                .useState(_this.hash)
                                .create('transactions', tx.hash, tx);
                        });
                        return [4 /*yield*/, BackendAdapter_1.default.instance.useWorldState().list('bonds')
                            // Saving bonds state
                        ];
                    case 3:
                        bonds = _b.sent();
                        // Saving bonds state
                        return [4 /*yield*/, Promise.all(bonds.map(function (bond) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, BackendAdapter_1.default.instance
                                                .useState(this.hash)
                                                .create('transactions', bond.hash, bond)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4:
                        // Saving bonds state
                        _b.sent();
                        this.hash = this.calculateHash();
                        this.transactions = transactionsBash;
                        // Validator's fields
                        this.validatedBy = validator.address;
                        this.signature = (0, common_1.signMessage)(privateKey, this.hash);
                        // Saving block
                        return [4 /*yield*/, BackendAdapter_1.default.instance
                                .useWorldState()
                                .create('blocks', this.hash, this)];
                    case 5:
                        // Saving block
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.confirm = function (previousStateHash) { return __awaiter(_this, void 0, void 0, function () {
            var validator, stateCollection, bond;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BackendAdapter_1.default.instance
                            .useState(previousStateHash)
                            .read('accounts', this.validatedBy)];
                    case 1:
                        validator = _a.sent();
                        if (!(0, common_1.verifySignature)(this.signature, this.hash, validator)) {
                            this.status = 'refused';
                            this.reason = "Signature doesn't correspond to validator.";
                            return [2 /*return*/];
                        }
                        stateCollection = BackendAdapter_1.default.instance.useState(previousStateHash);
                        return [4 /*yield*/, stateCollection.read('bonds', this.bondAddress)
                            //const previousState = await stateCollection.getState()
                        ];
                    case 2:
                        bond = _a.sent();
                        //const previousState = await stateCollection.getState()
                        return [4 /*yield*/, this.executeBlock(previousStateHash, validator, bond)];
                    case 3:
                        //const previousState = await stateCollection.getState()
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        if (data.timestamp) {
            _this.timestamp = data.timestamp;
        }
        else {
            _this.timestamp = new Date();
        }
        return _this;
    }
    return Block;
}(BaseObject_1.default));
exports.default = Block;
