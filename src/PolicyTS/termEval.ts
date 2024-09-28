// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Eval Term

The eval term is used to execute dynamic code.

## Syntax
    
    {
        "$policy": "Eval",
        "code": _term_
    }

## Example
    
    {
        $policy": "Eval",
        "code": { $policy: "Lookup", name: "x" }
    }

    {= "x" =}

## Schema

    "EvalTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Eval"
            },
            "code": { "$ref": "#/$defs/Term" }
        }
    },
    "required": [ "$policy", "code" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm } from "./term";

export type EvalTerm = {
    $policy: "Eval",
    code: any
}

export function isEval(term: any): term is EvalTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Eval") &&
        ("code" in term) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules

Rewrite term.code
if blocked, return blocked eval
Rewrite result of term.code

*/
export function rewriteEval(m: Machine): Machine {
    if (!(isEval(m.term))) { throw "expected EvalTerm"; };
    const resultOfCode = rewriteTerm(m.copyWith({ term: m.term.code }));
    if (resultOfCode.blocked) {
        throw "blocked"
    }
    const resultOfEval = rewriteTerm(m.copyWith({ term: resultOfCode.term }));
    return m.copyWith({ term: resultOfEval.term });
}


/*
## Match Rules


*/
export function matchEval(pattern: any, value: any): MatchResult {
    if (!(isEval(pattern))) { throw "expected Eval"; };
    // todo
    return false;
}
