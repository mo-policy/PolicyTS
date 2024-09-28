"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machine = void 0;
const termApplication_1 = require("./termApplication");
const termQuote_1 = require("./termQuote");
const termFix_1 = require("./termFix");
const termFunction_1 = require("./termFunction");
const termIf_1 = require("./termIf");
const termLet_1 = require("./termLet");
const termLetRec_1 = require("./termLetRec");
const termLookup_1 = require("./termLookup");
const termLoop_1 = require("./termLoop");
const termMatch_1 = require("./termMatch");
const termPolicy_1 = require("./termPolicy");
const termReceive_1 = require("./termReceive");
const termRef_1 = require("./termRef");
const termSend_1 = require("./termSend");
const termSequence_1 = require("./termSequence");
const termTryFinally_1 = require("./termTryFinally");
const termTryWith_1 = require("./termTryWith");
/**
 * The heart of the term rewrite system is the Machine class. Each rewrite rule
 * takes a Machine as input and returns a Machine as a result.
 * @constructor
 */
class Machine {
    /**
     * @param term      The current term.
     * @param blocked   The current blocked state.
     * @param bindings  The current name to value bindings.
     * @param comm      The current channels and messages.
     */
    constructor(term = null, blocked = false, bindings = {}, comm = [], policies = []) {
        this.term = term;
        this.blocked = blocked;
        this.bindings = bindings;
        this.comm = comm;
        this.policies = policies;
    }
    /**
     * Helper for immutable coding style. Creates copy of this Machine with given value overrides.
     * @param values    Values to be overwritten in the new Machine.
     * @returns         A new Machine instance with value overrides.
     */
    copyWith(values) {
        return Object.assign(new Machine(), this, values);
    }
    /**
     * Returns the value of a bound name.
     * @param name      The name of the binding.
     * @returns         The value of the binding or unefined.
     */
    getBinding(name) {
        if (name in this.bindings) {
            return this.bindings[name];
        }
        return undefined;
    }
    /**
     * Gets a rewrite function for the current term.
     * @returns     A rewrite function.
     */
    getRewriteFunction() {
        if ((this.term !== null) && (typeof this.term === "object")) {
            if ("$policy" in this.term) {
                switch (this.term.$policy) {
                    case "Application": return termApplication_1.rewriteApplication;
                    case "Assignment": return termRef_1.rewriteAssignment;
                    case "Dereference": return termRef_1.rewriteDereference;
                    case "Exception": return termTryWith_1.rewriteException;
                    case "Fix": return termFix_1.rewriteFix;
                    case "ForToIterator": return termLoop_1.rewriteForToIterator;
                    case "Function": return termFunction_1.rewriteFunction;
                    case "If": return termIf_1.rewriteIf;
                    case "Let": return termLet_1.rewriteLet;
                    case "LetRec": return termLetRec_1.rewriteLetRec;
                    case "Lookup": return termLookup_1.rewriteLookup;
                    case "LookupIndex": return termLookup_1.rewriteLookupIndex;
                    case "LookupMember": return termLookup_1.rewriteLookupMember;
                    case "Loop": return termLoop_1.rewriteLoop;
                    case "Match": return termMatch_1.rewriteMatch;
                    case "Policy": return termPolicy_1.rewritePolicy;
                    case "Quote": return termQuote_1.rewriteQuote;
                    case "Receive": return termReceive_1.rewriteReceive;
                    case "Ref": return termRef_1.rewriteRef;
                    case "Send": return termSend_1.rewriteSend;
                    case "Sequence": return termSequence_1.rewriteSequence;
                    case "TryFinally": return termTryFinally_1.rewriteTryFinally;
                    case "TryWith": return termTryWith_1.rewriteTryWith;
                    case "WhileIterator": return termLoop_1.rewriteWhileIterator;
                }
                throw "Unexpected term";
            }
        }
        return termQuote_1.rewriteConstant;
    }
    /**
     * Gets a match function for the supplied pattern.
     * @param pattern   The pattern used to determine the match function.
     * @returns         A match function for the supplied pattern.
     */
    getMatchFunction(pattern) {
        if ((pattern !== null) && (typeof pattern === "object")) {
            if ("$policy" in pattern) {
                switch (pattern.$policy) {
                    case "Application": return termApplication_1.matchApplication;
                    case "Assignment": return termRef_1.matchAssignment;
                    case "Dereference": return termRef_1.matchDereference;
                    case "Exception": return termTryWith_1.matchException;
                    case "Fix": return termFix_1.matchFix;
                    case "ForToIterator": return termLoop_1.matchForToIterator;
                    case "Function": return termFunction_1.matchFunction;
                    case "If": return termIf_1.matchIf;
                    case "Let": return termLet_1.matchLet;
                    case "LetRec": return termLetRec_1.matchLetRec;
                    case "Lookup": return termLookup_1.matchLookup;
                    case "LookupIndex": return termLookup_1.matchLookupIndex;
                    case "LookupMember": return termLookup_1.matchLookupMember;
                    case "Loop": return termLoop_1.matchLoop;
                    case "Match": return termMatch_1.matchMatch;
                    case "Policy": return termPolicy_1.matchPolicy;
                    case "Quote": return termQuote_1.matchQuote;
                    case "Receive": return termReceive_1.matchReceive;
                    case "Ref": return termRef_1.matchRef;
                    case "Send": return termSend_1.matchSend;
                    case "Sequence": return termSequence_1.matchSequence;
                    case "TryFinally": return termTryFinally_1.matchTryFinally;
                    case "TryWith": return termTryWith_1.matchTryWith;
                    case "WhileIterator": return termLoop_1.matchWhileIterator;
                }
                throw "Unexpected pattern";
            }
        }
        return termQuote_1.matchConstant;
    }
    /**
     *
     * @param message
     * @param channel
     * @returns
     */
    send(message, channel) {
        // look for channel in array
        let channelMessages = false;
        for (let i = 0; i < this.comm.length; i++) {
            const cm = this.comm[i];
            if (this.compare(channel, cm.channel) === 0) {
                channelMessages = cm;
                break;
            }
        }
        // if found, use that, otherwise add one and use that
        if (channelMessages === false) {
            channelMessages = {
                channel: channel,
                messages: []
            };
            this.comm.push(channelMessages);
        }
        // create an id, using Date.valueOf
        let id = (new Date()).valueOf();
        if (channelMessages.messages.length > 0) {
            const lastId = channelMessages.messages[channelMessages.messages.length - 1].id;
            if (lastId >= id) {
                id = lastId + 1;
            }
        }
        // add the message to the end
        const entry = { id: id, message: message };
        channelMessages.messages.push(entry);
    }
    /**
     *
     * @param channel   The channel of the receive term.
     * @param id        The last id to be received, or -1.
     * @returns         The next id and message on the given channel, or id = -1.
     */
    reserve(channel, id = -1) {
        // look for channel in array
        let channelMessages = false;
        for (let i = 0; i < this.comm.length; i++) {
            const cm = this.comm[i];
            if (this.compare(channel, cm.channel) === 0) {
                channelMessages = cm;
                break;
            }
        }
        if (channelMessages === false) {
            return { id: -1, message: undefined };
        }
        else {
            // messages are sorted
            for (let msg of channelMessages.messages) {
                if (msg.id > id) {
                    return msg;
                }
            }
            return { id: -1, message: undefined };
        }
    }
    receive(channel, id) {
        // look for channel in array
        let channelMessages = false;
        for (let i = 0; i < this.comm.length; i++) {
            const cm = this.comm[i];
            if (this.compare(channel, cm.channel) === 0) {
                channelMessages = cm;
                break;
            }
        }
        if (channelMessages !== false) {
            // look for message with id and delete it
            for (let i = 0; i < channelMessages.messages.length; i++) {
                const msg = channelMessages.messages[0];
                if (msg.id === id) {
                    channelMessages.messages.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }
    release(channel, id) {
        // look for channel in array
        let channelMessages = false;
        for (let i = 0; i < this.comm.length; i++) {
            const cm = this.comm[i];
            if (this.compare(channel, cm.channel) === 0) {
                channelMessages = cm;
                break;
            }
        }
        if (channelMessages !== false) {
            // look for message with id and return true
            for (let i = 0; i < channelMessages.messages.length; i++) {
                const msg = channelMessages.messages[0];
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
    validate(term, schema) {
        return true;
    }
    /**
     * Compares two terms.
     * @param x         A term to compare.
     * @param y         A term to compare.
     * @returns         0 if x equal y, -1 if x is less than y, otherise 1.
     */
    compare(x, y) {
        if (x === undefined || y === undefined)
            return -1;
        if (x === null) {
            if (y === null)
                return 0;
            else
                return -1;
        }
        if (typeof x === "string") {
            if (typeof y === "string") {
                if (x === y)
                    return 0;
                if (x < y)
                    return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "number") {
            if (typeof y === "number") {
                if (x === y)
                    return 0;
                if (x < y)
                    return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "boolean") {
            if (typeof y === "boolean") {
                if (x === y)
                    return 0;
                if (y)
                    return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "bigint") {
            if (typeof y === "bigint") {
                if (x === y)
                    return 0;
                if (x < y)
                    return -1;
                return 1;
            }
            return -1;
        }
        if (typeof x === "object") {
            if (typeof y === "object") {
                const xlen = Object.keys(x).length;
                const ylen = Object.keys(y).length;
                if (xlen === ylen) {
                    for (let n in x) {
                        const cmp = this.compare(x[n], y[n]);
                        if (cmp !== 0)
                            return cmp;
                    }
                    return 0;
                }
                if (xlen < ylen)
                    return -1;
                else
                    return 1;
            }
            return -1;
        }
        if (x === y)
            return 0;
        else
            return -1;
    }
}
exports.Machine = Machine;
//# sourceMappingURL=machine.js.map