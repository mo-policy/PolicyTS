// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Term for references.

Allocation, dereferencing, and assignment.

## Syntax
    
    {
        "$policy": "Ref",
        "value": _term_
    }

    {
        "$policy": "Dereference",
        "ref": _term_
    }

    {
        "$policy": "Assignment",
        "ref": _term_,
        "value": _term_
    }

## Example
    
    {
        "$policy": "Ref",
        "value": 5
    }

    r = ref 5;

    {
        "$policy": "Dereference",
        "ref": { "$policy": "Lookup", "name": "r" }
    }

    !r;

    {
        "$policy": "Assignment",
        "ref": { "$policy": "Lookup", "name": "r" },
        "value": 7
    }

    r := 7;

## Schema

    "RefTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Ref"
            },
            "value": { "$ref": "#/$defs/Term" }
        }
        "required": [ "$policy", "value" ]
    }

    "DereferenceTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Dereference"
            },
            "ref": { "$ref": "#/$defs/Term" }
        }
        "required": [ "$policy", "ref" ]
    }

    "AssignmentTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Assignment"
            },
            "ref": { "$ref": "#/$defs/Term" },
            "value": { "$ref": "#/$defs/Term" }
        }
        "required": [ "$policy", "ref", "value" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, stepsMinusOne } from "./term"

export type RefTerm = {
    $policy: "Ref",
    value: any
}

export type DereferenceTerm = {
    $policy: "Dereference",
    ref: any
}

export type AssignmentTerm = {
    $policy: "Assignment",
    ref: any,
    value: any
}

export function isRef(term: any): term is RefTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Ref") &&
        ("value" in term) &&
        (Object.keys(term).length === 2);
}

export function isDereference(term: any): term is DereferenceTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Dereference") &&
        ("ref" in term) &&
        (Object.keys(term).length === 2);
}

export function isAssignment(term: any): term is AssignmentTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Assignment") &&
        ("ref" in term) &&
        ("value" in term) &&
        (Object.keys(term).length === 3);
}

/*
## Rewrite Rules

    Ref: Evaluate value term and return RefTerm.

    Dereference: Evaluate ref term and return value.

    Assignment: Evaluate ref term, value term and update ref with value.

*/
export function rewriteRef(m: Machine): Machine {
    if (!(isRef(m.term))) { throw "expected RefTerm"; };
    const resultOfValue = rewriteTerm(m.copyWith({ term: m.term.value }));
    m.term.value = resultOfValue.term;
    return m.copyWith({ term: m.term, blocked: resultOfValue.blocked });
}

export function rewriteDereference(m: Machine): Machine {
    if (!(isDereference(m.term))) { throw "expected DereferenceTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfRef = rewriteTerm(m.copyWith({ term: m.term.ref }));
    Object.assign(blockedTerm, { term: resultOfRef.term });
    steps = resultOfRef.steps;
    if (resultOfRef.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (!isRef(resultOfRef.term)) { throw "Expected Ref" }
    return m.copyWith({ term: resultOfRef.term.value, steps: steps });
}
export function rewriteAssignment(m: Machine): Machine {
    if (!(isAssignment(m.term))) { throw "expected AssignmentTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfRef = rewriteTerm(m.copyWith({ term: m.term.ref }));
    Object.assign(blockedTerm, { ref: resultOfRef.term });
    steps = resultOfRef.steps;
    if (resultOfRef.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (!isRef(resultOfRef.term)) { throw "Expected Ref" }
    const resultOfValue = rewriteTerm(m.copyWith({ term: m.term.value, steps: steps }));
    Object.assign(blockedTerm, { value: resultOfValue.term });
    steps = resultOfRef.steps;
    if (resultOfValue.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    resultOfRef.term.value = resultOfValue.term;
    steps = stepsMinusOne(steps);
    return m.copyWith({ term: null, steps: steps });
}
