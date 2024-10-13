"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTerm = rewriteTerm;
exports.matchTerm = matchTerm;
exports.stepsMinusOne = stepsMinusOne;
const termMatch_1 = require("./termMatch");
const termParallel_1 = require("./termParallel");
const termTryWith_1 = require("./termTryWith");
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
                const activeRule = nm.policies[i];
                const pm = activeRule.machine.copyWith({ steps: steps });
                const matchingRule = (0, termMatch_1.findMatchingRule)(pm, activeRule.term.rules, nm.term);
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
                            return pm.copyWith({ term: blockedMatch, blocked: true, steps: steps });
                        }
                        else if (matchingRule.resultOfGuard.term !== true) {
                            throw "unexpected guard value";
                        }
                    }
                    const policies = nm.policies.slice(0, i);
                    const bindings = Object.assign({}, nm.bindings, matchingRule.matchResult);
                    const resultOfRule = rewriteTerm(pm.copyWith({ term: matchingRule.rule.term, policies: policies, bindings: bindings, steps: steps }));
                    nm = activeRule.machine.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: resultOfRule.steps });
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
                    nm = rewriteTerm(m.copyWith({ term: m.term[i], blocked: nm.blocked, steps: steps }));
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
                        if ((nm.tries.length > 0) && (0, termTryWith_1.isException)(nm.term)) {
                            // look for try/with with a rule that matches the exception
                            // if found, execute it's term
                            for (let i = nm.tries.length - 1; i >= 0; i--) {
                                const activeRule = nm.tries[i];
                                const tm = activeRule.machine.copyWith({ steps: steps });
                                const blockedTerm = Object.assign({}, activeRule.term, { term: nm.term });
                                const matchingRule = (0, termMatch_1.findMatchingRule)(tm, activeRule.term.rules, nm.term);
                                if (matchingRule.matchResult !== false && matchingRule.rule !== undefined) {
                                    if (matchingRule.resultOfGuard !== undefined) {
                                        if (matchingRule.resultOfGuard.blocked) {
                                            const blockedMatch = (0, termMatch_1.createBlockedRuleMatch)(matchingRule, nm.term, blockedTerm);
                                            return tm.copyWith({ term: blockedMatch, blocked: true, steps: steps });
                                        }
                                        else if (matchingRule.resultOfGuard.term !== true) {
                                            throw "unexpected guard value";
                                        }
                                    }
                                    const bindings = Object.assign({}, tm.bindings, matchingRule.matchResult);
                                    const resultOfRule = rewriteTerm(tm.copyWith({ term: matchingRule.rule.term, bindings: bindings, steps: steps }));
                                    if (!(resultOfRule.blocked)) {
                                        steps = stepsMinusOne(steps);
                                    }
                                    return tm.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: steps });
                                }
                            }
                        }
                    }
                    else {
                        // rewrite the properties of machine.term
                        let anyBlocked = false;
                        const nextTerm = {};
                        for (let p in m.term) {
                            nm = rewriteTerm(m.copyWith({ term: m.term[p], blocked: nm.blocked, steps: steps }));
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