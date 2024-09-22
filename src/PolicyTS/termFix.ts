// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Fix Term

Fixed point.

## Syntax

    {
        "$policy": "Fix",
        "term": _term_
    }

## Example
    
    {
        "$policy": "Fix",
        "term": ...
    }

    fix (...)

## Schema

    "FixTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Fix"
            },
            "term": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "term" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, matchTerm } from "./term"
import { isFunction } from "./termFunction";

export type FixTerm = {
    $policy: "Fix",
    term: any
}
export function isFix(term: any): term is FixTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Fix") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}


/*
## Rewrite Rules

*/

export function fixMatch(m: Machine, pattern: any, term: any): MatchResult {
    const matchResult = matchTerm(m, pattern, term);
    if (!matchResult) { return false; }
    let fixBindings: { [k: string]: any } = {};
    for (const p in matchResult) {
        fixBindings[p] = {
            $policy: "Fix",
            term: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: p },
                term: matchResult[p]
            }
        };
    }
    return fixBindings;
}

export function rewriteFix(m: Machine): Machine {
    if (!(isFix(m.term))) { throw "expected Fix"; };
    if (isFunction(m.term.term)) {
        const f = m.term.term;
        const fixBindings = fixMatch(m, f.pattern, f.term);
        const bindings = Object.assign({}, m.bindings, fixBindings);
        const mFix = m.copyWith({ term: f.term, bindings: bindings });
        return rewriteTerm(mFix);
    } else {
        const resultOfFixTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
        const nextFix = {
            $policy: "Fix",
            term: resultOfFixTerm.term
        };
        return m.copyWith({ term: nextFix });
    }
}

/*
## Match Rules
*/
export function matchFix(pattern: any, value: any): MatchResult {
    // to do
    return false;
}