"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRef = isRef;
exports.isDereference = isDereference;
exports.isAssignment = isAssignment;
exports.rewriteRef = rewriteRef;
exports.rewriteDereference = rewriteDereference;
exports.rewriteAssignment = rewriteAssignment;
const term_1 = require("./term");
function isRef(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Ref") &&
        ("value" in term) &&
        (Object.keys(term).length === 2);
}
function isDereference(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Dereference") &&
        ("ref" in term) &&
        (Object.keys(term).length === 2);
}
function isAssignment(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Assignment") &&
        ("ref" in term) &&
        ("value" in term) &&
        (Object.keys(term).length === 3);
}
/*
## Rewrite Rules

    Ref: Evaluate value term and return RefTerm.

    Dereference: Evaluate ref term and return value.

    Assignment: Evaluate ref term, value term and update ref with value.

*/
function rewriteRef(m) {
    if (!(isRef(m.term))) {
        throw "expected RefTerm";
    }
    ;
    const resultOfValue = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.value }));
    m.term.value = resultOfValue.term;
    return m.copyWith({ term: m.term, blocked: resultOfValue.blocked });
}
function rewriteDereference(m) {
    if (!(isDereference(m.term))) {
        throw "expected DereferenceTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfRef = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.ref }));
    Object.assign(blockedTerm, { term: resultOfRef.term });
    steps = resultOfRef.steps;
    if (resultOfRef.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (!isRef(resultOfRef.term)) {
        throw "Expected Ref";
    }
    return m.copyWith({ term: resultOfRef.term.value, steps: steps });
}
function rewriteAssignment(m) {
    if (!(isAssignment(m.term))) {
        throw "expected AssignmentTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    const resultOfRef = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.ref }));
    Object.assign(blockedTerm, { ref: resultOfRef.term });
    steps = resultOfRef.steps;
    if (resultOfRef.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    if (!isRef(resultOfRef.term)) {
        throw "Expected Ref";
    }
    const resultOfValue = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.value, steps: steps }));
    Object.assign(blockedTerm, { value: resultOfValue.term });
    steps = resultOfRef.steps;
    if (resultOfValue.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    resultOfRef.term.value = resultOfValue.term;
    steps = (0, term_1.stepsMinusOne)(steps);
    return m.copyWith({ term: null, steps: steps });
}
//# sourceMappingURL=termRef.js.map