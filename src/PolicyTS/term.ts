// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { match } from "assert";
import { Machine, MatchResult } from "./machine"
import { createBlockedRuleMatch, findMatchingRule, RuleTerm } from "./termMatch";
import { isParallel, rewriteParallel } from "./termParallel";

/**
 * The top level rewrite function for all terms.
 * @param m     The input machine.
 * @returns     The output machine.
 */
export function rewriteTerm(m: Machine): Machine {
    let nm = m;
    if (nm.steps === 0) {
        nm = nm.copyWith({ blocked: true });
    } else if (nm.blocked) {
        if (isParallel(nm.term)) {
            const resultOfTerm = rewriteParallel(nm.copyWith({ blocked: false }));
            nm = nm.copyWith({ term: resultOfTerm.term, steps: resultOfTerm.steps });
        }
    } else {
        let policyMatch = false;
        let steps = nm.steps;
        if (nm.policies.length > 0) {
            // look for rule in each policy matching the current term
            // if none found, continue
            // else, evaluate and return the matching rule's term
            for (let i = 0; i < nm.policies.length; i++) {
                const policy = nm.policies[i];
                const pm = policy.machine.copyWith({ steps: steps });
                const matchingRule = findMatchingRule(pm, policy.term.rules, nm.term);
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
                            const blockedMatch = createBlockedRuleMatch(matchingRule, nm.term, nm.term);
                            return m.copyWith({ term: blockedMatch, blocked: true, steps: steps })
                        } else if (matchingRule.resultOfGuard.term !== true) {
                            throw "unexpected guard value"
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
            } else {
                const f = nm.getRewriteFunction();
                if ((nm.term !== null) && (typeof nm.term === "object")) {
                    if ("$policy" in nm.term) {
                        nm = f(nm);
                    } else {
                        // rewrite the properties of machine.term
                        let anyBlocked = false;
                        const nextTerm: { [k: string]: any } = {};
                        for (let p in m.term) {
                            nm = rewriteTerm(m.copyWith({ term: m.term[p], steps: steps }));
                            steps = nm.steps;
                            anyBlocked = (anyBlocked || nm.blocked);
                            nextTerm[p] = nm.term;
                        }
                        nm = m.copyWith({ term: nextTerm, blocked: anyBlocked, steps: nm.steps });
                    }
                } else {
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

export function matchTerm(m: Machine, pattern: any, value: any): MatchResult {
    const f = m.getMatchFunction(pattern);
    return f(m, pattern, value);
}


export function stepsMinusOne(x: number): number {
    if (x > 0) {
        return x - 1;
    } else {
        return x;
    }
}
