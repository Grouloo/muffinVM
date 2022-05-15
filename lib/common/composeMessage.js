"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function composeMessage(amount, nonce, data) {
    var message = amount.toString() + nonce.toString() + data;
    return message;
}
exports.default = composeMessage;
