"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLookup = isLookup;
exports.isLookupMember = isLookupMember;
exports.isLookupIndex = isLookupIndex;
exports.rewriteLookup = rewriteLookup;
exports.rewriteLookupMember = rewriteLookupMember;
exports.rewriteLookupIndex = rewriteLookupIndex;
exports.matchLookup = matchLookup;
exports.matchLookupMember = matchLookupMember;
exports.matchLookupIndex = matchLookupIndex;
const term_1 = require("./term");
const termQuote_1 = require("./termQuote");
const termFunction_1 = require("./termFunction");
function isLookup(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Lookup") &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 2);
}
function isLookupMember(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LookupMember") &&
        ("term" in term) &&
        ("member" in term) &&
        (Object.keys(term).length === 3);
}
function isLookupIndex(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "LookupIndex") &&
        ("term" in term) &&
        ("index" in term) &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules

The lookup term has two reductions based on whether the value of
the 'name' property has been bound. If the 'name' property value is bound
to a value, then the lookup term reduces to the bound value. If the 'name'
property is not bound, then the lookup term blocks and the result of
the reduction is the lookup term.

*/
function rewriteLookup(m) {
    if (!(isLookup(m.term))) {
        throw "expected LookupTerm";
    }
    ;
    const binding = m.getBinding(m.term.name);
    if (binding === undefined) {
        return m.copyWith({ blocked: true });
    }
    else {
        if (((0, termQuote_1.isConstant)(binding) || (0, termFunction_1.isFunction)(binding))) {
            return m.copyWith({ term: binding });
        }
        else {
            return (0, term_1.rewriteTerm)(m.copyWith({ term: binding }));
        }
    }
}
function rewriteLookupMember(m) {
    if (!(isLookupMember(m.term))) {
        throw "expected LookupMemberTerm";
    }
    ;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked";
    }
    if ((resultOfTerm.term === null) || (typeof resultOfTerm.term !== "object")) {
        throw "not object";
    }
    const resultOfMember = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.member }));
    if (resultOfMember.blocked) {
        throw "blocked";
    }
    if (typeof resultOfMember.term !== "string") {
        throw "not string";
    }
    if (!(resultOfMember.term in resultOfTerm.term)) {
        throw "member not found";
    }
    const memberValue = resultOfTerm.term[resultOfMember.term];
    return m.copyWith({ term: memberValue });
}
function rewriteLookupIndex(m) {
    if (!(isLookupIndex(m.term))) {
        throw "expected LookupIndexTerm";
    }
    ;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    if (resultOfTerm.blocked) {
        throw "blocked";
    }
    if (!(Array.isArray(resultOfTerm.term))) {
        throw "not array";
    }
    const resultOfIndex = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.index }));
    if (resultOfIndex.blocked) {
        throw "blocked";
    }
    if (typeof resultOfIndex.term !== "number") {
        throw "not number";
    }
    if ((resultOfIndex.term < 0) || (resultOfIndex.term >= resultOfTerm.term.length)) {
        throw "index out of range";
    }
    const itemValue = resultOfTerm.term[resultOfIndex.term];
    return m.copyWith({ term: itemValue });
}
/*
## Match Rules


*/
function matchLookup(pattern, value) {
    if (!(isLookup(pattern))) {
        throw "expected Lookup";
    }
    ;
    let r = {};
    if (pattern.name !== "_") {
        r[pattern.name] = value;
    }
    return r;
}
function matchLookupMember(pattern, value) {
    if (!(isLookupMember(pattern))) {
        throw "expected LookupMember";
    }
    ;
    // to do
    return false;
}
function matchLookupIndex(pattern, value) {
    if (!(isLookupIndex(pattern))) {
        throw "expected LookupIndex";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termLookup.js.map