"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRule = isRule;
exports.isMatch = isMatch;
exports.findMatchingRule = findMatchingRule;
exports.rewriteMatch = rewriteMatch;
exports.matchMatch = matchMatch;
const term_1 = require("./term");
function isRule(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Rule") &&
        ("pattern" in term) &&
        ("term" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        }
        else if (kl === 4) {
            return ("guard" in term);
        }
    }
    return false;
}
function isMatch(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Match") &&
        ("term" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!(isRule(term.rules[i]))) {
                return false;
            }
        }
    }
    return true;
}
function findMatchingRule(m, rules, value) {
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const matchResult = (0, term_1.matchTerm)(m, rule.pattern, value);
        if (matchResult !== false) {
            const bindings = Object.assign({}, m.bindings, matchResult);
            let guardPassed = true;
            if ("guard" in rule) {
                const resultOfGuard = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.guard, bindings: bindings }));
                if ((resultOfGuard.blocked) || (typeof resultOfGuard.term !== "boolean")) {
                    return {
                        matchResult: matchResult,
                        rule: rule,
                        resultOfGuard: resultOfGuard,
                        remainingRules: rules.slice(i)
                    };
                }
                else {
                    guardPassed = resultOfGuard.term;
                }
            }
            if (guardPassed) {
                return {
                    matchResult: matchResult,
                    rule: rule,
                    remainingRules: rules.slice(i)
                };
            }
        }
    }
    return {
        matchResult: false
    };
}
function rewriteMatch(m) {
    if (!(isMatch(m.term))) {
        throw "expected MatchTerm";
    }
    ;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        const blockedMatch = Object.assign({}, m.term, { channel: resultOfTerm.term });
        return m.copyWith({ term: blockedMatch, blocked: true });
    }
    else {
        const matchingRule = findMatchingRule(m, m.term.rules, resultOfTerm.term);
        if (matchingRule.matchResult === false || matchingRule.rule === undefined) {
            throw "no rule passed";
        }
        else {
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
            const resultOfRule = (0, term_1.rewriteTerm)(m.copyWith({ term: matchingRule.rule.term, bindings: bindings }));
            return m.copyWith({ term: resultOfRule.term });
        }
    }
}
/*
## Match Rules
*/
function matchMatch(pattern, value) {
    if (!(isMatch(pattern))) {
        throw "expected Match";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termMatch.js.map