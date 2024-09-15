// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Function Term

An function value term.

## Syntax

    {
        "$policy": "Function",
        "closure": object,
        "pattern": _term_,
        "term": _term_
    }

## Example
    
    {
        "$policy": "Function",
        "closure": { },
        "pattern": { "$policy": "Lookup", "name": "x" },
        "term": { "$policy": "Lookup", "name": "x" }
    }

    fun x -> x


## Schema

    "FunctionTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Function"
            },
            "closure": { "type": "object" },
            "pattern": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "pattern", "term" ]
    }

*/

import { Machine } from "./machine"
import { MatchResult } from "./term"

export type FunctionTerm = {
    $policy: "Function",
    closure?: { [k: string]: any },
    pattern: any,
    term: any
}

export function isFunction(term: any): term is FunctionTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Function") &&
        ("pattern" in term) &&
        ("term" in term))
    {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("closure" in term);
        }
    }
    return false;
}

/*
## Rewrite Rules

Function terms reduce to a function value with any associated closure bindings.
Function bindings block if any of the closure bindings are blocked.

*/
export function rewriteFunction(m: Machine): Machine {
    if (!(isFunction(m.term))) { throw "expected Function"; };
    if (Object.keys(m.bindings).length === 0) {
        return m;
    } else {
        // to do: filter closure to only free variables in function.
        const cb = Object.assign({}, m.bindings);
        const f = Object.assign({}, m.term, { closure: cb });
        return m.copyWith({ term: f });
    }
}

/*
## Match Rules
*/
export function matchFunction(pattern: any, value: any): MatchResult {
    // to do
    return false;
}