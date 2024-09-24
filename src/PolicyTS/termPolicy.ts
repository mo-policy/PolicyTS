// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Policy Term

Branch if the current term matches a rule.

## Syntax
    
    {
        "$policy": "Policy",
        "term": _term_,
        "rules": _rules_
    }

## Example
    
    {
        $policy": "Policy",
        "term": 1,
        "rules": [
            {
                "$policy": "Rule",
                "pattern": 1,
                "term": 2
            }
        ]
    }

    policy 1 with
    | 1 -> 2

## Schema

    "MatchTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Policy"
            },
            "term": { "$ref": "#/$defs/Term" },
            "rules": {
                "type": "array",
                "items": { "$ref": "#/$defs/Rule" }
            }
        },
        "required": [ "$policy", "term", "rules" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm } from "./term";
import { RuleTerm, isRule } from "./termMatch";

export type PolicyTerm = {
    $policy: "Policy",
    term: any,
    rules: RuleTerm[]
}

export function isPolicy(term: any): term is PolicyTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Match") &&
        ("term" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))
    ) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!(isRule(term.rules[i]))) {
                return false;
            }
        }
    }
    return true;
}

/*
## Rewrite Rules



*/
export function rewritePolicy(m: Machine): Machine {
    if (!(isPolicy(m.term))) { throw "expected PolicyTerm"; };
    return m;
}


/*
## Match Rules


*/
export function matchPolicy(pattern: any, value: any): MatchResult {
    if (!(isPolicy(pattern))) { throw "expected Policy"; };
    // to do
    return false;
}