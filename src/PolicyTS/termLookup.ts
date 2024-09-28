// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Lookup Term

The lookup term is used to refer to the value bound to a name.

## Syntax
    
    {
        "$policy": "Lookup",
        "name": string
    }

## Example
    
    {
        $policy": "Lookup",
        "name": "x"
    }

    x

## Schema

    "LookupTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Lookup"
            },
            "name": { "type": "string" }
        }
    },
    "required": [ "$policy", "name" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm } from "./term";
import { isConstant } from "./termQuote";
import { isFunction } from "./termFunction";

export type LookupTerm = {
    $policy: "Lookup",
    name: string
}

export type LookupMemberTerm = {
    $policy: "LookupMember",
    term: any,
    member: any
}

export type LookupIndexTerm = {
    $policy: "LookupIndex",
    term: any,
    index: any
}

export function isLookup(term: any): term is LookupTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Lookup") &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 2);
}

export function isLookupMember(term: any): term is LookupMemberTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LookupMember") &&
        ("term" in term) &&
        ("member" in term) && 
        (Object.keys(term).length === 3);
}

export function isLookupIndex(term: any): term is LookupIndexTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LookupIndex") &&
        ("term" in term) &&
        ("index" in term) && 
        (Object.keys(term).length === 3);
}

/*
## Rewrite Rules

The lookup term has two reductions based on whether the value of 
the 'name' property has been bound. If the 'name' property value is bound 
to a value, then the lookup term reduces to the bound value. If the 'name' 
property is not bound, then the lookup term blocks and the result of 
the reduction is the lookup term.

*/
export function rewriteLookup(m: Machine): Machine {
    if (!(isLookup(m.term))) { throw "expected LookupTerm"; };
    const binding = m.getBinding(m.term.name);
    if (binding === undefined) {
        return m.copyWith({ blocked: true });
    } else {
        if ((isConstant(binding) || isFunction(binding))) {
            return m.copyWith({ term: binding });
        } else {
            return rewriteTerm(m.copyWith({ term: binding }));
        }        
    }
}

export function rewriteLookupMember(m: Machine): Machine {
    if (!(isLookupMember(m.term))) { throw "expected LookupMemberTerm"; };
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked"
    }
    if ((resultOfTerm.term === null) || (typeof resultOfTerm.term !== "object")) {
        throw "not object"
    }
    const resultOfMember = rewriteTerm(m.copyWith({ term: m.term.member }));
    if (resultOfMember.blocked) {
        throw "blocked"
    }
    if (typeof resultOfMember.term !== "string") {
        throw "not string"
    }
    if (!(resultOfMember.term in resultOfTerm.term)) {
        throw "member not found"
    }
    const memberValue = resultOfTerm.term[resultOfMember.term];
    return m.copyWith({ term: memberValue });
}

export function rewriteLookupIndex(m: Machine): Machine {
    if (!(isLookupIndex(m.term))) { throw "expected LookupIndexTerm"; };
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked"
    }
    if (!(Array.isArray(resultOfTerm.term))) {
        throw "not array"
    }
    const resultOfIndex = rewriteTerm(m.copyWith({ term: m.term.index }));
    if (resultOfIndex.blocked) {
        throw "blocked"
    }
    if (typeof resultOfIndex.term !== "number") {
        throw "not number"
    }
    if ((resultOfIndex.term < 0) || (resultOfIndex.term >= resultOfTerm.term.length)) {
        throw "index out of range"
    }
    const itemValue = resultOfTerm.term[resultOfIndex.term];
    return m.copyWith({ term: itemValue });
}

/*
## Match Rules


*/
export function matchLookup(pattern: any, value: any): MatchResult {
    if (!(isLookup(pattern))) { throw "expected Lookup"; };
    let r: { [k: string]: any } = {};
    if (pattern.name !== "_") {
        r[pattern.name] = value;
    }
    return r;
}

export function matchLookupMember(pattern: any, value: any): MatchResult {
    if (!(isLookupMember(pattern))) { throw "expected LookupMember"; };
    // to do
    return false;
}

export function matchLookupIndex(pattern: any, value: any): MatchResult {
    if (!(isLookupIndex(pattern))) { throw "expected LookupIndex"; };
    // to do
    return false;
}