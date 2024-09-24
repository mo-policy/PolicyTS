// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Sequence Term

A sequence of terms resulting in the value of the last in the sequence.

## Syntax
    
    {
        "$policy": "Sequence",
        "terms": _term_array_
    }

## Example
    
    {
        $policy": "Sequence",
        "terms": [ 1, 2 ]
    }

    1; 2

## Schema

    "SequenceTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Sequence"
            },
            "terms": {
                "type": "array",
                "items": { "$ref": "#/$defs/Term" }
            }
        },
        "required": [ "$policy", "terms" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm } from "./term";

export type SequenceTerm = {
    $policy: "Sequence",
    terms: any[]
}

export function isSequence(term: any): term is SequenceTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Sequence") &&
        (("terms" in term) && Array.isArray(term.terms)) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules

Evaluate Sequence.terms in order.
if any block, return blocked SequenceTerm
otherwise, return result of last term.

*/

export function rewriteSequence(m: Machine): Machine {
    if (!(isSequence(m.term))) { throw "expected SequenceTerm"; };
    if (m.term.terms.length === 0) { throw "sequence with no terms" }
    const resultTerms = m.term.terms.splice(0);
    let anyBlocked = false;
    for (let i = 0; i < resultTerms.length; i++) {
        const seqTerm = resultTerms[i];
        const resultOfSeqTerm = rewriteTerm(m.copyWith({ term: seqTerm }));
        resultTerms[i] = resultOfSeqTerm.term;
        anyBlocked = resultOfSeqTerm.blocked;
        break;
    }
    if (anyBlocked) {
        const blockedTerm = Object.assign({}, m.term, { terms: resultTerms });
        return m.copyWith({ term: blockedTerm });
    } else {
        return m.copyWith({ term: resultTerms[resultTerms.length - 1] });
    }
}

/*
## Match Rules
*/

export function matchSequence(pattern: any, value: any): MatchResult {
    if (!(isSequence(pattern))) { throw "expected Sequence"; };
    // to do
    return false;
}