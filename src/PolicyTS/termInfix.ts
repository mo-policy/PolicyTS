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
import { rewriteTerm, stepsMinusOne } from "./term";

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
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    let result = undefined;
    const resultOfLeft = rewriteTerm(m.copyWith({ term: m.term.left }));
    Object.assign(blockedTerm, { left: resultOfLeft.term });
    steps = resultOfLeft.steps;
    if (resultOfLeft.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        if (m.term.operator === "&&") {
            if (resultOfLeft.term) {
                const resultOfRight = rewriteTerm(m.copyWith({ term: m.term.right, steps: steps }));
                Object.assign(blockedTerm, { right: resultOfRight.term });
                steps = resultOfRight.steps;
                if (resultOfRight.blocked) {
                    return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
                } else {
                    result = resultOfRight.term;
                }
            } else {
                result = false;
            }
        } else if (m.term.operator === "||") {
            if (resultOfLeft.term) {
                result = true;
            } else {
                const resultOfRight = rewriteTerm(m.copyWith({ term: m.term.right, steps: steps }));
                Object.assign(blockedTerm, { right: resultOfRight.term });
                steps = resultOfRight.steps;
                if (resultOfRight.blocked) {
                    return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
                } else {
                    result = resultOfRight.term;
                }
            }
        } else {
            const resultOfRight = rewriteTerm(m.copyWith({ term: m.term.right, steps: steps }));
            Object.assign(blockedTerm, { right: resultOfRight.term });
            steps = resultOfRight.steps;
            if (resultOfRight.blocked) {
                return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
            } else {
                switch (m.term.operator) {
                    case "=":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) === 0); break;
                    case "<>":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) !== 0); break;
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
                    case "^":
                        result = resultOfLeft.term ^ resultOfRight.term; break;
                    case "/":
                        result = resultOfLeft.term / resultOfRight.term; break;
                    case "%":
                        result = resultOfLeft.term % resultOfRight.term; break;
                    default:
                        throw "unknown operator"
                }
            }
        }
    }
    if (result === undefined) {
        throw "undefined"
    } else {
        steps = stepsMinusOne(steps);
    }
    return rewriteTerm(m.copyWith({ term: result, steps: steps }));
}
