"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSend = isSend;
exports.rewriteSend = rewriteSend;
const term_1 = require("./term");
function isSend(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Send") &&
        ("message" in term) &&
        ("channel" in term) &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules

Evaluate the message and channel, call Machine.send and return result of send.
*/
function rewriteSend(m) {
    if (!(isSend(m.term))) {
        throw "expected SendTerm";
    }
    ;
    const resultOfMessage = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.message }));
    if (resultOfMessage.blocked) {
        throw "blocked";
    }
    const resultOfChannel = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.channel }));
    if (resultOfChannel.blocked) {
        throw "blocked";
    }
    m.send(resultOfMessage.term, resultOfChannel.term);
    return m.copyWith({ term: null });
}
//# sourceMappingURL=termSend.js.map