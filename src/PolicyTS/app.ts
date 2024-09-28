// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { createHash, getHashes, Hash } from "crypto";
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

function testLookupMember() {
    // ({ x: 1 }).x
    const term = {
        $policy: "LookupMember",
        term: { x: 1 },
        member: "x"
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testLookupIndex() {
    // ([1, 2])[0]
    const term = {
        $policy: "LookupIndex",
        term: [1, 2],
        index: 0
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
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

function testMatch() {
    // match 1 with x -> x
    const term = {
        $policy: "Match",
        term: 1,
        rules: [
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                term: { $policy: "Lookup", name: "x" }
            }
        ]
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testMatchGuard() {
    // match 1 with
    // | 0 -> 0
    // | x when false -> 2
    // | x when true -> x
    // | _ -> 3
    const term = {
        $policy: "Match",
        term: 1,
        rules: [
            {
                $policy: "Rule",
                pattern: 0,
                term: 0
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                guard: false,
                term: 2
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                guard: true,
                term: { $policy: "Lookup", name: "x" }
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "_" },
                term: 3
            }
        ]
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testTryWith() {
    // try
    //     throw "error"
    // with x -> "error caught"
    const term = {
        $policy: "TryWith",
        term: {
            $policy: "Exception",
            term: "error"
        },
        rules: [
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                term: "error caught"
            }
        ]
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === "error caught");
    passOrThrow(r.bindings === m.bindings);
}

function testTryFinally() {
    // try 1 finally 2
    const term = {
        $policy: "TryFinally",
        term: 1,
        finally: 2
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testTryFinallyTermException() {
    // try throw 1 finally 2
    const term = {
        $policy: "TryFinally",
        term: {
            $policy: "Exception",
            term: 1
        },
        finally: 2
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term.$policy === "Exception");
    passOrThrow(r.term.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testTryFinallyException() {
    // try 1 finally throw 2
    const term = {
        $policy: "TryFinally",
        term: 1,
        finally: {
            $policy: "Exception",
            term: 2
        }
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term.$policy === "Exception");
    passOrThrow(r.term.term === 2);
    passOrThrow(r.bindings === m.bindings);
}

function testTryFinallyException2() {
    // try throw 1 finally throw 2
    const term = {
        $policy: "TryFinally",
        term: {
            $policy: "Exception",
            term: 1
        },
        finally: {
            $policy: "Exception",
            term: 2
        }
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term.$policy === "Exception");
    passOrThrow(r.term.term === 2);
    passOrThrow(r.bindings === m.bindings);
}

function testRefDereference() {
    // let x = ref 5 in !x
    const term = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: "x" },
        term: {
            $policy: "Ref",
            value: 5
        },
        in: {
            $policy: "Dereference",
            ref: { $policy: "Lookup", name: "x" }
        }
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 5);
    passOrThrow(r.bindings === m.bindings);
}

function testRefAssignment() {
    // let x = ref 5 in 
    // let y = x in 
    // [ (x:= 7), !x, !y, (y := 9), !x, !y ] 
    const term = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: "x" },
        term: {
            $policy: "Ref",
            value: 5
        },
        in: {
            $policy: "Let",
            pattern: { $policy: "Lookup", name: "y" },
            term: { $policy: "Lookup", name: "x" },
            in: [
                {
                    $policy: "Assignment",
                    ref: { $policy: "Lookup", name: "x" },
                    value: 7
                },
                {
                    $policy: "Dereference",
                    ref: { $policy: "Lookup", name: "x" }
                },
                {
                    $policy: "Dereference",
                    ref: { $policy: "Lookup", name: "y" }
                },
                {
                    $policy: "Assignment",
                    ref: { $policy: "Lookup", name: "y" },
                    value: 9
                },
                {
                    $policy: "Dereference",
                    ref: { $policy: "Lookup", name: "x" }
                },
                {
                    $policy: "Dereference",
                    ref: { $policy: "Lookup", name: "y" }
                }
            ]
        }
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(Array.isArray(r.term));
    passOrThrow(r.term.length === 6);
    passOrThrow(r.term[0] === null);
    passOrThrow(r.term[1] === 7);
    passOrThrow(r.term[2] === 7);
    passOrThrow(r.term[3] === null);
    passOrThrow(r.term[4] === 9);
    passOrThrow(r.term[5] === 9);
    passOrThrow(r.bindings === m.bindings);
}

function testSend() {
    // send "Hello" on "World"
    const term = {
        $policy: "Send",
        channel: "World",
        message: "Hello"
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === null);
    passOrThrow(r.bindings === m.bindings);
}

function testReceive() {
    /*
        [
            send "Hello" on "World",
            receive on "World" with
            | x -> x
        ]
    */
    const term = [
        {
            $policy: "Send",
            channel: "World",
            message: "Hello"
        },
        {
        $policy: "Receive",
        channel: "World",
        rules: [
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                term: { $policy: "Lookup", name: "x" }
            }
        ]
        }
    ]
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(Array.isArray(r.term));
    passOrThrow(r.term.length === 2);
    passOrThrow(r.term[0] === null);
    passOrThrow(r.term[1] === "Hello");
    passOrThrow(r.bindings === m.bindings);
}

function testPolicy1() {
    // policy 1 with
    // | 1 -> 2
    const term = {
        $policy: "Policy",
        term: 1,
        rules: [
            {
                $policy: "Rule",
                pattern: 1,
                term: 2
            }
        ]
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}

function testPolicy2() {
    // policy 1 with
    // | 2 -> 2
    const term = {
        $policy: "Policy",
        term: 1,
        rules: [
            {
                $policy: "Rule",
                pattern: 2,
                term: 2
            }
        ]
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}

function testPolicyNestedOuter() {
    /*
    policy 
        policy 1 with
        | 2 -> 2
    with 
    | 1 -> 3
    */
    const term = {
        $policy: "Policy",
        term: {
            $policy: "Policy",
            term: 1,
            rules: [
                {
                    $policy: "Rule",
                    pattern: 2,
                    term: 2
                }
            ]
        },
        rules: [
            {
                $policy: "Rule",
                pattern: 1,
                term: 3
            }
        ]
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 3);
    passOrThrow(r.bindings === m.bindings);
    passOrThrow(r.policies.length === 0);
}

function testPolicyNestedInner() {
    /*
    policy begin
        policy 1 with
        | 1 -> 2
    end with 
    | 2 -> 3
    */
    const term = {
        $policy: "Policy",
        term: {
            $policy: "Policy",
            term: 1,
            rules: [
                {
                    $policy: "Rule",
                    pattern: 1,
                    term: 2
                }
            ]
        },
        rules: [
            {
                $policy: "Rule",
                pattern: 2,
                term: 3
            }
        ]
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 3);
    passOrThrow(r.bindings === m.bindings);
    passOrThrow(r.policies.length === 0);
}

function testSequence() {
    // 1; 2
    const term = {
        $policy: "Sequence",
        terms: [
            1,
            2
        ]
    }
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}

function testForTo() {
    // for i = 1 to 3 do 
    //     null
    const term =
    {
        $policy: "Loop",
        iterator: {
            $policy: "ForToIterator",
            done: false,
            from: 1,
            value: 1,
            to: 3,
            step: 1
        },
        pattern: { $policy: "Lookup", name: "i" },
        term: null
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === null);
    passOrThrow(r.bindings === m.bindings);
}
function testWhile() {
    // while (fun null -> true) do
    //     1
    const term =
    {
        $policy: "Loop",
        iterator: {
            $policy: "WhileIterator",
            done: false,
            condition: {
                $policy: "Function",
                pattern: null,
                term: true
            }
        },
        term: 1
    };
    const m = new Machine(term);
    const r = rewriteTerm(m);
    passOrThrow(r.term === null);
    passOrThrow(r.bindings === m.bindings);
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

    testLookupMember();
    testLookupIndex();
    testWhile();
    testForTo();
    testSequence();
    testPolicy1();
    testPolicy2();
    testPolicyNestedOuter();
    testPolicyNestedInner();
    testTryFinally();
    testTryFinallyException();
    testTryFinallyException2();
    testTryFinallyTermException();
    testTryWith();
    testReceive();
    testSend();
    testMatch();
    testMatchGuard();
    testRefAssignment();
    testRefDereference();
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

