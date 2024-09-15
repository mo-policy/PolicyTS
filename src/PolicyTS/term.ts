// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { Machine } from "./machine"
import { rewriteConstant } from "./termConstant"

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
            return m;
    }
    
}