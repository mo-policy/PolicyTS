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
import { matchTerm, rewriteTerm, stepsMinusOne } from "./term";

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
            | blockedRule.pattern when blockedGuard -> blockedRule.term
            | remaining rules...
            | _ -> m.term
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
    let steps = m.steps;
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const matchResult = matchTerm(m, rule.pattern, value);
        if (matchResult !== false) {
            const bindings = Object.assign({}, m.bindings, matchResult);
            let guardPassed = true;
            if ("guard" in rule) {
                const resultOfGuard = rewriteTerm(m.copyWith({ term: rule.guard, bindings: bindings, steps: steps }));
                steps = resultOfGuard.steps;
                if ((resultOfGuard.blocked) || (typeof resultOfGuard.term !== "boolean")) {
                    return {
                        matchResult: matchResult,
                        rule: rule,
                        resultOfGuard: resultOfGuard,
                        remainingRules: rules.slice(i+1)
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

export function createBlockedRuleMatch(matchingRule: MatchingRule, matchTerm: any, blockedTerm: any): any {
    if (matchingRule.matchResult === false ||
        matchingRule.rule === undefined ||
        matchingRule.resultOfGuard === undefined || 
        (!(matchingRule.resultOfGuard.blocked)) ||
        matchingRule.remainingRules === undefined) {
        throw "unexpected paramaters to createBlockedRuleMatch"
    }
    let blockedRule: RuleTerm = {
        $policy: "Rule",
        pattern: matchingRule.rule.pattern,
        guard: matchingRule.resultOfGuard.term,
        term: matchingRule.rule.term
    }
    let blockedRules: RuleTerm[] = [blockedRule];
    for (let i = 0; i < matchingRule.remainingRules.length; i++) {
        blockedRules.push(matchingRule.remainingRules[i]);
    }
    let finalRule: RuleTerm = {
        $policy: "Rule",
        pattern: { $policy: "Lookup", name: "_" },
        term: blockedTerm
    };
    blockedRules.push(finalRule);
    const blockedMatch = {
        $policy: "Match",
        term: matchTerm,
        rules: blockedRules
    }
    return blockedMatch;
}

export function rewriteMatch(m: Machine): Machine {
    if (!(isMatch(m.term))) { throw "expected MatchTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = rewriteTerm(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    } else {
        const matchingRule = findMatchingRule(m.copyWith({steps: steps}), m.term.rules, resultOfTerm.term);
        if (matchingRule.matchResult === false || matchingRule.rule === undefined) {
            throw "no rule passed";
        } else {
            if (matchingRule.resultOfGuard !== undefined) {
                steps = matchingRule.resultOfGuard.steps;
                if (matchingRule.resultOfGuard.blocked && matchingRule.remainingRules !== undefined) {
                    /* 
                    match term with
                    | blockedRule.pattern when blockedGuard -> blockedRule.term
                    | remaining rules...
                    | _ -> m.term
                    */
                    const blockedMatch = createBlockedRuleMatch(matchingRule, blockedTerm.term, blockedTerm);
                    return m.copyWith({ term: blockedMatch, blocked: true, steps: steps })
                } else if (matchingRule.resultOfGuard.term !== true) {
                    throw "unexpected guard value"
                }
            }
            const bindings = Object.assign({}, m.bindings, matchingRule.matchResult);
            const resultOfRule = rewriteTerm(m.copyWith({ term: matchingRule.rule.term, bindings: bindings, steps: steps }));
            if (!resultOfRule.blocked) {
                steps = stepsMinusOne(steps);
            }
            return m.copyWith({ term: resultOfRule.term, blocked: resultOfRule.blocked, steps: steps });
        }
    }
}
