"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const machine_1 = require("./machine");
const term_1 = require("./term");
function passOrThrow(condition) {
    if (!condition) {
        throw "Test failed";
    }
}
const dev = false;
if (dev) {
    // Run the test under development.
    develop();
}
else {
    // Run all the tests.
    testApplyFunction();
    testLet();
    testLookupBlocked();
    testLookupSuccess();
    testConstantWrappedConstant();
    testConstantTerm1();
    testConstantArray();
    testConstantObjectOneProperty();
    testConstantEmptyObject();
    testConstantNull();
}
function develop() {
}
function testApplyFunction() {
    // (fun x -> x) 1
    const term = {
        $policy: "Application",
        function: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "x" },
            term: { $policy: "Lookup", name: "x" }
        },
        arg: 1
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testLet() {
    // let x = 1 in 2
    const term = {
        $policy: "Let",
        binding: {
            $policy: "PatternBinding",
            pattern: { $policy: "Lookup", name: "x" },
            term: 1
        },
        in: 2
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(("x" in r.bindings) && (r.bindings.x === 1) && (Object.keys(r.bindings).length === 1));
    passOrThrow(r.term === 2);
}
function testLookupBlocked() {
    const term = { $policy: "Lookup", name: "x" };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.blocked === true);
    passOrThrow(r.term === term);
}
function testLookupSuccess() {
    const term = { $policy: "Lookup", name: "x" };
    const bindings = {
        "x": 1
    };
    const m = new machine_1.Machine(term, false, bindings);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === bindings);
}
function testConstantWrappedConstant() {
    const term = { $policy: "Constant", value: { $policy: "Constant", value: 1 } };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantTerm1() {
    const term = { $policy: "Constant", value: 1 };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantArray() {
    const m = new machine_1.Machine([1, true]);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantObjectOneProperty() {
    const m = new machine_1.Machine({ x: 1 });
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantEmptyObject() {
    const m = new machine_1.Machine({});
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantNull() {
    const m = new machine_1.Machine(null);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
//# sourceMappingURL=app.js.map