"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTAPL = testTAPL;
// (#1) These tests are based on examples found in the book
// by Pierce, Benjamin C. "Types and Programming Languages" MIT Press
// ISBN 978-0-262-30382-8
// Church Booleans
// from 5.2 Programming in the Lambda - Calculus(1)
// tru = λt. λf. t;  (From #1)
// fun t -> fun f -> t
const tru = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "t" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "f" },
        term: { $policy: "Lookup", name: "t" }
    }
};
function equalsTru(x) {
    return (x.$policy === "Function") &&
        (x.pattern.$policy === "Lookup") &&
        (x.pattern.name === "t") &&
        (x.term.$policy === "Function") &&
        (x.term.pattern.$policy === "Lookup") &&
        (x.term.pattern.name === "f") &&
        (x.term.term.$policy === "Lookup") &&
        (x.term.term.name === "t");
}
// fls = λt. λf. f;  (From #1)
const fls = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "t" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "f" },
        term: { $policy: "Lookup", name: "f" }
    }
};
function equalsFls(x) {
    return (x.$policy === "Function") &&
        (x.pattern.$policy === "Lookup") &&
        (x.pattern.name === "t") &&
        (x.term.$policy === "Function") &&
        (x.term.pattern.$policy === "Lookup") &&
        (x.term.pattern.name === "f") &&
        (x.term.term.$policy === "Lookup") &&
        (x.term.term.name === "f");
}
// test = λl. λm. λn. l m n;  (From #1)
// fun l -> fun m -> fun n -> (l m) n
const test = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "l" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "m" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "n" },
            term: {
                $policy: "Application",
                function: {
                    $policy: "Application",
                    function: { $policy: "Lookup", name: "l" },
                    arg: { $policy: "Lookup", name: "m" }
                },
                arg: { $policy: "Lookup", name: "n" }
            }
        }
    }
};
// and = λb. λc. b c fls;   (From #1)
// fun b -> fun c -> (b c) fls
const and = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "b" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "c" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "b" },
                arg: { $policy: "Lookup", name: "c" }
            },
            arg: fls
        }
    }
};
// or = λb. λc. b tru c;    (From #1)
// fun b -> fun c -> (b tru) c
let or = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "b" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "c" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "b" },
                arg: tru
            },
            arg: { $policy: "Lookup", name: "c" }
        }
    }
};
// not = λb.b fls tru;      (From #1)
// fun b -> (b fls) tru
let not = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "b" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "b" },
            arg: fls
        },
        arg: tru
    }
};
const machine_1 = require("./machine");
const term_1 = require("./term");
const app_1 = require("./app");
function testTAPL() {
    testNotFls();
    testNotTru();
    testOrFlsFls();
    testOrFlsTru();
    testOrTruTru();
    testOrTruFls();
    testAndFlsFls();
    testAndFlsTru();
    testAndTruFls();
    testAndTruTru();
    testFls();
    testTru();
    testTestCombinator();
}
function testNotFls() {
    // not fls
    const term = {
        $policy: "Application",
        function: not,
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsTru(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testNotTru() {
    // not tru
    const term = {
        $policy: "Application",
        function: not,
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsFls(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testOrFlsFls() {
    // or fls fls
    // (or fls) fls
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: or,
            arg: fls
        },
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsFls(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testOrFlsTru() {
    // or fls tru
    // (or fls) tru
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: or,
            arg: fls
        },
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsTru(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testOrTruTru() {
    // or tru tru
    // (or tru) tru
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: or,
            arg: tru
        },
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsTru(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testOrTruFls() {
    // or tru fls
    // (or tru) fls
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: or,
            arg: tru
        },
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsTru(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testAndFlsFls() {
    // and fls fls
    // (and fls) fls
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: and,
            arg: fls
        },
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsFls(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testAndFlsTru() {
    // and fls tru
    // (and fls) tru
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: and,
            arg: fls
        },
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsFls(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testAndTruFls() {
    // and tru fls  (From #1)
    // (and tru) fls
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: and,
            arg: tru
        },
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsFls(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testAndTruTru() {
    // and tru tru  (From #1)
    // (and tru) tru
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: and,
            arg: tru
        },
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(equalsTru(r.term));
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testTestCombinator() {
    // test b v w   (From #1)
    // ((test b) v) w
    // if b then v else w
    const b = tru;
    const v = "v";
    const w = "w";
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: test,
                arg: b
            },
            arg: v
        },
        arg: w
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(r.term === v);
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testFls() {
    // tru "a" "b"
    const a = "a";
    const b = "b";
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: fls,
            arg: a
        },
        arg: b
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(r.term === b);
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
function testTru() {
    // tru "a" "b"
    const a = "a";
    const b = "b";
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: tru,
            arg: a
        },
        arg: b
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, app_1.passOrThrow)(r.term === a);
    (0, app_1.passOrThrow)(r.bindings === m.bindings);
}
//# sourceMappingURL=testsTAPL.js.map