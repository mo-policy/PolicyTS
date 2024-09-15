// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { Machine } from "./machine"
import { rewriteConstant, matchConstant } from "./termConstant"
import { rewriteFunction, matchFunction } from "./termFunction"
import { rewriteLet, matchLet } from "./termLet"
import { rewriteLookup, matchLookup } from "./termLookup"

/**
 * The top level rewrite function for all terms.
 * @param m     The input machine.
 * @returns     The output machine.
 */
export function rewriteTerm(m: Machine): Machine {
    if (m.blocked) {
        return m;
    } else {
        if (Array.isArray(m.term)) {
            // rewrite the elements of machine.term
            const nextTerm = [];
            for (let i = 0; i < m.term.length; i++) {
                const nextMachine = rewriteTerm(m.copyWith({ term: m.term[i] }));
                nextTerm[i] = nextMachine.term;
            }
            return m.copyWith({ term: nextTerm });
        } else if ((m.term !== null) && (typeof m.term === "object")) {
            if ("$policy" in m.term) {
                switch (m.term.$policy) {
                    case "Constant": return rewriteConstant(m);
                    case "Function": return rewriteFunction(m);
                    case "Let": return rewriteLet(m);
                    case "Lookup": return rewriteLookup(m);
                }
                throw "Unexpected term";
            } else {
                // rewrite the properties of machine.term
                const nextTerm: { [k: string]: any } = {};
                for (let p in m.term) {
                    let nextMachine = rewriteTerm(m.copyWith({ term: m.term[p] }));
                    nextTerm[p] = nextMachine.term;
                }
                return m.copyWith({ term: nextTerm });
            }
        } else 
            return rewriteConstant(m);
    }
}

export type MatchResult = ({ readonly [k: string]: any } | false)
export function matchTerm(pattern: any, value: any): MatchResult {
    if ((pattern !== null) && (typeof pattern === "object") && ("$policy" in pattern)) {
        switch (pattern.$policy) {
            case "Constant": return matchConstant(pattern, value);
            case "Function": return matchFunction(pattern, value);
            case "Let": return matchLet(pattern, value);
            case "Lookup": return matchLookup(pattern, value);
        }
        throw "unexpected pattern"
    } else {
        return matchConstant(pattern, value);
    }
}

