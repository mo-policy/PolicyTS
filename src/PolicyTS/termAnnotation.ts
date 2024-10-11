// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Annotation Term

Tests if a term is of a given type.

## Syntax
    
    {
        "$policy": "Annotation",
        "term": _term_,
        "type": _type_
    }

## Example
    
    {
        $policy": "Annotation",
        "term": "1"
        "type": "number"
    }

    (1 : number)

## Schema

    "AnnotationTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Annotation"
            },
            "term": { "$ref": "#/$defs/Term" },
            "type": { "$ref": "#/$defs/Type" }
        }
    },
    "required": [ "$policy", "term", "type" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, stepsMinusOne } from "./term";

export type AnnotationTerm = {
    $policy: "Annotation",
    term: any,
    type: any
}

export function isAnnotation(term: any): term is AnnotationTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Annotation") &&
        ("term" in term) &&
        ("type" in term) &&
        (Object.keys(term).length === 3);
}

/*
## Rewrite Rules

rewrite term
if type is string, 
    any of DID value types

*/
export function rewriteAnnotation(m: Machine): Machine {
    if (!(isAnnotation(m.term))) { throw "expected AnnotationTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    let result = resultOfTerm.term;
    if (typeof m.term.type === "string") {
        let exception = {
            $policy: "Exception",
            term: "type error"
        }
        if (resultOfTerm.term === null) {
            if (m.term.type !== "null") {
                result = exception;
            }
        } else {
            switch (m.term.type) {
                case "map":
                    if (!(typeof resultOfTerm.term === "object")) {
                        result = exception;
                    }
                    break;
                case "set":
                    if (!(typeof resultOfTerm.term === "object")) {
                        result = exception;
                    }
                    break;
                case "list":
                    if (!(Array.isArray(resultOfTerm.term))) {
                        result = exception;
                    }
                    break;
                case "datetime":
                    if (!(resultOfTerm.term instanceof Date)) {
                        result = exception;
                    }
                    break;
                case "string":
                    if (!(typeof resultOfTerm.term === "string")) {
                        result = exception;
                    }
                    break;
                case "integer":
                    if (!
                        (((typeof resultOfTerm.term === "number") && (Number.isInteger(resultOfTerm.term)))
                        || (typeof resultOfTerm.term === "bigint"))
                    ) {
                        result = exception;
                    }
                    break;
                case "double":
                    // relies on integer case above this.
                    if (!(typeof (resultOfTerm.term) === "number")) {
                        result = exception;
                    }
                    break;
                case "boolean":
                    if (!(typeof (resultOfTerm.term) === "boolean") && (Number.isInteger(resultOfTerm.term))) {
                        result = exception;
                    }
                    break;
                default:
                    result = exception;
                    break;
            }
        }
    }
    steps = stepsMinusOne(steps);
    return m.copyWith({ term: result, steps: steps });
}


/*
## Match Rules


*/
export function matchAnnotation(m: Machine, pattern: any, value: any): MatchResult {
    if (!(isAnnotation(pattern))) { throw "expected Annotation"; };
    // todo
    return false;
}
