// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Let Term

Used to bind a value to a name.

## Syntax

    {
        "$policy": "Let",
        "pattern": _term_,
        "term": _term_,
        "inTerm": _term_
    }

## Example
    
    {
        "$policy": "Let",
        "pattern": { "$policy": "Lookup", "name": "x" },
        "term": 1,
        "in": { "$policy": "Lookup", "name": "x" }
    }

    let x = 1 in x

## Schema

    "LetTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Let"
            },
            "pattern": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" },
            "in": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "pattern", "term", "in" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, matchTerm } from "./term"

export type LetTerm = {
    $policy: "Let",
    pattern: any,
    term: any,
    in: any
}

export function isLet(term: any): term is LetTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Let") &&
        ("pattern" in term) &&
        ("term" in term) &&
        ("in" in term) &&
        (Object.keys(term).length === 4);
}


/*
## Rewrite Rules

The term of the binding is evaluated bound to the associated 
pattern. See pattern matching. If the binding term blocks, then the 
let term reduces to another let term with the results of any unblocked 
binding term.

*/
export function rewriteLet(m: Machine): Machine {
    if (!(isLet(m.term))) { throw "expected Let"; };
    const resultOfBindingTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    if (resultOfBindingTerm.blocked) {
        // to do: return new LetTerm with blocked term
        return m;
    } else {
        const matchOfBinding = matchTerm(m, m.term.pattern, resultOfBindingTerm.term);
        if (matchOfBinding) {
            const nextBindings = Object.assign({}, m.bindings, matchOfBinding);
            const resultOfIn = rewriteTerm(m.copyWith({ term: m.term.in, bindings: nextBindings }));
            return m.copyWith({ term: resultOfIn.term });
        } else {
            throw "binding failed"
        }
    }
}

/*
## Match Rules
*/
export function matchLet(pattern: any, value: any): MatchResult {
    // to do
    return false;
}