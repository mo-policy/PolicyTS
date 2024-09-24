// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { Machine, MatchResult } from "./machine"
import { findMatchingRule } from "./termMatch";

/**
 * The top level rewrite function for all terms.
 * @param m     The input machine.
 * @returns     The output machine.
 */
export function rewriteTerm(m: Machine): Machine {
    if (m.blocked) {
        return m;
    } else {
        if (m.policies.length > 0) {
            // look for rule in each policy matching the current term
            // if none found, continue
            // else, evaluate and return the matching rule's term
            for (let i = 0; i < m.policies.length; i++) {
                const policy = m.policies[i];
                const matchingRule = findMatchingRule(policy.machine, policy.term.rules, m.term);
                if (matchingRule.matchResult !== false && matchingRule.rule !== undefined) {
                    if (matchingRule.resultOfGuard !== undefined) {
                        if (matchingRule.resultOfGuard.blocked) {
                            // to do, return a blocked match term
                            throw "guard blocked"
                        } else if (matchingRule.resultOfGuard.term !== true) {
                            throw "unexpected guard value"
                        }
                    }
                    const policies = m.policies.slice(0, i);
                    const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
                    const resultOfRule = rewriteTerm(policy.machine.copyWith({ term: matchingRule.rule.term, policies: policies, bindings: bindings }));
                    return policy.machine.copyWith({ term: resultOfRule.term });
                }
            }
        }
        if (Array.isArray(m.term)) {
            // rewrite the elements of machine.term
            const nextTerm = [];
            for (let i = 0; i < m.term.length; i++) {
                const nextMachine = rewriteTerm(m.copyWith({ term: m.term[i] }));
                nextTerm[i] = nextMachine.term;
            }
            return m.copyWith({ term: nextTerm });
        } else {
            const f = m.getRewriteFunction();
            if ((m.term !== null) && (typeof m.term === "object")) {
                if ("$policy" in m.term) {
                    return f(m);
                } else {
                    // rewrite the properties of machine.term
                    const nextTerm: { [k: string]: any } = {};
                    for (let p in m.term) {
                        let nextMachine = rewriteTerm(m.copyWith({ term: m.term[p] }));
                        nextTerm[p] = nextMachine.term;
                    }
                    return m.copyWith({ term: nextTerm });
                }
            } else {
                return f(m);
            }
        }
    }
}

export function matchTerm(m: Machine, pattern: any, value: any): MatchResult {
    const f = m.getMatchFunction(pattern);
    return f(pattern, value);
}

