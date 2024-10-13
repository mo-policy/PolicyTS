// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { rewriteApplication } from "./termApplication"
import { rewriteConstant, matchConstant, rewriteQuote, matchQuote } from "./termQuote"
import { rewriteFix } from "./termFix"
import { matchFunction, rewriteFunction } from "./termFunction"
import { rewriteIf } from "./termIf"
import { matchLet, rewriteLet } from "./termLet"
import { rewriteLookup, matchLookup, rewriteLookupMember, rewriteLookupIndex } from "./termLookup"
import { rewriteForToIterator, rewriteLoop, rewriteWhileIterator } from "./termLoop"
import { rewriteMatch } from "./termMatch"
import { rewritePolicy } from "./termPolicy"
import { rewriteReceive } from "./termReceive"
import { rewriteAssignment, rewriteDereference, rewriteRef } from "./termRef"
import { rewriteSend } from "./termSend"
import { rewriteSequence } from "./termSequence"
import { rewriteTryFinally } from "./termTryFinally"
import { rewriteException, rewriteTryWith } from "./termTryWith"
import { rewriteRewrite } from "./termRewrite"
import { rewriteParallel } from "./termParallel"
import { rewriteInfix } from "./termInfix"
import { matchAnnotation, rewriteAnnotation } from "./termAnnotation"
import { rewriteExternal } from "./termExternal"
import { matchAsPattern } from "./termAsPattern"


export type MatchResult = ({ readonly [k: string]: any } | false)

type Message = {
    id: number,
    message: any
}

type ChannelMessages = {
    [key: string]: Message[];
}

type ActiveRules = {
    machine: Machine,
    term: any
}

/**
 * The heart of the term rewrite system is the Machine class. Each rewrite rule
 * takes a Machine as input and returns a Machine as a result.
 * @constructor
 */
export class Machine {
    readonly term: any;
    readonly steps: number;
    readonly bindings: { readonly [k: string]: any };
    readonly blocked: boolean;
    readonly policies: ActiveRules[];
    readonly tries: ActiveRules[];
    readonly comm: ChannelMessages;
    /**
     * @param term      The current term.
     * @param steps     The number of steps remaining before blocking. Use -1 to disable step counting.
     * @param bindings  The current name to value bindings.
     * @param blocked   The current blocked state.
     * @param policies  The current active policy terms.
     * @param tries     The current active try/with terms.
     * @param comm      The current channels and messages.
     */
    constructor(
        term: any = null,
        steps: number = -1,
        bindings: { [k: string]: any } = {},
        blocked: boolean = false,
        policies: ActiveRules[] = [],
        tries: ActiveRules[] = [],
        comm: ChannelMessages = {}
    ) {
        this.term = term;
        this.steps = steps;
        this.bindings = bindings;
        this.blocked = blocked;
        this.policies = policies;
        this.tries = tries;
        this.comm = comm;
    }

    /**
     * Helper for immutable coding style. Creates copy of this Machine with given value overrides.
     * @param values    Values to be overwritten in the new Machine.
     * @returns         A new Machine instance with value overrides.
     */
    copyWith(values: { [k: string]: any }): Machine {
        return Object.assign(new Machine(), this, values);
    }

