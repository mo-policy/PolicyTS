// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Send Term

Send a value on a channel.

## Syntax
    
    {
        "$policy": "Send",
        "message": _term_,
        "channel": _term_
    }

## Example
    
    {
        $policy": "Send",
        "message": "Hello",
        "channel": "World"
    }

    send "Hello" on "World"

## Schema

    "SendTerm": {
        "type": "object",
        "properties": {
            "$policy": {
                "type": "string",
                "const": "Send"
            },
            "message": { "$ref": "#/$defs/Term" },
            "channel": { "$ref": "#/$defs/Term" }
        }
    },
    "required": [ "$policy", "message", "channel" ]

*/

import { Machine, MatchResult } from "./machine"
import { rewriteTerm, stepsMinusOne } from "./term";

export type SendTerm = {
    $policy: "Send",
    message: any,
    channel: any
}

export function isSend(term: any): term is SendTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Send") &&
        ("message" in term) && 
        ("channel" in term) &&
        (Object.keys(term).length === 3);
}

/*
## Rewrite Rules

Evaluate the message and channel, call Machine.send and return result of send.
*/
export function rewriteSend(m: Machine): Machine {
    if (!(isSend(m.term))) { throw "expected SendTerm"; };
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfMessage = rewriteTerm(m.copyWith({ term: m.term.message }));
    Object.assign(blockedTerm, { message: resultOfMessage.term });
    steps = resultOfMessage.steps;
    if (resultOfMessage.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    const resultOfChannel = rewriteTerm(m.copyWith({ term: m.term.channel }));
    Object.assign(blockedTerm, { channel: resultOfChannel.term });
    steps = resultOfChannel.steps;
    if (resultOfChannel.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    m.send(resultOfMessage.term, resultOfChannel.term);
    steps = stepsMinusOne(steps);
    return m.copyWith({ term: null, steps: steps });
}
