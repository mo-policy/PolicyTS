// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Receive Term

Receive a value on a channel.

## Syntax
    
    {
        "$policy": "Receive",
        "id": _id_,
        "channel": _term_,
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
        $policy": "Receive",
        "channel": "World",
        "rules": [
            {
                "$policy": "Rule",
                "pattern": { "$policy": "Lookup", "name": "message" },
                "term": { "$policy": "Lookup", "name": "message" }
            }
        ]
    }

    receive on "World" with
    | message -> message

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

    "ReceiveTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Receive"
            },
            "id": true,
            "channel": { "$ref": "#/$defs/Term" },
            "rules": {
                "type": "array",
                "items": { "$ref": "#/$defs/Rule" }
            }
        },
        "required": [ "$policy", "channel", "rules" ]
    }

*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm } from "./term";
import { isRule, RuleTerm } from "./termMatch";

export type ReceiveTerm = {
    $policy: "Receive",
    id?: number,
    channel: any,
    rules: RuleTerm[]
}

export function isReceive(term: any): term is ReceiveTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Receive") &&
        ("channel" in term) &&
        ("rules" in term) && (Array.isArray(term.rules))
    ) {
        for (let i = 0; i < term.rules.length; i++) {
            if (!(isRule(term.rules[i]))) {
                return false;
            }
        }
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("id" in term) && (typeof term.id === "number");
        }
    }
    return false;
}

/*
## Rewrite Rules

Evaluate the channel. 
If channel is blocked, return updated Receive term with blocked channel.
Loop over available messages from Machine.reserve(channel, id)     // reserve next message
    If no message return updated ReceiveTerm with channel and last id, if there is one.
    Look for rule with a pattern that matches the message.
    If matching rule has a guard, reduce guard, with updated bindings.
        If the guard is blocked, return a blocked MatchTerm of:
            match message with
            | pattern when guard -> term
            | ... remaining rules
            | _ ->
                ReceiveTerm with updated last id
        If the guard returns false, move to the next rule.
        If the guard returns true, 
            Machine.receive(channel, message, id)   // take the message
            reduce the rule's term with updated bindings.
            return value
        If the guard is not boolean, throw.
    If no matching rule is found, 
        Machine.release(channel, message, id)       // give back the message
        loop to next message    
If no message matches any rules:
    Return updated Receive term with channel and last id.
*/
export function rewriteReceive(m: Machine): Machine {
    if (!(isReceive(m.term))) { throw "expected ReceiveTerm"; };
    const resultOfChannel = rewriteTerm(m.copyWith({ term: m.term.channel }));
    if (resultOfChannel.blocked) {
        const blockedReceive = Object.assign({}, m.term, { channel: resultOfChannel.term });
        return m.copyWith({ term: blockedReceive, blocked: true });
    } else {
        let lastId = m.term.id;
        if (lastId === undefined) {
            lastId = -1;
        }
        while (true) {
            // { id: number, message: any }
            const resultOfReserve = m.reserve(resultOfChannel.term, lastId);
            if (resultOfReserve.id === lastId) {
                let termUpdate: { [k: string]: any } = { channel: resultOfChannel.term };
                if (resultOfReserve.id !== undefined) {
                    termUpdate["id"] = resultOfReserve.id;
                }
                const blockedReceive = Object.assign({}, m.term, termUpdate);
                return m.copyWith({ term: blockedReceive, blocked: true });
            } else {
                lastId = resultOfReserve.id;
                for (let i = 0; i < m.term.rules.length; i++) {
                    const rule = m.term.rules[i];
                    const matchResult = matchTerm(m, rule.pattern, resultOfReserve.message);
                    if (matchResult !== false) {
                        const bindings = Object.assign({}, m.bindings, matchResult);
                        let guardPassed = true;
                        if ("guard" in rule) {
                            const resultOfGuard = rewriteTerm(m.copyWith({ term: rule.guard, bindings: bindings }));
                            if (resultOfGuard.blocked) {
                                // to do, return a blocked match term
                                throw "guard blocked"
                            } else if (typeof resultOfGuard.term !== "boolean") {
                                throw "guard not boolean"
                            } else {
                                guardPassed = resultOfGuard.term;
                            }
                        }
                        if (guardPassed) {
                            if (m.receive(resultOfChannel.term, lastId)) {
                                const resultOfRule = rewriteTerm(m.copyWith({ term: rule.term, bindings: bindings }));
                                return m.copyWith({ term: resultOfRule.term });
                            } else {
                                throw "receive returned false"
                            }
                        } else {
                            if (!(m.release(resultOfChannel.term, lastId))) {
                                throw "release returned false"
                            }
                        }
                    }
                }
            }
        }
    }
}


/*
## Match Rules


*/
export function matchReceive(pattern: any, value: any): MatchResult {
    if (!(isReceive(pattern))) { throw "expected Receive"; };
    // to do
    return false;
}