    /**
     * Returns the value of a bound name.
     * @param name      The name of the binding.
     * @returns         The value of the binding or unefined.
     */
    getBinding(name: string): any {
        if (name in this.bindings) {
            return this.bindings[name];
        }
        return undefined;
    }
    /**
     * Gets a rewrite function for the current term.
     * @returns     A rewrite function.
     */
    getRewriteFunction(): ((m: Machine) => Machine) {
        if ((this.term !== null) && (typeof this.term === "object")) {
            if ("$policy" in this.term) {
                switch (this.term.$policy) {
                    case "Annotation": return rewriteAnnotation;
                    case "Application": return rewriteApplication;
                    case "Assignment": return rewriteAssignment;
                    case "Dereference": return rewriteDereference;
                    case "Exception": return rewriteException;
                    case "External": return rewriteExternal;
                    case "Fix": return rewriteFix;
                    case "ForToIterator": return rewriteForToIterator;
                    case "Function": return rewriteFunction;
                    case "If": return rewriteIf;
                    case "Infix": return rewriteInfix;
                    case "Let": return rewriteLet;
                    case "Lookup": return rewriteLookup;
                    case "LookupIndex": return rewriteLookupIndex;
                    case "LookupMember": return rewriteLookupMember;
                    case "Loop": return rewriteLoop;
                    case "Match": return rewriteMatch;
                    case "Parallel": return rewriteParallel;
                    case "Policy": return rewritePolicy;
                    case "Quote": return rewriteQuote;
                    case "Receive": return rewriteReceive;
                    case "Ref": return rewriteRef;
                    case "Rewrite": return rewriteRewrite;
                    case "Send": return rewriteSend;
                    case "Sequence": return rewriteSequence;
                    case "TryFinally": return rewriteTryFinally;
                    case "TryWith": return rewriteTryWith;
                    case "WhileIterator": return rewriteWhileIterator;
                }
                throw "Unexpected term";
            }
        }
        return rewriteConstant;
    }
    /**
     * Gets a match function for the supplied pattern.
     * @param pattern   The pattern used to determine the match function.
     * @returns         A match function for the supplied pattern.
     */
    getMatchFunction(pattern: any): ((m: Machine, pattern: any, value: any) => MatchResult) {
        if ((pattern !== null) && (typeof pattern === "object")) {
            if ("$policy" in pattern) {
                switch (pattern.$policy) {
                    case "Annotation": return matchAnnotation;
                    case "AsPattern": return matchAsPattern;
                    case "Function": return matchFunction;
                    case "Let": return matchLet;
                    case "Lookup": return matchLookup;
                    case "Quote": return matchQuote;
                    default: return matchConstant;
                }
            }
        }
        return matchConstant;
    }
    /**
     * 
     * @param message
     * @param channel
     * @returns
     */
    send(message: any, channel: any) {
        // look for channel
        const key = JSON.stringify(channel);
        let messages: Message[] = [];
        if (key in this.comm) {
            messages = this.comm[key];
        }

        // create an id, using Date.valueOf
        let id = (new Date()).valueOf();
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id
            if (lastId >= id) {
                id = lastId + 1;
            }
        }
        // add the message to the end
        const entry = { id: id, message: message };
        messages.push(entry);
        this.comm[key] = messages;
    }

    /**
     * 
     * @param channel   The channel of the receive term.
     * @param id        The last id to be received, or -1.
     * @returns         The next id and message on the given channel, or id = -1.
     */
    reserve(channel: any, id: number = -1): { id: number, message: any } {
        const key = JSON.stringify(channel);
        if (key in this.comm) {
            const messages = this.comm[key];
            for (let msg of messages) {
                if (msg.id > id) {
                    return msg;
                }
            }
        }
        return { id: -1, message: undefined };
    }

    receive(channel: any, id: number): boolean {
        const key = JSON.stringify(channel);
        if (key in this.comm) {
            const messages = this.comm[key];
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                if (msg.id === id) {
                    messages.splice(i, 1);
                    if (messages.length === 0) {
                        delete this.comm[key];
                    }
                    return true;
                }
            }
        }
        return false;
    }

    release(channel: any, id: number): boolean {
        const key = JSON.stringify(channel);
        if (key in this.comm) {
            const messages = this.comm[key];
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                if (msg.id === id) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Verifies if the given term is of the provided schema name.
     * @param term      The term to validate.
     * @param schema    The name of the schema.
     * @returns         True if the term validates against the schema, otherwise false.
     */
    validate(term: any, schema: string): boolean {
        return true;
    }
    /**
     * Compares two terms.
     * @param x         A term to compare.
     * @param y         A term to compare.
     * @returns         0 if x equal y, -1 if x is less than y, otherise 1.
     */
    compare(x: any, y: any): number {
        if (x === undefined || y === undefined) return -1;
        if (x === null) {
            if (y === null) return 0; else return -1;
        }
        if (typeof x === "string") {
            if (typeof y === "string") {
                if (x === y) return 0;
                if (x < y) return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "number") {
            if (typeof y === "number") {
                if (x === y) return 0;
                if (x < y) return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "boolean") {
            if (typeof y === "boolean") {
                if (x === y) return 0;
                if (y) return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "bigint") {
            if (typeof y === "bigint") {
                if (x === y) return 0;
                if (x < y) return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "object") {
            if (typeof y === "object") {
                const xlen = Object.keys(x).length
                const ylen = Object.keys(y).length
                if (xlen === ylen) {
                    for (let n in x) {
                        const cmp = this.compare(x[n], y[n]);
                        if (cmp !== 0) return cmp;
                    }
                    return 0;
                }
                if (xlen < ylen) return -1; else return 1;
            }
            return -1;
        }
        if (x === y) return 0; else return -1;
    }

}