// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Try...With Term

Reduce term and catch exceptions

## Syntax
    
    {
        "$policy": "TryWith",
        "term": _term_,
        "rules": _rules_
    }

    {
        "$policy": "Exception",
        "term": _term_
    }

## Example
    
    {
        $policy": "TryWith",
        "term": { "$policy": "Exception", "term": "error"},
        "rules": [
            {
                "$policy": "Rule",
                "pattern": { "$policy": "Lookup", "name": "x" },
                "term": { "$policy": "Lookup", "name": "x" }
            }
        ]
    }

    try 
        throw "error"
    with
    | x -> x

## Schema

    "TryWithTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "TryWith"
            },
            "term": { "$ref": "#/$defs/Term" },
            "rules": {
                "type": "array",
                "items": { "$ref": "#/$defs/Rule" }
            }
        },
        "required": [ "$policy", "term", "rules" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm, stepsMinusOne } from "./term";
import { createBlockedRuleMatch, findMatchingRule, isRule, RuleTerm } from "./termMatch";

export type TryWithTerm = {
    $policy: "TryWith",
    term: any,
    rules: RuleTerm[]
}

export type ExceptionTerm = {
    $policy: "Exception",
    term: any
}

export function isTryWith(term: any): term is TryWithTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "TryWith") &&
        ("term" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))
    ) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!(isRule(term.rules[i]))) {
                return false;
            }
        }
    }
    return true;
}

export function isException(term: any): term is ExceptionTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Exception") &&
        ("term" in term) &&
        (Object.keys(term).length === 2);
}

/*
## Rewrite Rules
Evaluate term.
if blocked, return blocked TryWith
If result of term is Exception, 
    lookup for matching rule in term.Rules
    If no rules match, return with Exception
else
    return result of term
*/
export function rewriteTryWith(m: Machine): Machine {
    if (!(isTryWith(m.term))) { throw "expected TryWithTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        if (isException(resultOfTerm.term)) {
            const matchingRule = findMatchingRule(m, m.term.rules, resultOfTerm.term);
            if (matchingRule.matchResult !== false && matchingRule.rule !== undefined) {
                if (matchingRule.resultOfGuard !== undefined) {
                    if (matchingRule.resultOfGuard.blocked) {
                        const blockedMatch = createBlockedRuleMatch(matchingRule, resultOfTerm.term, blockedTerm);
                        return m.copyWith({ term: blockedMatch, blocked: true, steps: steps })
                    } else if (matchingRule.resultOfGuard.term !== true) {
                        throw "unexpected guard value"
                    }
                }
                const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
                const resultOfRule = rewriteTerm(m.copyWith({ term: matchingRule.rule.term, bindings: bindings, steps: steps }));
                if (!(resultOfRule.blocked)) {
                    steps = stepsMinusOne(steps);
                }
                return m.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: steps });
            }
        }
        steps = stepsMinusOne(steps);
        return m.copyWith({ term: resultOfTerm.term, steps: steps });
    }
}
export function rewriteException(m: Machine): Machine {
    if (!(isException(m.term))) { throw "expected ExceptionTerm"; };
    return m;
}
