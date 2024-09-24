"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRule = isRule;
exports.isMatch = isMatch;
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
/*
## Rewrite Rules

Evaluate Match.term.
If term result is blocked, return updated Match with blocked term.
Look for rule with a pattern that matches term result.
    If matching rule has a guard, reduce guard, with updated bindings.
        If the guard is blocked, return a blocked MatchTerm of:
            match term with
            | pattern when guard -> term
            | ... remaining rules
        If the guard returns false, move to the next rule.
        If the guard returns true,
            reduce the rule's term with updated bindings.
            return value
        If the guard is not boolean, throw.
If no matching rule is found, throw

*/
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
        for (let i = 0; i < m.term.rules.length; i++) {
            const rule = m.term.rules[i];
            const matchResult = (0, term_1.matchTerm)(m, rule.pattern, resultOfTerm.term);
            if (matchResult !== false) {
                const bindings = Object.assign({}, m.bindings, matchResult);
                let guardPassed = true;
                if ("guard" in rule) {
                    const resultOfGuard = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.guard, bindings: bindings }));
                    if (resultOfGuard.blocked) {
                        // to do, return a blocked match term
                        throw "guard blocked";
                    }
                    else if (typeof resultOfGuard.term !== "boolean") {
                        throw "guard not boolean";
                    }
                    else {
                        guardPassed = resultOfGuard.term;
                    }
                }
                if (guardPassed) {
                    const resultOfRule = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.term, bindings: bindings }));
                    return m.copyWith({ term: resultOfRule.term });
                }
            }
        }
        throw "no rule passed";
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