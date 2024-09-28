"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isForToIterator = isForToIterator;
exports.isLoop = isLoop;
exports.rewriteForToIterator = rewriteForToIterator;
exports.rewriteLoop = rewriteLoop;
exports.matchForToIterator = matchForToIterator;
exports.matchLoop = matchLoop;
const term_1 = require("./term");
function isForToIterator(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "ForToIterator") &&
        ("done" in term) && (typeof term.done === "boolean") &&
        ("value" in term) &&
        ("to" in term) &&
        ("step" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 5) {
            return true;
        }
        else if (kl === 6) {
            return ("from" in term);
        }
    }
    return false;
}
function isLoop(term) {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Loop") &&
        ("iterator" in term) &&
        ("term" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        }
        else if (kl === 4) {
            return ("pattern" in term);
        }
    }
    return false;
}
function isIterator(term) {
    return (("done" in term && (typeof term.done === "boolean")) &&
        ("value" in term));
}
/*
## Rewrite Rules

ForToIteratorTerm
    if from in term, return with value = from
    if step > 0 and value > to then return done = true
    if step < 0 and value < to then return done = true
    return value + step

LoopTerm
    while true
        rewrite loop.iterator
        if blocked then return blocked loop term with blocked iterator
        if iterator.done return null
        if loop has pattern, match pattern and iterator value
        rewrite loop.term with any new bindings

*/
function rewriteForToIterator(m) {
    if (!(isForToIterator(m.term))) {
        throw "expected ForToIteratorTerm";
    }
    if (m.term.done) {
        return m;
    }
    let nextIterator = Object.assign({}, m.term);
    if ("from" in m.term) {
        Object.assign(nextIterator, { value: m.term.from });
        delete nextIterator.from;
    }
    else {
        Object.assign(nextIterator, { value: m.term.value + m.term.step });
    }
    if (((m.term.step > 0) && (m.term.value >= m.term.to)) ||
        ((m.term.step < 0) && (m.term.value <= m.term.to))) {
        Object.assign(nextIterator, { done: true });
    }
    return m.copyWith({ term: nextIterator });
}
function rewriteLoop(m) {
    if (!(isLoop(m.term))) {
        throw "expected LoopTerm";
    }
    ;
    let iterator = m.term.iterator;
    while (true) {
        const iteratorResult = (0, term_1.rewriteTerm)(m.copyWith({ term: iterator }));
        if (iteratorResult.blocked) {
            throw "blocked";
        }
        if (!(isIterator(iteratorResult.term))) {
            throw "expected Iterator";
        }
        iterator = iteratorResult.term;
        if (iterator.done) {
            return m.copyWith({ term: null });
        }
        let bindings = m.bindings;
        if ("pattern" in m.term) {
            const matchResult = (0, term_1.matchTerm)(m, m.term.pattern, iterator.value);
            if (matchResult === false) {
                throw "match failed";
            }
            bindings = Object.assign({}, bindings, matchResult);
        }
        const termResult = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.term, bindings: bindings }));
        if (termResult.blocked) {
            throw "blocked";
        }
    }
}
/*
## Match Rules
*/
function matchForToIterator(pattern, value) {
    if (!(isForToIterator(pattern))) {
        throw "expected ForToIterator";
    }
    ;
    // to do
    return false;
}
function matchLoop(pattern, value) {
    if (!(isLoop(pattern))) {
        throw "expected Loop";
    }
    ;
    // to do
    return false;
}
//# sourceMappingURL=termLoop.js.map