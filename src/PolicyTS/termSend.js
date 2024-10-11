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
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfMessage = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.message }));
    Object.assign(blockedTerm, { message: resultOfMessage.term });
    steps = resultOfMessage.steps;
    if (resultOfMessage.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    const resultOfChannel = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.channel }));
    Object.assign(blockedTerm, { channel: resultOfChannel.term });
    steps = resultOfChannel.steps;
    if (resultOfChannel.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    m.send(resultOfMessage.term, resultOfChannel.term);
    steps = (0, term_1.stepsMinusOne)(steps);
    return m.copyWith({ term: null, steps: steps });
}
//# sourceMappingURL=termSend.js.map