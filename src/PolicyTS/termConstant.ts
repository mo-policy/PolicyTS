// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Constant Term

A constant term holds a fully reduced value.

## Syntax
    
    {
        "$policy": "Constant",
        "value": _any_
    }

## Example
    
    {
        $policy": "Constant",
        "value": "hello"
    }

    "hello"

## Schema

    "ConstantTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Constant"
            },
            "value": true
        },
        "required": [ "$policy", "value" ]
    }

*/

import { Machine, MatchResult } from "./machine"

/**
 * The ConstantTerm wraps a value which is fully reduced. 
 */
export type ConstantTerm = {
    $policy: "Constant",
    value: any
}

export function isWrappedConstant(term: any): term is ConstantTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Constant") &&
        ("value" in term) &&
        (Object.keys(term).length === 2);
}

/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
export function isConstant(term: any): boolean {
    if (isWrappedConstant(term)) {
        return true;
    } else {
        return !((term !== null) && (typeof term === "object") && ("$policy" in term));
    }

}

/*
## Rewrite Rules

Constant terms are in fully reduced form. The rewrite function is simply a no op.
*/
export function rewriteConstant(m: Machine): Machine {
    if (!(isConstant(m.term))) { throw "expected Constant"; };
    return m;
}

/*
## Match Rules


*/
export function matchConstant(pattern: any, value: any): MatchResult {
    if (isWrappedConstant(pattern)) {
        if (pattern.value === value) {
            return {};
        } else {
            return false;
        }
    } else {
        if (pattern === value) {
            return {};
        } else {
            return false;
        }
    }
}

