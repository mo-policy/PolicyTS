// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Let Term

Used to bind a value to a name.

## Syntax

    {
        "$policy": "Let",
        "binding": _PatternBinding_,
        "inTerm": _term_,
    }

    {
        "$policy": "PatternBinding",
        "pattern": _term_,
        "term": _term_
    }

## Example
    
    {
        "$policy": "Let",
        "binding": {
            "$policy": "PatternBinding",
            "pattern": { "$policy": "Lookup", "name": "x" },
            "term": 1
        },
        "inTerm": { "$policy": "Lookup", "name": "x" }
    }

    let x = 1 in x

## Schema

    "LetTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Let"
            },
            "binding": { "$ref": "#/$defs/PatternBindingTerm" },
            "in": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "binding", "in" ]
    }

    "PatternBindingTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "PatternBinding"
            },
            "pattern": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "mutable", "pattern", "term" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, matchTerm } from "./term"

export type PatternBindingTerm = {
    $policy: "PatternBinding",
    pattern: any,
    term: any
}

export type LetTerm = {
    $policy: "Let",
    binding: PatternBindingTerm,
    in: any
}
export function isPatternBinding(pb: any): pb is PatternBindingTerm {
    return (pb !== undefined) &&
        (typeof pb === "object") &&
        ("$policy" in pb) && (pb.$policy === "PatternBinding") &&
        ("pattern" in pb) &&
        ("term" in pb) &&
        (Object.keys(pb).length === 3);
}

export function isLet(term: any): term is LetTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Let") &&
        ("binding" in term) && (isPatternBinding(term.binding)) &&
        ("in" in term) &&
        (Object.keys(term).length === 3);
}


/*
## Rewrite Rules

The term of the binding is evaluated bound to the associated 
pattern. See pattern matching. If the binding term blocks, then the 
let term reduces to another let term with the results of any unblocked 
binding term.

*/
export function rewriteLet(m: Machine): Machine {
    if (!(isLet(m.term))) { throw "expected Let"; };
    const resultOfBindingTerm = rewriteTerm(m.copyWith({ term: m.term.binding.term }));
    if (resultOfBindingTerm.blocked) {
        // to do: return new LetTerm with blocked term
        return m;
    } else {
        const matchOfBinding = matchTerm(m, m.term.binding.pattern, resultOfBindingTerm.term);
        if (matchOfBinding) {
            const nextBindings = Object.assign({}, m.bindings, matchOfBinding);
            return rewriteTerm(m.copyWith({ term: m.term.in, bindings: nextBindings }));
        } else {
            throw "binding failed"
        }
    }
}

/*
## Match Rules
*/
export function matchLet(pattern: any, value: any): MatchResult {
    // to do
    return false;
}