"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRule = isRule;
exports.isMatch = isMatch;
exports.findMatchingRule = findMatchingRule;
exports.createBlockedRuleMatch = createBlockedRuleMatch;
exports.rewriteMatch = rewriteMatch;
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
    let steps = m.steps;
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const matchResult = (0, term_1.matchTerm)(m, rule.pattern, value);
        if (matchResult !== false) {
            const bindings = Object.assign({}, m.bindings, matchResult);
            let guardPassed = true;
            if ("guard" in rule) {
                const resultOfGuard = (0, term_1.rewriteTerm)(m.copyWith({ term: rule.guard, bindings: bindings, steps: steps }));
                steps = resultOfGuard.steps;
                if ((resultOfGuard.blocked) || (typeof resultOfGuard.term !== "boolean")) {
                    return {
                        matchResult: matchResult,
                        rule: rule,
                        resultOfGuard: resultOfGuard,
                        remainingRules: rules.slice(i + 1)
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
function createBlockedRuleMatch(matchingRule, matchTerm, blockedTerm) {
    if (matchingRule.matchResult === false ||
        matchingRule.rule === undefined ||
        matchingRule.resultOfGuard === undefined ||
        (!(matchingRule.resultOfGuard.blocked)) ||
        matchingRule.remainingRules === undefined) {
        throw "unexpected paramaters to createBlockedRuleMatch";
    }
    let blockedRule = {
        $policy: "Rule",
        pattern: matchingRule.rule.pattern,
        guard: matchingRule.resultOfGuard.term,
        term: matchingRule.rule.term
    };
    let blockedRules = [blockedRule];
    for (let i = 0; i < matchingRule.remainingRules.length; i++) {
        blockedRules.push(matchingRule.remainingRules[i]);
    }
    let finalRule = {
        $policy: "Rule",
        pattern: { $policy: "Lookup", name: "_" },
        term: blockedTerm
    };
    blockedRules.push(finalRule);
    const blockedMatch = {
        $policy: "Match",
        term: matchTerm,
        rules: blockedRules
    };
    return blockedMatch;
}
function rewriteMatch(m) {
    if (!(isMatch(m.term))) {
        throw "expected MatchTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        const matchingRule = findMatchingRule(m.copyWith({ steps: steps }), m.term.rules, resultOfTerm.term);
        if (matchingRule.matchResult === false || matchingRule.rule === undefined) {
            throw "no rule passed";
        }
        else {
            if (matchingRule.resultOfGuard !== undefined) {
                steps = matchingRule.resultOfGuard.steps;
                if (matchingRule.resultOfGuard.blocked && matchingRule.remainingRules !== undefined) {
                    /*
                    match term with
                    | blockedRule.pattern when blockedGuard -> blockedRule.term
                    | remaining rules...
                    | _ -> m.term
                    */
                    const blockedMatch = createBlockedRuleMatch(matchingRule, blockedTerm.term, blockedTerm);
                    return m.copyWith({ term: blockedMatch, blocked: true, steps: steps });
                }
                else if (matchingRule.resultOfGuard.term !== true) {
                    throw "unexpected guard value";
                }
            }
            const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
            const resultOfRule = (0, term_1.rewriteTerm)(m.copyWith({ term: matchingRule.rule.term, bindings: bindings, steps: steps }));
            if (!resultOfRule.blocked) {
                steps = (0, term_1.stepsMinusOne)(steps);
            }
            return m.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: steps });
        }
    }
}
//# sourceMappingURL=termMatch.js.map