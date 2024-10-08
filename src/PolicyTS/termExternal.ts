// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# External Term

The external term is used to execute code from the host environment.

## Syntax
    
    {
        "$policy": "External",
        "external": (m: Machine) => Machine
    }

## Example
    
    {
        $policy": "External",
        "external": function (m: Machine) { return m; }
    }

    let f x = { ... external ... }

## Schema

    "ExternalTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "External"
            },
            "external": true
        }
    },
    "required": [ "$policy", "external" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm } from "./term";

export type ExternalTerm = {
    $policy: "External",
    external: (m: Machine) => Machine;
}

export function isExternal(term: any): term is ExternalTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "External") &&
        ("external" in term) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules


*/
export function rewriteExternal(m: Machine): Machine {
    if (!(isExternal(m.term))) { throw "expected ExternalTerm"; };
    const externalResult = m.term.external(m);
    return externalResult;
}


/*
## Match Rules


*/
export function matchExternal(pattern: any, value: any): MatchResult {
    if (!(isExternal(pattern))) { throw "expected External"; };
    // todo
    return false;
}
