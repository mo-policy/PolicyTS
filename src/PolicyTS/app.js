"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.passOrThrow = passOrThrow;
const machine_1 = require("./machine");
const term_1 = require("./term");
const testsTAPL_1 = require("./testsTAPL");
function passOrThrow(condition) {
    if (!condition) {
        throw "Test failed";
    }
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
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
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
class DevMachine extends machine_1.Machine {
    copyWith(values) {
        return Object.assign(new DevMachine(), this, values);
    }
    getRewriteFunction() {
        if (this.term === "x<4") {
            return (function LessThan4(m) {
                const x = m.bindings["x"];
                return m.copyWith({ term: (x < 4) });
            });
        }
        if (this.term === "x+1") {
            return (function XPlusPlus(m) {
                const x = m.bindings["x"];
                return m.copyWith({ term: (x + 1) });
            });
        }
        return super.getRewriteFunction();
    }
}
function develop() {
    // let rec f = fun x -> f x in f 1
    // let f = fix (fun f -> fun x -> f x) in f 1
    // let f = fix (fun f -> fun x -> if "x<4" then f "x++" else 4) in f 1
    const term = {
        $policy: "Let",
        binding: {
            $policy: "PatternBinding",
            pattern: { $policy: "Lookup", name: "f" },
            term: {
                $policy: "Fix",
                term: {
                    $policy: "Function",
                    pattern: { $policy: "Lookup", name: "f" },
                    term: {
                        $policy: "Function",
                        pattern: { $policy: "Lookup", name: "x" },
                        term: {
                            $policy: "If",
                            condition: "x<4",
                            then: {
                                $policy: "Application",
                                function: { $policy: "Lookup", name: "f" },
                                arg: "x+1"
                            },
                            else: 4
                        }
                    }
                }
            }
        },
        in: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "f" },
            arg: 1
        }
    };
    const m = new DevMachine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 4);
    passOrThrow(r.bindings === m.bindings);
}
const dev = false;
if (dev) {
    // Run the test under development.
    develop();
}
else {
    // Run all the tests.
    develop();
    (0, testsTAPL_1.testTAPL)();
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
//# sourceMappingURL=app.js.map