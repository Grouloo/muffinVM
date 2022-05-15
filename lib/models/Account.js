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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash_1 = __importDefault(require("../common/hash"));
var BaseObject_1 = __importDefault(require("./BaseObject"));
var Account = /** @class */ (function (_super) {
    __extends(Account, _super);
    function Account(data) {
        var _this = _super.call(this, data) || this;
        _this.add = function (value) {
            if (value < 0) {
                throw 'Value must be positive.';
            }
            _this.balance += value;
            return _this.balance;
        };
        _this.withdraw = function (value) {
            if (value < 0) {
                throw 'Value must be positive.';
            }
            if (_this.balance < value) {
                throw 'Balance insufficient.';
            }
            _this.balance -= value;
            return _this.balance;
        };
        return _this;
    }
    var _a;
    _a = Account;
    Account.instantiate = function (data) {
        return new _a(data);
    };
    Account.create = function (address) {
        var publicKey = (0, hash_1.default)(address);
        return new _a({
            address: address,
            publicKey: publicKey,
            nonce: 0,
            balance: 0,
            isContract: false,
        });
    };
    return Account;
}(BaseObject_1.default));
exports.default = Account;
