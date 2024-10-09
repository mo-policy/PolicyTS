// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# As Pattern Term

A pattern term for binding a pattern match to a name.

## Syntax
    
    {
        "$policy": "AsPattern",
        "term": _term_,
        "name": string
    }

## Example
    
    {
        $policy": "AsPattern",
        "term": 1,
        "as": "x"
    }

    1 as x

## Schema

    "AsPatternTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "AsPattern"
            },
            "term": true,
            "name": { "type": "string" }
        }
    },
    "required": [ "$policy", "term", "name" ]

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm } from "./term"

export type AsPatternTerm = {
    $policy: "AsPattern",
    term: any,
    name: string
}

export function isAsPattern(term: any): term is AsPatternTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "AsPattern") &&
        ("term" in term) &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 3);
}

/*
## Rewrite Rules

*/
export function rewriteAsPattern(m: Machine): Machine {
    if (!(isAsPattern(m.term))) { throw "expected AsPatternTerm"; };
    throw "as pattern not executable"
}

/*
## Match Rules
*/
export function matchAsPattern(m: Machine, pattern: any, value: any): MatchResult {
    if (!(isAsPattern(pattern))) { throw "expected AsPattern"; };
    const matchResult = matchTerm(m, pattern.term, value);
    if (matchResult === false) {
        return false;
    } else {
        let r: { [k: string]: any } = {};
        if (pattern.name !== "_") {
            r[pattern.name] = value;
        }
        return r;
    }
}
