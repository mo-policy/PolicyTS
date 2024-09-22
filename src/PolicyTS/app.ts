// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { Machine } from "./machine"
import { rewriteTerm } from "./term"
import { testTAPL } from "./testsTAPL"

export function passOrThrow(condition: boolean): asserts condition {
    if (!condition) {
        throw "Test failed"
    }
}

function testApplyFunction() {
    // (fun x -> x) 1
    const term =
    {
        $policy: "Application",
        function: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "x" },
            term: { $policy: "Lookup", name: "x" }
        },
        arg: 1
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testLet() {
    // let x = 1 in 2
    const term = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: "x" },
        term: 1,
        in: 2
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}

function testLookupBlocked() {
    const term = { $policy: "Lookup", name: "x" };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.blocked === true);
    passOrThrow(r.term === term);
}

function testLookupSuccess() {
    const term = { $policy: "Lookup", name: "x" };
    const bindings: { [k: string]: any } = {
        "x": 1
    }
    const m = new Machine(term, false, bindings);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === bindings);
}

function testConstantWrappedConstant() {
    const term = { $policy: "Constant", value: { $policy: "Constant", value: 1 } };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantTerm1() {
    const term = { $policy: "Constant", value: 1 };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantArray() {
    const m = new Machine([1, true]);
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantObjectOneProperty() {
    const m = new Machine({ x: 1 });
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantEmptyObject() {
    const m = new Machine({});
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testConstantNull() {
    const m = new Machine(null);
    const r = rewriteTerm(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}

class DevMachine extends Machine {
    override copyWith(values: { [k: string]: any }): Machine {
        return Object.assign(new DevMachine(), this, values);
    }
    override getRewriteFunction() {
        if (this.term === "x<4") {
            return (
                function LessThan4(m: Machine): Machine {
                    const x = m.bindings["x"];
                    return m.copyWith({ term: (x < 4) });
                }
            );
        } if (this.term === "x+1") {
            return (
                function XPlusPlus(m: Machine): Machine {
                    const x = m.bindings["x"];
                    return m.copyWith({ term: (x + 1) });
                }
            );
        }
        return super.getRewriteFunction();

    }
}
function testFix() {
    // let f = fix (fun f -> fun x -> if "x<4" then f "x+1" else 4) in f 1
    const term = {
        $policy: "Let",
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
        },
        in: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "f" },
            arg: 1
        }
    };
    const m = new DevMachine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 4);
    passOrThrow(r.bindings === m.bindings);
}

function testLetRec() {
    // let rec f = (fun x -> if "x<4" then f "x+1" else 4) in f 1
    // let f = fix (fun f -> fun x -> if "x<4" then f "x+1" else 4) in f 1
    const term = {
        $policy: "LetRec",
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
        },
        in: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "f" },
            arg: 1
        }
    };
    const m = new DevMachine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 4);
    passOrThrow(r.bindings === m.bindings);
}
function develop() {
}

const dev = false;

if (dev) {
    // Run the test under development.
    develop();
} else {
    // Run all the tests.
    develop();
    testTAPL();

    testLetRec();
    testFix();
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

