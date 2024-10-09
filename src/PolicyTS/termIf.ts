// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# If Term

A term for evaluation based on a boolean condition.

## Syntax
    
    {
        "$policy": "If",
        "condition": _term_,
        "then": _term_,
        "else": _term_
    }

## Example
    
    {
        $policy": "If",
        "condition": true,
        "then": 1
        "else": 2
    }

    if true then 1 else 2

## Schema

    "IfTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "If"
            },
            "condition": true,
            "then": true,
            "else": true
        }
    },
    "required": [ "$policy", "condition", "then" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm } from "./term"

export type IfTerm = {
    $policy: "If",
    condition: any,
    then: any,
    else?: any
}

export function isIf(term: any): term is IfTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "If") &&
        ("condition" in term) &&
        ("then" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("else" in term);
        }
    }
    return false;
}

/*
## Rewrite Rules

First the condition is reduced. If it blocks a new If term is returned with 
the reduced portion of the condition. If it does not block, the result
must be either true or false. If true, the result of reducing the 'then' is returned.
If false, then if there is an 'else', that is reduced and returned, otherwise 
the value null is returned.
*/
export function rewriteIf(m: Machine): Machine {
    if (!(isIf(m.term))) { throw "expected IfTerm"; };
    const resultOfCondition = rewriteTerm(m.copyWith({ term: m.term.condition }));
    if (resultOfCondition.blocked) {
        // to do, return new IfTerm
        throw "condition blocked"
    } else {
        if (typeof resultOfCondition.term === "boolean") {
            if (resultOfCondition.term) {
                return rewriteTerm(m.copyWith({ term: m.term.then }));
            } else {
                if ("else" in m.term) {
                    return rewriteTerm(m.copyWith({ term: m.term.else }));
                } else {
                    return m.copyWith({ term: null });
                }
            }
        } else {
            throw "condition not boolean"
        }
    }
}
