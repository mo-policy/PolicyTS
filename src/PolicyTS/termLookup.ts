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

export type LookupTerm = {
    $policy: "Lookup",
    name: string
}

export function isLookup(term: any): term is LookupTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Lookup") &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 2);
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
        return m.copyWith({ term: binding });
    }
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