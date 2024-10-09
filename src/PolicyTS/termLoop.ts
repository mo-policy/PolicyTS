// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

/*
# Loop Term

Evaluate a term multiple times based on some condition.
Returns null.


for (let i = 1; i<5; i++) {
    1
}
// { i: 0, next: fun null -> { value: i++, done: i<5 } }

// Javascript: The for...in statement iterates over all enumerable 
// string properties of an object (ignoring properties keyed by symbols), including 
// inherited enumerable properties.
for (let x in y) { }
// { x: object, p: string, next: fun null -> { value: i++, done: i<5 } }

// The for...of statement executes a loop that operates on a sequence of values sourced 
// from an iterable object. Iterable objects include instances of built-ins such as Array, 
// String, TypedArray, Map, Set, NodeList (and other DOM collections), as well as the 
// arguments object, generators produced by generator functions, and user-defined iterables.
for (let x of y) {
    ...
}
// y is { next: fun null -> { value: any, done: boolean } }
*/

import { Machine, MatchResult } from "./machine"
import { matchTerm, rewriteTerm } from "./term";
import { isFunction } from "./termFunction";


export type ForToIteratorTerm = {
    $policy: "ForToIterator",
    done: boolean,
    from?: number,
    value: number,
    to: number,
    step: number
}

export type WhileIteratorTerm = {
    $policy: "WhileIterator",
    done: boolean,
    condition: any  // function which returns true or false
}

export type LoopTerm = {
    $policy: "Loop",
    iterator: any,
    pattern?: any,
    term: any
}
export function isForToIterator(term: any): term is ForToIteratorTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "ForToIterator") &&
        ("done" in term) && (typeof term.done === "boolean") &&
        ("value" in term) &&
        ("to" in term) &&
        ("step" in term) && (term.step === -1 || term.step === 1)) {
        const kl = Object.keys(term).length;
        if (kl === 5) {
            return true;
        } else if (kl === 6) {
            return ("from" in term);
        }
    }
    return false;
}

export function isWhileIterator(term: any): term is WhileIteratorTerm {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "WhileIterator") &&
        ("done" in term) && (typeof term.done === "boolean") &&
        ("condition" in term) &&
        (Object.keys(term).length === 3);
}

export function isLoop(term: any): term is LoopTerm {
    if ((term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Loop") &&
        ("iterator" in term) &&
        ("term" in term)) {
        const kl = Object.keys(term).length;
        if (kl === 3) {
            return true;
        } else if (kl === 4) {
            return ("pattern" in term);
        }
    }
    return false;
}

/*
## Rewrite Rules

ForToIteratorTerm
    if from in term, return with value = from
    if step > 0 and value > to then return done = true
    if step < 0 and value < to then return done = true 
    return value + step

WhileTeratorTerm
    apply condition function
    set done to result of condition

LoopTerm
    while true
        rewrite loop.iterator
        if blocked then return blocked loop term with blocked iterator
        if iterator.done return null
        if loop has pattern, match pattern and iterator value
        rewrite loop.term with any new bindings

*/

export function rewriteForToIterator(m: Machine): Machine {
    if (!(isForToIterator(m.term))) { throw "expected ForToIteratorTerm" }
    if (m.term.done) { return m; }
    let nextIterator = Object.assign({}, m.term);
    if ("from" in m.term) {
        Object.assign(nextIterator, { value: m.term.from });
        delete nextIterator.from;
    } else {
        Object.assign(nextIterator, { value: m.term.value + m.term.step });
    }
    if (((m.term.step > 0) && (m.term.value >= m.term.to)) ||
        ((m.term.step < 0) && (m.term.value <= m.term.to))) {
        Object.assign(nextIterator, { done: true });
    }
    return m.copyWith({ term: nextIterator });
}

export function rewriteWhileIterator(m: Machine): Machine {
    if (!(isWhileIterator(m.term))) { throw "expected WhileIteratorTerm" }
    if (!(isFunction(m.term.condition))) { throw "expected FunctionTerm" }
    if (m.term.done) { return m; }
    const appTerm = {
        $policy: "Application",
        function: m.term.condition,
        arg: null
    }
    const resultOfCondition = rewriteTerm(m.copyWith({ term: appTerm }))
    if (typeof resultOfCondition.term !== "boolean") { throw "exepected boolean" }
    const nextIterator = Object.assign({}, m.term, { "done": resultOfCondition.term });
    return m.copyWith({ term: nextIterator });
}

export function rewriteLoop(m: Machine): Machine {
    if (!(isLoop(m.term))) { throw "expected LoopTerm"; };
    let iterator = m.term.iterator;
    while (true) {
        const iteratorResult = rewriteTerm(m.copyWith({ term: iterator }));
        if (iteratorResult.blocked) {
            throw "blocked"
        }
        iterator = iteratorResult.term;
        if (iterator.done) {
            return m.copyWith({ term: null });
        }
        let bindings = m.bindings;
        if ("pattern" in m.term && "value" in iterator) {
            const matchResult = matchTerm(m, m.term.pattern, iterator.value);
            if (matchResult === false) { 
                throw "match failed"
            }
            bindings = Object.assign({}, bindings, matchResult);
        }
        const termResult = rewriteTerm(m.copyWith({ term: m.term.term, bindings: bindings }));
        if (termResult.blocked) {
            throw "blocked"
        }
    }
}
