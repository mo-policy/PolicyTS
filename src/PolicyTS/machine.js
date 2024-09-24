"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machine = void 0;
const termApplication_1 = require("./termApplication");
const termConstant_1 = require("./termConstant");
const termFix_1 = require("./termFix");
const termFunction_1 = require("./termFunction");
const termIf_1 = require("./termIf");
const termLet_1 = require("./termLet");
const termLetRec_1 = require("./termLetRec");
const termLookup_1 = require("./termLookup");
const termMatch_1 = require("./termMatch");
const termRef_1 = require("./termRef");
const termSend_1 = require("./termSend");
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
    constructor(term = null, blocked = false, bindings = {}, comm = []) {
        this.term = term;
        this.blocked = blocked;
        this.bindings = bindings;
        this.comm = comm;
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
                    case "Constant": return termConstant_1.rewriteConstant;
                    case "Dereference": return termRef_1.rewriteDereference;
                    case "Fix": return termFix_1.rewriteFix;
                    case "Function": return termFunction_1.rewriteFunction;
                    case "If": return termIf_1.rewriteIf;
                    case "Let": return termLet_1.rewriteLet;
                    case "LetRec": return termLetRec_1.rewriteLetRec;
                    case "Lookup": return termLookup_1.rewriteLookup;
                    case "Match": return termMatch_1.rewriteMatch;
                    case "Ref": return termRef_1.rewriteRef;
                    case "Send": return termSend_1.rewriteSend;
                }
                throw "Unexpected term";
            }
        }
        return termConstant_1.rewriteConstant;
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
                    case "Constant": return termConstant_1.matchConstant;
                    case "Dereference": return termRef_1.matchDereference;
                    case "Fix": return termFix_1.matchFix;
                    case "Function": return termFunction_1.matchFunction;
                    case "If": return termIf_1.matchIf;
                    case "Let": return termLet_1.matchLet;
                    case "LetRec": return termLetRec_1.matchLetRec;
                    case "Lookup": return termLookup_1.matchLookup;
                    case "Match": return termMatch_1.matchMatch;
                    case "Ref": return termRef_1.matchRef;
                    case "Send": return termSend_1.matchSend;
                }
                throw "Unexpected pattern";
            }
        }
        return termConstant_1.matchConstant;
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
        return id;
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