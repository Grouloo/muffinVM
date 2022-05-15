"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var BaseObject = /** @class */ (function () {
    function BaseObject(data) {
        var _this = this;
        this.toJSON = function () {
            var object = __rest(_this, []);
            return object;
        };
        Object.assign(this, data);
    }
    var _a;
    _a = BaseObject;
    BaseObject.instantiate = function (data) {
        return new _a(data);
    };
    return BaseObject;
}());
exports.default = BaseObject;
