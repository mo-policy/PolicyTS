"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTerm = rewriteTerm;
exports.matchTerm = matchTerm;
exports.stepsMinusOne = stepsMinusOne;
const termMatch_1 = require("./termMatch");
const termParallel_1 = require("./termParallel");
/**
 * The top level rewrite function for all terms.
 * @param m     The input machine.
 * @returns     The output machine.
 */
function rewriteTerm(m) {
    let nm = m;
    if (nm.steps === 0) {
        nm = nm.copyWith({ blocked: true });
    }
    else if (nm.blocked) {
        if ((0, termParallel_1.isParallel)(nm.term)) {
            const resultOfTerm = (0, termParallel_1.rewriteParallel)(nm.copyWith({ blocked: false }));
            nm = nm.copyWith({ term: resultOfTerm.term, steps: resultOfTerm.steps });
        }
    }
    else {
        let policyMatch = false;
        let steps = nm.steps;
        if (nm.policies.length > 0) {
            // look for rule in each policy matching the current term
            // if none found, continue
            // else, evaluate and return the matching rule's term
            for (let i = 0; i < nm.policies.length; i++) {
                const policy = nm.policies[i];
                const pm = policy.machine.copyWith({ steps: steps });
                const matchingRule = (0, termMatch_1.findMatchingRule)(pm, policy.term.rules, nm.term);
                if (matchingRule.matchResult !== false && matchingRule.rule !== undefined) {
                    policyMatch = true;
                    if (matchingRule.resultOfGuard !== undefined) {
                        steps = matchingRule.resultOfGuard.steps;
                        if (matchingRule.resultOfGuard.blocked && matchingRule.remainingRules !== undefined) {
                            /*
                            match nm.term with
                            | blockedRule.pattern when blockedGuard -> blockedRule.term
                            | remaining rules...
                            | _ -> m.term
                            */
                            const blockedMatch = (0, termMatch_1.createBlockedRuleMatch)(matchingRule, nm.term, nm.term);
                            return m.copyWith({ term: blockedMatch, blocked: true, steps: steps });
                        }
                        else if (matchingRule.resultOfGuard.term !== true) {
                            throw "unexpected guard value";
                        }
                    }
                    const policies = nm.policies.slice(0, i);
                    const bindings = Object.assign({}, nm.bindings, matchingRule.matchResult);
                    const resultOfRule = rewriteTerm(policy.machine.copyWith({ term: matchingRule.rule.term, policies: policies, bindings: bindings, steps: steps }));
                    nm = policy.machine.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: resultOfRule.steps });
                    break;
                }
            }
        }
        if (!policyMatch) {
            if (Array.isArray(nm.term)) {
                // rewrite the elements of machine.term
                let anyBlocked = false;
                const nextTerm = [];
                for (let i = 0; i < m.term.length; i++) {
                    nm = rewriteTerm(m.copyWith({ term: m.term[i], steps: steps }));
                    steps = nm.steps;
                    anyBlocked = (anyBlocked || nm.blocked);
                    nextTerm[i] = nm.term;
                }
                nm = m.copyWith({ term: nextTerm, blocked: anyBlocked, steps: nm.steps });
            }
            else {
                const f = nm.getRewriteFunction();
                if ((nm.term !== null) && (typeof nm.term === "object")) {
                    if ("$policy" in nm.term) {
                        nm = f(nm);
                    }
                    else {
                        // rewrite the properties of machine.term
                        let anyBlocked = false;
                        const nextTerm = {};
                        for (let p in m.term) {
                            nm = rewriteTerm(m.copyWith({ term: m.term[p], steps: steps }));
                            steps = nm.steps;
                            anyBlocked = (anyBlocked || nm.blocked);
                            nextTerm[p] = nm.term;
                        }
                        nm = m.copyWith({ term: nextTerm, blocked: anyBlocked, steps: nm.steps });
                    }
                }
                else {
                    nm = f(nm);
                }
            }
        }
    }
    if (nm.steps === 0 && (!nm.blocked)) {
        nm = nm.copyWith({ blocked: true });
    }
    return nm;
}
function matchTerm(m, pattern, value) {
    const f = m.getMatchFunction(pattern);
    return f(m, pattern, value);
}
function stepsMinusOne(x) {
    if (x > 0) {
        return x - 1;
    }
    else {
        return x;
    }
}
//# sourceMappingURL=term.js.map