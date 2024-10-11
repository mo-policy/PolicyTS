// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Rewrite Term

The rewrite term is used to execute dynamic code.

## Syntax
    
    {
        "$policy": "Rewrite",
        "code": _term_
    }

## Example
    
    {
        $policy": "Rewrite",
        "code": { $policy: "Lookup", name: "x" }
    }

    {= "x" =}

## Schema

    "RewriteTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Rewrite"
            },
            "code": { "$ref": "#/$defs/Term" }
        }
    },
    "required": [ "$policy", "code" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, stepsMinusOne } from "./term";

export type RewriteTerm = {
    $policy: "Rewrite",
    code: any
}

export function isRewrite(term: any): term is RewriteTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Rewrite") &&
        ("code" in term) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules

Rewrite term.code
if blocked, return blocked rewrite
Rewrite result of term.code

*/
export function rewriteRewrite(m: Machine): Machine {
    if (!(isRewrite(m.term))) { throw "expected RewriteTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfCode = rewriteTerm(m.copyWith({ term: m.term.code }));
    Object.assign(blockedTerm, { code: resultOfCode.term });
    steps = resultOfCode.steps;
    if (resultOfCode.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    const resultOfEval = rewriteTerm(m.copyWith({ term: resultOfCode.term, steps: steps }));
    if (!(resultOfEval.blocked)) {
        steps = stepsMinusOne(resultOfEval.steps);
    }    
    return m.copyWith({ term: resultOfEval.term, blocked: resultOfEval.blocked, steps: steps });
}
