// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Quote Term

A constant term holds a fully reduced value.

## Syntax
    
    {
        "$policy": "Quote",
        "quote": _any_
    }

## Example
    
    {
        $policy": "Quote",
        "quote": { $policy: "Lookup", name: "x" }
    }

    {@ x @}

## Schema

    "QuoteTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Quote"
            },
            "quote": true
        },
        "required": [ "$policy", "quote" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm } from "./term";

/**
 * The QuoteTerm wraps a value which is fully reduced. 
 */
export type QuoteTerm = {
    $policy: "Quote",
    quote: any
}

export function isQuote(term: any): term is QuoteTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Quote") &&
        ("quote" in term) &&
        (Object.keys(term).length === 2);
}

/**
 * Tests if a term meets the requirements for a ConstantTerm.
 * @param term      The term to test against the requirements of a ConstantTerm.
 * @returns         True if term is a ConstantTerm, otherwise false.
 */
export function isConstant(term: any): boolean {
    if (isQuote(term)) {
        return true;
    } else {
        return !((term !== null) && (typeof term === "object") && ("$policy" in term));
    }
}

/*
## Rewrite Rules

Quote terms are in fully reduced form. The rewrite function is simply a no op.
*/

export function rewriteQuote(m: Machine): Machine {
    if (!(isQuote(m.term))) { throw "expected Quote"; };
    return m;
}

export function rewriteConstant(m: Machine): Machine {
    if (!(isConstant(m.term))) { throw "expected Constant"; };
    return m;
}

/*
## Match Rules


*/

export function matchQuote(m: Machine, pattern: any, value: any): MatchResult {
    if (isQuote(pattern)) {
        if (pattern.quote === value) {
            return {};
        } else {
            return false;
        }
    }
    return false;
}

export function matchConstant(m: Machine, pattern: any, value: any): MatchResult {
    if (pattern === null) {
        if (value === null) {
            return {};
        }
    } else if (Array.isArray(pattern)) {
        if (Array.isArray(value) && pattern.length === value.length) {
            let allMatched = true;
            let arrayResult: MatchResult = {};
            for (let i = 0; i < pattern.length; i++) {
                if (allMatched) {
                    const itemResult = matchTerm(m, pattern[i], value[i]);
                    if (itemResult === false) {
                        allMatched = false;
                    } else {
                        arrayResult = Object.assign(arrayResult, itemResult);
                    }
                } else {
                    break;
                }
            }
            if (allMatched) {
                return arrayResult;
            }
        }
    } else if (typeof pattern === "object") {
        let allMatched = true;
        let mapResult: MatchResult = {};
        for (const p in pattern) {
            if (p in value) {
                if (allMatched) {
                    const elementResult = matchTerm(m, pattern[p], value[p]);
                    if (elementResult === false) {
                        allMatched = false;
                    } else {
                        mapResult = Object.assign(mapResult, elementResult);
                    }
                } else {
                    break;
                }
            }
        }
        if (allMatched) {
            return mapResult;
        }
    } else {
        if (m.compare(pattern, value) === 0) {
            return {};
        }
    }
    return false;
}

