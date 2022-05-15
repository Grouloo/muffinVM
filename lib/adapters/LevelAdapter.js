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
var level_ts_1 = __importDefault(require("level-ts"));
var sublevel_1 = __importDefault(require("sublevel"));
var Account_1 = __importDefault(require("../models/Account"));
var Block_1 = __importDefault(require("../models/Block"));
var Transaction_1 = __importDefault(require("../models/Transaction"));
var Bond_1 = __importDefault(require("../models/Bond"));
var Blockchain_1 = __importDefault(require("../models/Blockchain"));
var COLLECTIONS = {
    accounts: Account_1.default,
    blocks: Block_1.default,
    transactions: Transaction_1.default,
    bonds: Bond_1.default,
    blockchain: Blockchain_1.default,
};
var WORLDSTATE = '0x0';
var LevelAdapter = /** @class */ (function () {
    function LevelAdapter(path) {
        var _this = this;
        this.initializeState = function (stateHash) {
            _this.state = new level_ts_1.default((0, sublevel_1.default)(_this.db, stateHash));
            // Initializating all collections
            _this.collections = {};
            Object.keys(COLLECTIONS).map(function (collection) {
                _this.collections[collection] = new level_ts_1.default((0, sublevel_1.default)(_this.state, collection));
            });
        };
        this.useState = function (stateHash) {
            _this.initializeState(stateHash);
            return LevelAdapter.instance;
        };
        this.useWorldState = function () {
            _this.initializeState(WORLDSTATE);
            return LevelAdapter.instance;
        };
        this.all = function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.state.all()];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        }); };
        this.create = function (collection, key, value) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collections[collection].put(key, value.toJSON())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, value];
                }
            });
        }); };
        this.read = function (collection, key) { return __awaiter(_this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collections[collection].get(key)];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, COLLECTIONS[collection].instantiate(value)];
                }
            });
        }); };
        this.update = function (collection, key, value) { return __awaiter(_this, void 0, void 0, function () {
            var oldValue, newValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.read(collection, key)];
                    case 1:
                        oldValue = _a.sent();
                        newValue = Object.assign(oldValue, value.toJSON);
                        return [4 /*yield*/, this.collections[collection].put(key, newValue)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, COLLECTIONS[collection].instantiate(newValue)];
                }
            });
        }); };
        this.delete = function (collection, key) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collections[collection].del(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.list = function (collection) { return __awaiter(_this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collections[collection].all()];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, value];
                }
            });
        }); };
        this.getState = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentState;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentState = {
                            accounts: {},
                            transactions: {},
                            blocks: {},
                            bonds: {},
                            blockchain: {},
                        };
                        return [4 /*yield*/, Promise.all(Object.keys(COLLECTIONS).map(function (collection) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _a = currentState;
                                            _b = collection;
                                            _c = this.collection2object;
                                            return [4 /*yield*/, this.list(collection)];
                                        case 1:
                                            _a[_b] = _c.apply(this, [_d.sent(), collection]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, currentState];
                }
            });
        }); };
        this.collection2object = function (arr, collection) {
            return arr.reduce(function (obj, item) { return ((obj[item.hash] = COLLECTIONS[collection].instantiate(item)), obj); }, {});
        };
        this.db = new level_ts_1.default('./storage' /*path*/);
        this.useWorldState();
        LevelAdapter.instance = this;
    }
    return LevelAdapter;
}());
exports.default = LevelAdapter;
