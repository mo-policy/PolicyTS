// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { rewriteApplication, matchApplication } from "./termApplication"
import { rewriteConstant, matchConstant } from "./termConstant"
import { matchFix, rewriteFix } from "./termFix"
import { rewriteFunction, matchFunction } from "./termFunction"
import { rewriteIf, matchIf } from "./termIf"
import { rewriteLet, matchLet } from "./termLet"
import { matchLetRec, rewriteLetRec } from "./termLetRec"
import { rewriteLookup, matchLookup } from "./termLookup"
import { matchMatch, rewriteMatch } from "./termMatch"
import { matchAssignment, matchDereference, matchRef, rewriteAssignment, rewriteDereference, rewriteRef } from "./termRef"


export type MatchResult = ({ readonly [k: string]: any } | false)

/**
 * The heart of the term rewrite system is the Machine class. Each rewrite rule
 * takes a Machine as input and returns a Machine as a result.
 * @constructor
 */
export class Machine {
    readonly term: any;
    readonly blocked: boolean;
    readonly bindings: { readonly [k: string]: any };
    /**
     * @param term      The current term.
     * @param blocked   The current blocked state.
     * @param bindings  The current name to value bindings.
     */
    constructor(term: any = null, blocked: boolean = false, bindings: { [k: string]: any } = {}) {
        this.term = term;
        this.blocked = blocked;
        this.bindings = bindings;
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
                    case "Application": return rewriteApplication;
                    case "Assignment": return rewriteAssignment;
                    case "Constant": return rewriteConstant;
                    case "Dereference": return rewriteDereference;
                    case "Fix": return rewriteFix;
                    case "Function": return rewriteFunction;
                    case "If": return rewriteIf;
                    case "Let": return rewriteLet;
                    case "LetRec": return rewriteLetRec;
                    case "Lookup": return rewriteLookup;
                    case "Match": return rewriteMatch;
                    case "Ref": return rewriteRef;
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
    getMatchFunction(pattern: any): ((pattern: any, value: any) => MatchResult) {
        if ((pattern !== null) && (typeof pattern === "object")) {
            if ("$policy" in pattern) {
                switch (pattern.$policy) {
                    case "Application": return matchApplication;
                    case "Assignment": return matchAssignment;
                    case "Constant": return matchConstant;
                    case "Dereference": return matchDereference;
                    case "Fix": return matchFix;
                    case "Function": return matchFunction;
                    case "If": return matchIf;
                    case "Let": return matchLet;
                    case "LetRec": return matchLetRec;
                    case "Lookup": return matchLookup;
                    case "Match": return matchMatch;
                    case "Ref": return matchRef;
                }
                throw "Unexpected pattern";
            }
        }
        return matchConstant;
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