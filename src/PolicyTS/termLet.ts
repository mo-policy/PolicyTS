// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Let Term

Used to bind a value to a name.

## Syntax

    {
        "$policy": "Let",
        "pattern": _term_,
        "term": _term_,
        "in": _term_
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
import { rewriteTerm, matchTerm, stepsMinusOne } from "./term"

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
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfBindingTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfBindingTerm.term });
    steps = resultOfBindingTerm.steps;
    if (resultOfBindingTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        const matchOfBinding = matchTerm(m, m.term.pattern, resultOfBindingTerm.term);
        if (matchOfBinding) {
            const nextBindings = Object.assign({}, m.bindings, matchOfBinding);
            const resultOfIn = rewriteTerm(m.copyWith({ term: m.term.in, bindings: nextBindings, steps: steps }));
            if (resultOfIn.blocked) {
                Object.assign(blockedTerm, { in: resultOfIn.term });
                return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
            } else {
                steps = stepsMinusOne(resultOfIn.steps);
                return m.copyWith({ term: resultOfIn.term, steps: steps });
            }
        } else {
            throw "binding failed"
        }
    }
}

/*
## Match Rules
*/
export function matchLet(m: Machine, pattern: any, value: any): MatchResult {
    // to do
    return false;
}