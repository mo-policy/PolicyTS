"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReceive = isReceive;
exports.rewriteReceive = rewriteReceive;
const term_1 = require("./term");
const termMatch_1 = require("./termMatch");
function isReceive(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Receive") &&
        ("channel" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!((0, termMatch_1.isRule)(term.rules[i]))) {
                return false;
            }
        }
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        }
        else if (kl === 4) {
            return ("id" in term) && (typeof term.id === "number");
        }
    }
    return false;
}
/*
## Rewrite Rules

Evaluate the channel.
If channel is blocked, return updated Receive term with blocked channel.
Loop over available messages from Machine.reserve(channel, id)     // reserve next message
    If no message return updated ReceiveTerm with channel and last id, if there is one.
    Look for rule with a pattern that matches the message.
    If matching rule has a guard, reduce guard, with updated bindings.
        If the guard is blocked, return a blocked MatchTerm of:
            match message with
            | pattern when guard -> term
            | ... remaining rules
            | _ ->
                ReceiveTerm with updated last id
        If the guard returns false, move to the next rule.
        If the guard returns true,
            Machine.receive(channel, message, id)   // take the message
            reduce the rule's term with updated bindings.
            return value
        If the guard is not boolean, throw.
    If no matching rule is found,
        Machine.release(channel, message, id)       // give back the message
        loop to next message
If no message matches any rules:
    Return updated Receive term with channel and last id.
*/
function rewriteReceive(m) {
    if (!(isReceive(m.term))) {
        throw "expected ReceiveTerm";
    }
    ;
    const resultOfChannel = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.channel }));
    if (resultOfChannel.blocked) {
        const blockedReceive = Object.assign({}, m.term, { channel: resultOfChannel.term });
        return m.copyWith({ term: blockedReceive, blocked: true });
    }
    else {
        let lastId = m.term.id;
        if (lastId === undefined) {
            lastId = -1;
        }
        while (true) {
            // { id: number, message: any }
            const resultOfReserve = m.reserve(resultOfChannel.term, lastId);
            if (resultOfReserve.id === lastId) {
                let termUpdate = { channel: resultOfChannel.term };
                if (resultOfReserve.id !== undefined) {
                    termUpdate["id"] = resultOfReserve.id;
                }
                const blockedReceive = Object.assign({}, m.term, termUpdate);
                return m.copyWith({ term: blockedReceive, blocked: true });
            }
            else {
                lastId = resultOfReserve.id;
                const matchingRule = (0, termMatch_1.findMatchingRule)(m, m.term.rules, resultOfReserve.message);
                if (matchingRule.matchResult !== false && matchingRule.rule !== undefined) {
                    if (matchingRule.resultOfGuard !== undefined) {
                        if (matchingRule.resultOfGuard.blocked) {
                            // to do, return a blocked match term
                            throw "guard blocked";
                        }
                        else if (matchingRule.resultOfGuard.term !== true) {
                            throw "unexpected guard value";
                        }
                    }
                    const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
                    if (m.receive(resultOfChannel.term, lastId)) {
                        const resultOfRule = (0, term_1.rewriteTerm)(m.copyWith({ term: matchingRule.rule.term, bindings: bindings }));
                        return m.copyWith({ term: resultOfRule.term });
                    }
                    else {
                        throw "receive returned false";
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=termReceive.js.map