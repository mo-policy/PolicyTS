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
import { rewriteTerm } from "./term";

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
    const resultOfMessage = rewriteTerm(m.copyWith({ term: m.term.message }));
    if (resultOfMessage.blocked) {
        throw "blocked";
    }
    const resultOfChannel = rewriteTerm(m.copyWith({ term: m.term.channel }));
    if (resultOfChannel.blocked) {
        throw "blocked";
    }
    m.send(resultOfMessage.term, resultOfChannel.term);
    return m.copyWith({ term: null });
}
