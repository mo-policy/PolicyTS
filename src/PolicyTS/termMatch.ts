// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Match Term

Match a value against a set of rules.

## Syntax
    
    {
        "$policy": "Match",
        "term": _term_,
        "rules": _rules_
    }

    {
        "$policy": "Rule",
        "pattern": _term_,
        "guard": _term_,
        "term": _term_
    }

## Example
    
    {
        $policy": "Match",
        "term": 1,
        "rules": [
            {
                "$policy": "Rule",
                "pattern": { "$policy": "Lookup", "name": "x" },
                "term": { "$policy": "Lookup", "name": "x" }
            }
        ]
    }

    match 1 with
    | x -> x

## Schema

    "RuleTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Rule"
            },
            "pattern": { "$ref": "#/$defs/Term" },
            "guard": { "$ref": "#/$defs/Term" },
            "term": { "$ref": "#/$defs/Term" }
        },
        "required": [ "$policy", "pattern", "term" ]
    }

    "MatchTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Match"
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
import { matchTerm, rewriteTerm } from "./term";

export type RuleTerm = {
    $policy: "Rule",
    pattern: any,
    guard?: any,
    term: any
}

export type MatchTerm = {
    $policy: "Match",
    term: any,
    rules: RuleTerm[]
}

export function isRule(term: any): term is RuleTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Rule") &&
        ("pattern" in term) &&
        ("term" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("guard" in term);
        }
    }
    return false;
}

export function isMatch(term: any): term is MatchTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Match") &&
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

/*
## Rewrite Rules

Evaluate Match.term. 
If term result is blocked, return updated Match with blocked term.
Look for rule with a pattern that matches term result.
    If matching rule has a guard, reduce guard, with updated bindings.
        If the guard is blocked, return a blocked MatchTerm of:
            match term with
            | pattern when guard -> term
            | ... remaining rules
        If the guard returns false, move to the next rule.
        If the guard returns true, 
            reduce the rule's term with updated bindings.
            return value
        If the guard is not boolean, throw.
If no matching rule is found, throw
*/

export type MatchingRule = {
    matchResult: MatchResult,
    rule?: RuleTerm,
    resultOfGuard?: Machine,
    remainingRules?: RuleTerm[]
}
export function findMatchingRule(m: Machine, rules: RuleTerm[], value: any): MatchingRule {
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const matchResult = matchTerm(m, rule.pattern, value);
        if (matchResult !== false) {
            const bindings = Object.assign({}, m.bindings, matchResult);
            let guardPassed = true;
            if ("guard" in rule) {
                const resultOfGuard = rewriteTerm(m.copyWith({ term: rule.guard, bindings: bindings }));
                if ((resultOfGuard.blocked) || (typeof resultOfGuard.term !== "boolean")) {
                    return {
                        matchResult: matchResult,
                        rule: rule,
                        resultOfGuard: resultOfGuard,
                        remainingRules: rules.slice(i)
                    };
                } else {
                    guardPassed = resultOfGuard.term;
                }
            }
            if (guardPassed) {
                return {
                    matchResult: matchResult,
                    rule: rule,
                    remainingRules: rules.slice(i)
                };
            }
        }
    }
    return {
        matchResult: false
    };
}

export function rewriteMatch(m: Machine): Machine {
    if (!(isMatch(m.term))) { throw "expected MatchTerm"; };
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        const blockedMatch = Object.assign({}, m.term, { channel: resultOfTerm.term });
        return m.copyWith({ term: blockedMatch, blocked: true });
    } else {
        const matchingRule = findMatchingRule(m, m.term.rules, resultOfTerm.term);
        if (matchingRule.matchResult === false || matchingRule.rule === undefined) {
            throw "no rule passed";
        } else {
            if (matchingRule.resultOfGuard !== undefined) {
                if (matchingRule.resultOfGuard.blocked) {
                    // to do, return a blocked match term
                    throw "guard blocked"
                } else if (matchingRule.resultOfGuard.term !== true) {
                    throw "unexpected guard value"
                }
            }
            const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
            const resultOfRule = rewriteTerm(m.copyWith({ term: matchingRule.rule.term, bindings: bindings }));
            return m.copyWith({ term: resultOfRule.term });
        }
    }
}
