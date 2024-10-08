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
import { rewriteTerm } from "./term";

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
export function matchRewrite(pattern: any, value: any): MatchResult {
    if (!(isRewrite(pattern))) { throw "expected Rewrite"; };
    // todo
    return false;
}
