// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Infix Term

The infix term applies a binary operator to left and right terms.

## Syntax
    
    {
        "$policy": "Infix",
        "operator": string,
        "left": _term_,
        "right": _term_
    }

## Example
    
    {
        $policy": "Infix",
        "operator": "+"
        "left": 1
        "right": 2
    }

    1 + 2

## Schema

    "InfixTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Infix"
            },
            "operator": { "type": "string" },
            "left": { "$ref": "#/$defs/Term" },
            "right": { "$ref": "#/$defs/Term" }
        }
    },
    "required": [ "$policy", "operator", "left", "right" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm } from "./term";

export type InfixTerm = {
    $policy: "Infix",
    operator: string,
    left: any,
    right: any
}

export function isInfix(term: any): term is InfixTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Infix") &&
        ("operator" in term) && (typeof term.operator === "string") &&
        ("left" in term) &&
        ("right" in term) &&
        (Object.keys(term).length === 4);
}

/*
## Rewrite Rules

rewrite left
rewrite right
< <= = >= >
+, -, *, /, %
&& ||

*/
export function rewriteInfix(m: Machine): Machine {
    if (!(isInfix(m.term))) { throw "expected InfixTerm"; };
    const resultOfLeft = rewriteTerm(m.copyWith({ term: m.term.left }));
    if (resultOfLeft.blocked) {
        throw "blocked"
    }
    const resultOfRight = rewriteTerm(m.copyWith({ term: m.term.right }));
    if (resultOfRight.blocked) {
        throw "blocked"
    }
    let result = undefined;
    switch (m.term.operator) {
        case "=":
            result = (m.compare(resultOfLeft.term, resultOfRight.term) === 0); break;
        case "<":
            result = (m.compare(resultOfLeft.term, resultOfRight.term) < 0); break;
        case ">":
            result = (m.compare(resultOfLeft.term, resultOfRight.term) > 0); break;
        case "<=":
            result = (m.compare(resultOfLeft.term, resultOfRight.term) <= 0); break;
        case ">=":
            result = (m.compare(resultOfLeft.term, resultOfRight.term) >= 0); break;
        case "+":
            result = resultOfLeft.term + resultOfRight.term; break;
        case "-":
            result = resultOfLeft.term - resultOfRight.term; break;
        case "*":
            result = resultOfLeft.term * resultOfRight.term; break;
        case "/":
            result = resultOfLeft.term / resultOfRight.term; break;
        case "%":
            result = resultOfLeft.term % resultOfRight.term; break;
        case "&&":
            result = resultOfLeft.term && resultOfRight.term; break;
        case "||":
            result = resultOfLeft.term || resultOfRight.term; break;
        default:
            throw "unknown operator"
    }
    if (result === undefined) {
        throw "undefined"
    }
    return m.copyWith({ term: result });
}


/*
## Match Rules


*/
export function matchInfix(pattern: any, value: any): MatchResult {
    if (!(isInfix(pattern))) { throw "expected Infix"; };
    // todo
    return false;
}
