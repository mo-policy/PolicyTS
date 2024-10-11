// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# LetRec Term

Used to bind recursive values to names.

## Syntax

    {
        "$policy": "LetRec",
        "pattern": _term_,
        "term": _term_,
        "in": _term_
    }

## Example
    
    {
        "$policy": "LetRec",
        "pattern": { "$policy": "Lookup", "name": "f" },
        "term": {
            "$policy": "Function",
            "pattern": { "$policy": "Lookup", "name": "x" },
            "term": {
                "$policy": "If",
                "condition": { "$policy": "Lookup", "name": "x" },
                "then": 0,
                "else": {
                    "$policy": "Application",
                    "function": { "$policy": "Lookup", "name": "f" },
                    "arg": true
                }
            }
        },
        "in": {
            "$policy": "Application",
            "function": { "$policy": "Lookup", "name": "f" },
            "arg": false
        }
    }

    let rec f = fun x -> if x then 0 else f true in f false

## Schema

    "LetRecTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "LetRec"
            },
            "pattern": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" },
            "in": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "pattern", "term", "in" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm, stepsMinusOne } from "./term"
import { fixMatch } from "./termFix";
import { rewriteLet } from "./termLet";

export type LetRecTerm = {
    $policy: "Let",
    pattern: any,
    term: any,
    in: any
}

export function isLetRec(term: any): term is LetRecTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LetRec") &&
        ("pattern" in term) &&
        ("term" in term) &&
        ("in" in term) &&
        (Object.keys(term).length === 4);
}

/*
## Rewrite Rules

*/

export function rewriteLetRec(m: Machine): Machine {
    if (!(isLetRec(m.term))) { throw "expected LetRec"; };
    const matchResult = matchTerm(m, m.term.pattern, m.term.term);
    if (!matchResult) { throw "match failed" }
    if (Object.keys(matchResult).length !== 1) {
        // to do: investigate support for any pattern and term.
        throw "LetRec excpets only one name right now"
    }
    const name = Object.keys(matchResult)[0];
    const letTerm = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: name },
        term: {
            $policy: "Fix",
            term: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: name },
                term: matchResult[name]
            }
        },
        in: m.term.in
    };
    const steps = stepsMinusOne(m.steps);
    const letMachine = m.copyWith({ term: letTerm, steps: steps });
    return rewriteTerm(letMachine);
}

/*
## Match Rules
*/
export function matchLetRec(m: Machine, pattern: any, value: any): MatchResult {
    // to do
    return false;
}