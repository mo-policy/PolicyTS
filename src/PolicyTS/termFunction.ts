// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Function Term

An function value term.

## Syntax

    {
        "$policy": "Function",
        "closure": object,
        "pattern": _term_,
        "term": _term_
    }

## Example
    
    {
        "$policy": "Function",
        "closure": { },
        "pattern": { "$policy": "Lookup", "name": "x" },
        "term": { "$policy": "Lookup", "name": "x" }
    }

    fun x -> x


## Schema

    "FunctionTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Function"
            },
            "closure": { "type": "object" },
            "pattern": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "pattern", "term" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { stepsMinusOne } from "./term";
import { isLet } from "./termLet";
import { isLookup } from "./termLookup";

export type FunctionTerm = {
    $policy: "Function",
    closure?: { [k: string]: any },
    pattern: any,
    term: any
}

export function isFunction(term: any): term is FunctionTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Function") &&
        ("pattern" in term) &&
        ("term" in term))
    {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("closure" in term);
        }
    }
    return false;
}

export function freenames(bound: { [k: string]: any }, fn: { [k: string]: any }, term: any): { [k: string]: any } {
    let nfn = fn;
    let nb = bound;
    if (term !== null) {
        if (Array.isArray(term)) {
            for (let i = 0; i < term.length; i++) {
                nfn = freenames(nb, nfn, term[i]);
            }
        } else if (typeof term === "object") {
            if (isLookup(term)) {
                if (!(term.name in bound)) {
                    nfn = Object.assign({}, nfn);
                    nfn[term.name] = null;
                }
            } else if (isLet(term)) {
                nfn = freenames(nb, nfn, term.term);        // get freenames of let.term
                nb = freenames(nb, nb, term.pattern);       // get names (as bound) of let.pattern
                nfn = freenames(nb, nfn, term.in);          // get freenames of let.in
            } else if (isFunction(term)) {
                nb = freenames(nb, nb, term.pattern);       // get names (as bound) of fun.pattern
                nfn = freenames(nb, nfn, term.term);        // get freenames of fun.term
            } else {
                for (const p in term) {
                    nfn = freenames(nb, nfn, term[p]);
                }
            }
        }
    }
    return nfn;
}

/*
## Rewrite Rules

Function terms reduce to a function value with any associated closure bindings.
Function bindings block if any of the closure bindings are blocked.

*/
export function rewriteFunction(m: Machine): Machine {
    if (!(isFunction(m.term))) { throw "expected Function"; };
    if (("closure" in m.term) || (Object.keys(m.bindings).length === 0)) {
        return m;
    } else {
        const fn = freenames({}, {}, m.term);
        const cb: { [k: string]: any } = {};
        for (const p in fn) {
            if (p in m.bindings) {
                cb[p] = m.bindings[p];
            }
        }
        const f = Object.assign({}, m.term, { closure: cb });
        const steps = stepsMinusOne(m.steps);
        return m.copyWith({ term: f, steps: steps });
    }
}

/*
## Match Rules
*/
export function matchFunction(m: Machine, pattern: any, value: any): MatchResult {
    // to do
    return false;
}