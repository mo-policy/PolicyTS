"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.passOrThrow = passOrThrow;
const machine_1 = require("./machine");
const term_1 = require("./term");
const testsTAPL_1 = require("./testsTAPL");
const termFunction_1 = require("./termFunction");
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
        pattern: { $policy: "Lookup", name: "x" },
        term: 1,
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
    const m = new machine_1.Machine(term, undefined, bindings);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testQuote() {
    // {@ {@ 1 @} @}
    const term = {
        $policy: "Quote",
        quote: { $policy: "Quote", quote: 1 }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testRewrite() {
    // {= { $policy: "Lookup", name: "x"} @} =}
    const term = {
        $policy: "Rewrite",
        code: { $policy: "Lookup", name: "x" }
    };
    const bindings = {
        "x": 1
    };
    const m = new machine_1.Machine(term, undefined, bindings);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === bindings);
}
function testExternal() {
    // let f = fun x -> { ... external ... } in f 1
    const term = {
        $policy: "Let",
        pattern: { $policy: "Lookup", name: "f" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "x" },
            term: {
                $policy: "External",
                external: (m) => {
                    const x = m.bindings["x"];
                    return m.copyWith({ term: x + 1 });
                }
            }
        },
        in: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "f" },
            arg: 1
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 2);
}
function testQuoteTerm1() {
    // {@ 1 @}
    const term = { $policy: "Quote", quote: 1 };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const mjs = JSON.stringify(m);
    const rjs = JSON.stringify(r);
    passOrThrow(mjs === rjs);
}
function testParallelArray() {
    // [x |, y] // x is blocked 
    const bindings = {
        "y": 2
    };
    const term = [
        { $policy: "Lookup", name: "x" },
        {
            $policy: "Parallel",
            term: { $policy: "Lookup", name: "y" }
        }
    ];
    const expected = [{ $policy: "Lookup", name: "x" }, 2];
    const m = new machine_1.Machine(term, undefined, bindings);
    const r = (0, term_1.rewriteTerm)(m);
    const actualJS = JSON.stringify(r.term);
    const expectedJS = JSON.stringify(expected);
    passOrThrow(r.blocked === true);
    passOrThrow(actualJS === expectedJS);
}
function testParallelObject() {
    // { x: x |, y: 2} // x is blocked 
    const bindings = {
        "y": 2
    };
    const term = {
        x: { $policy: "Lookup", name: "x" },
        y: {
            $policy: "Parallel",
            term: { $policy: "Lookup", name: "y" }
        }
    };
    const expected = { x: { $policy: "Lookup", name: "x" }, y: 2 };
    const m = new machine_1.Machine(term, undefined, bindings);
    const r = (0, term_1.rewriteTerm)(m);
    const actualJS = JSON.stringify(r.term);
    const expectedJS = JSON.stringify(expected);
    passOrThrow(r.blocked === true);
    passOrThrow(actualJS === expectedJS);
}
function testParallelSequence() {
    // x |; y   // x is blocked
    const bindings = {
        "y": 2
    };
    const term = {
        $policy: "Sequence",
        terms: [
            { $policy: "Lookup", name: "x" },
            {
                $policy: "Parallel",
                term: { $policy: "Lookup", name: "y" }
            }
        ]
    };
    const expected = {
        $policy: "Sequence",
        terms: [
            { $policy: "Lookup", name: "x" },
            2
        ]
    };
    const m = new machine_1.Machine(term, undefined, bindings);
    const r = (0, term_1.rewriteTerm)(m);
    const actualJS = JSON.stringify(r.term);
    const expectedJS = JSON.stringify(expected);
    passOrThrow(r.blocked === true);
    passOrThrow(actualJS === expectedJS);
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
function testMatch1() {
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchAsPattern() {
    // match 2 with | 1 -> 1 | 2 as x -> x
    const term = {
        $policy: "Match",
        term: 2,
        rules: [
            {
                $policy: "Rule",
                pattern: 1,
                term: 1
            },
            {
                $policy: "Rule",
                pattern: {
                    $policy: "AsPattern",
                    term: 2,
                    name: "x"
                },
                term: { $policy: "Lookup", name: "x" }
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchNull() {
    // match null with null -> 1
    const term = {
        $policy: "Match",
        term: null,
        rules: [
            {
                $policy: "Rule",
                pattern: null,
                term: 1
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchListEmpty() {
    // match [] with false -> 1 | [] -> 2
    const term = {
        $policy: "Match",
        term: [],
        rules: [
            {
                $policy: "Rule",
                pattern: false,
                term: 1
            },
            {
                $policy: "Rule",
                pattern: [],
                term: 2
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchList() {
    // match [2, false] with false -> 1 | [x, false] -> x
    const term = {
        $policy: "Match",
        term: [2, false],
        rules: [
            {
                $policy: "Rule",
                pattern: false,
                term: 1
            },
            {
                $policy: "Rule",
                pattern: [{ $policy: "Lookup", name: "x" }, false],
                term: { $policy: "Lookup", name: "x" }
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchMapEmpty() {
    // match {} with {} -> 1
    const term = {
        $policy: "Match",
        term: [],
        rules: [
            {
                $policy: "Rule",
                pattern: {},
                term: 1
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchMap() {
    // match { a: 1, b: "hello" } with {b: "hello", a: x} -> x
    const term = {
        $policy: "Match",
        term: { a: 1, b: "hello" },
        rules: [
            {
                $policy: "Rule",
                pattern: { b: "hello", a: { $policy: "Lookup", name: "x" } },
                term: { $policy: "Lookup", name: "x" }
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testMatchGuardBlocked() {
    // match 1 + 1 with
    // | x when y -> 3
    // | _ -> 4
    const term = {
        $policy: "Match",
        term: {
            $policy: "Infix",
            left: 1,
            operator: "+",
            right: 1
        },
        rules: [
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                guard: { $policy: "Lookup", name: "y" },
                term: 3
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "_" },
                term: 4
            }
        ]
    };
    /*
    match term with
    | blockedRule.pattern when blockedGuard -> blockedRule.term
    | remaining rules...
    | _ -> resultOfTerm.term
    */
    const expected = {
        $policy: "Match",
        term: 2,
        rules: [
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "x" },
                guard: { $policy: "Lookup", name: "y" },
                term: 3
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "_" },
                term: 4
            },
            {
                $policy: "Rule",
                pattern: { $policy: "Lookup", name: "_" },
                term: {
                    $policy: "Match",
                    term: 2,
                    rules: [
                        {
                            $policy: "Rule",
                            pattern: { $policy: "Lookup", name: "x" },
                            guard: { $policy: "Lookup", name: "y" },
                            term: 3
                        },
                        {
                            $policy: "Rule",
                            pattern: { $policy: "Lookup", name: "_" },
                            term: 4
                        }
                    ]
                }
            }
        ]
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const rtjs = JSON.stringify(r.term);
    const ejs = JSON.stringify(expected);
    passOrThrow(rtjs === ejs);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === "error caught");
    passOrThrow(r.bindings === m.bindings);
}
function testTryFinally() {
    // try 1 finally 2
    const term = {
        $policy: "TryFinally",
        term: 1,
        finally: 2
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    ];
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
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
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 2);
    passOrThrow(r.bindings === m.bindings);
}
function testForTo() {
    // for i = 1 to 3 do 
    //     null
    const term = {
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
        term: 1
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === null);
    passOrThrow(r.bindings === m.bindings);
}
function testWhile() {
    // while true do
    //     throw 1
    const term = {
        $policy: "Loop",
        iterator: {
            $policy: "WhileIterator",
            done: false,
            condition: true
        },
        term: {
            $policy: "Exception",
            term: 1
        }
    };
    const expected = {
        $policy: "Exception",
        term: 1
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const rtjs = JSON.stringify(r.term);
    const ejs = JSON.stringify(expected);
    passOrThrow(rtjs === ejs);
    passOrThrow(r.bindings === m.bindings);
}
function testInfixPlus() {
    // 1 + 2
    const term = {
        $policy: "Infix",
        operator: "+",
        left: 1,
        right: 2
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 3);
    passOrThrow(r.bindings === m.bindings);
}
function testInfixPlusString() {
    // "a" + "b"
    const term = {
        $policy: "Infix",
        operator: "+",
        left: "a",
        right: "b"
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === "ab");
    passOrThrow(r.bindings === m.bindings);
}
function testAnnotationIsInteger() {
    const term = {
        $policy: "Annotation",
        term: 1,
        type: "integer"
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 1);
    passOrThrow(r.bindings === m.bindings);
}
function testAnnotationIsNull() {
    const term = {
        $policy: "Annotation",
        term: null,
        type: "null"
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === null);
    passOrThrow(r.bindings === m.bindings);
}
function testAnnotationError() {
    const term = {
        $policy: "Annotation",
        term: 1,
        type: "number"
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term.$policy === "Exception");
    passOrThrow(r.term.term === "type error");
    passOrThrow(r.bindings === m.bindings);
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
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 4);
    passOrThrow(r.bindings === m.bindings);
}
function testStepsInfix1() {
    const term = {
        $policy: "Infix",
        left: 1,
        operator: "+",
        right: 2
    };
    const m = new machine_1.Machine(term, 1);
    const r = (0, term_1.rewriteTerm)(m);
    passOrThrow(r.term === 3);
    passOrThrow(r.steps === 0);
    passOrThrow(r.bindings === m.bindings);
}
function testStepsInfixBlockedLeft() {
    const term = {
        $policy: "Infix",
        left: {
            $policy: "Infix",
            left: 2,
            operator: "*",
            right: 3
        },
        operator: "+",
        right: 1
    };
    const expected = {
        $policy: "Infix",
        left: 6,
        operator: "+",
        right: 1
    };
    const m = new machine_1.Machine(term, 1);
    const r = (0, term_1.rewriteTerm)(m);
    const ajs = JSON.stringify(r.term);
    const ejs = JSON.stringify(expected);
    passOrThrow(ajs === ejs);
    passOrThrow(r.steps === 0);
    passOrThrow(r.bindings === m.bindings);
}
function testStepsInfixBlockedRight() {
    const term = {
        $policy: "Infix",
        left: 1,
        operator: "+",
        right: {
            $policy: "Infix",
            left: 2,
            operator: "*",
            right: 3
        }
    };
    const expected = {
        $policy: "Infix",
        left: 1,
        operator: "+",
        right: 6
    };
    const m = new machine_1.Machine(term, 1);
    const r = (0, term_1.rewriteTerm)(m);
    const ajs = JSON.stringify(r.term);
    const ejs = JSON.stringify(expected);
    passOrThrow(ajs === ejs);
    passOrThrow(r.steps === 0);
    passOrThrow(r.bindings === m.bindings);
}
function testFreenames() {
    const m = new machine_1.Machine();
    let bound = {};
    let fn = {};
    // fun x -> x
    let t1 = {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "x" },
        term: { $policy: "Lookup", name: "x" }
    };
    const fn1 = (0, termFunction_1.freenames)(bound, fn, t1);
    passOrThrow(m.compare(fn1, {}) === 0);
    // fun x -> y
    bound = {};
    fn = {};
    let t2 = {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "x" },
        term: { $policy: "Lookup", name: "y" }
    };
    let fn2 = (0, termFunction_1.freenames)(bound, fn, t2);
    passOrThrow(m.compare(fn2, { y: null }) === 0);
    // fun x -> let y = x in y
    bound = {};
    fn = {};
    let t3 = {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "x" },
        term: {
            $policy: "Let",
            pattern: { $policy: "Lookup", name: "y" },
            term: { $policy: "Lookup", name: "x" },
            in: { $policy: "Lookup", name: "y" }
        }
    };
    let fn3 = (0, termFunction_1.freenames)(bound, fn, t3);
    passOrThrow(m.compare(fn3, {}) === 0);
    /*
    fun x ->
        let z = z in z;
    */
    bound = {};
    fn = {};
    let t4 = {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "x" },
        term: {
            $policy: "Let",
            pattern: { $policy: "Lookup", name: "z" },
            term: { $policy: "Lookup", name: "z" },
            in: { $policy: "Lookup", name: "z" }
        }
    };
    let fn4 = (0, termFunction_1.freenames)(bound, fn, t4);
    passOrThrow(m.compare(fn4, { z: null }) === 0);
}
function develop() {
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
    testFreenames();
    testStepsInfix1();
    testStepsInfixBlockedLeft();
    testStepsInfixBlockedRight();
    testExternal();
    testAnnotationIsInteger();
    testAnnotationIsNull();
    testAnnotationError();
    testInfixPlus();
    testInfixPlusString();
    testParallelSequence();
    testParallelObject();
    testParallelArray();
    testRewrite();
    testQuote();
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
    testMatch1();
    testMatchNull();
    testMatchListEmpty();
    testMatchList();
    testMatchMapEmpty();
    testMatchMap();
    testMatchAsPattern();
    testMatchGuard();
    testMatchGuardBlocked();
    testRefAssignment();
    testRefDereference();
    testFix();
    testApplyFunction();
    testLet();
    testLookupBlocked();
    testLookupSuccess();
    testQuote();
    testQuoteTerm1();
    testConstantArray();
    testConstantObjectOneProperty();
    testConstantEmptyObject();
    testConstantNull();
}
//# sourceMappingURL=tests.js.map