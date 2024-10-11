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
const term_1 = require("./term");
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
    const steps = (0, term_1.stepsMinusOne)(m.steps);
    if (binding === undefined) {
        return m.copyWith({ blocked: true, steps: steps });
    }
    else {
        return (0, term_1.rewriteTerm)(m.copyWith({ term: binding, steps: steps }));
    }
}
function rewriteLookupMember(m) {
    if (!(isLookupMember(m.term))) {
        throw "expected LookupMemberTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if ((resultOfTerm.term === null) || (typeof resultOfTerm.term !== "object")) {
        throw "not object";
    }
    const resultOfMember = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.member, steps: steps }));
    Object.assign(blockedTerm, { member: resultOfMember.term });
    steps = resultOfMember.steps;
    if (resultOfMember.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (typeof resultOfMember.term !== "string") {
        throw "not string";
    }
    if (!(resultOfMember.term in resultOfTerm.term)) {
        throw "member not found";
    }
    const memberValue = resultOfTerm.term[resultOfMember.term];
    steps = (0, term_1.stepsMinusOne)(steps);
    return m.copyWith({ term: memberValue, steps: steps });
}
function rewriteLookupIndex(m) {
    if (!(isLookupIndex(m.term))) {
        throw "expected LookupIndexTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfTerm = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term }));
    Object.assign(blockedTerm, { term: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfTerm.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (!(Array.isArray(resultOfTerm.term))) {
        throw "not array";
    }
    const resultOfIndex = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.index }));
    Object.assign(blockedTerm, { index: resultOfTerm.term });
    steps = resultOfTerm.steps;
    if (resultOfIndex.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (typeof resultOfIndex.term !== "number") {
        throw "not number";
    }
    if ((resultOfIndex.term < 0) || (resultOfIndex.term >= resultOfTerm.term.length)) {
        throw "index out of range";
    }
    const itemValue = resultOfTerm.term[resultOfIndex.term];
    steps = (0, term_1.stepsMinusOne)(steps);
    return m.copyWith({ term: itemValue, steps: steps });
}
/*
## Match Rules


*/
function matchLookup(m, pattern, value) {
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
//# sourceMappingURL=termLookup.js.map