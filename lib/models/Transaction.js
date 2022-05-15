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
var fast_sha256_1 = __importDefault(require("fast-sha256"));
var tweetnacl_util_1 = __importDefault(require("tweetnacl-util"));
var BaseObject_1 = __importDefault(require("./BaseObject"));
var Transaction = /** @class */ (function (_super) {
    __extends(Transaction, _super);
    function Transaction(data) {
        var _this = _super.call(this, data) || this;
        _this.hash = '0x0';
        _this.calculateHash = function () {
            var summedData = _this.from +
                _this.to +
                _this.amount +
                _this.gas +
                _this.total +
                JSON.stringify(_this.data);
            var decodedSummedData = tweetnacl_util_1.default.decodeUTF8(summedData);
            var hash = (0, fast_sha256_1.default)(decodedSummedData);
            var encodedHash = tweetnacl_util_1.default.encodeUTF8(hash);
            var hexHash = "0x".concat(encodeURIComponent(encodedHash).replace(/%/g, ''));
            _this.hash = hexHash;
            return hexHash;
        };
        return _this;
    }
    var _a;
    _a = Transaction;
    Transaction.instantiate = function (data) {
        return new _a(data);
    };
    return Transaction;
}(BaseObject_1.default));
exports.default = Transaction;
