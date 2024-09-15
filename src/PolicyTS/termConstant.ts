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

import { Machine } from "./machine"

/**
 * The ConstantTerm wraps a value which is fully reduced. 
 */
export type ConstantTerm = {
    $policy: "Constant",
    value: any
}

export function isWrappedConstant(term: any): boolean {
    return (term !== undefined) &&
        (typeof term === "object") &&
        ("$policy" in term) &&
        ("value" in term) &&
        (Object.entries(term).length === 2) &&
        (term.$policy === "Constant");
}

/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
export function isConstant(term: any): term is ConstantTerm {
    if (term !== undefined) {
        if ((typeof term === "object") && ("$policy" in term)) {
            return isWrappedConstant(term);
        } else {
            return true;
        }
    } else {
        return false;
    }
}

/*
## Rewrite Rules

Constant terms are in fully reduced form. The rewrite function is simply a no op.
*/
export function rewriteConstant(m: Machine): Machine {
    if (!(isConstant(m.term))) { throw "expected ConstantTerm"; };
    return m;
}

/*
## Match Rules


*/
export function matchConstant(pattern: any, value: any): ({ readonly [k: string]: ConstantTerm } | boolean) {
    return (pattern === value);
}

