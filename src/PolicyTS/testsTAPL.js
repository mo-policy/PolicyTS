"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTAPL = testTAPL;
// (#1) These tests are based on examples found in the book
// by Pierce, Benjamin C. "Types and Programming Languages" MIT Press
// ISBN 978-0-262-30382-8
// Church Booleans
// from 5.2 Programming in the Lambda - Calculus(#1)
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
const or = {
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
const not = {
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
// Pairs
// pair = λf.λs.λb. b f s;   (From #1)
// fun f -> fun s -> fun b -> (b f) s
const pair = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "f" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "s" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "b" },
            term: {
                $policy: "Application",
                function: {
                    $policy: "Application",
                    function: { $policy: "Lookup", name: "b" },
                    arg: { $policy: "Lookup", name: "f" }
                },
                arg: { $policy: "Lookup", name: "s" }
            }
        }
    }
};
// fst = λp. p tru;   (From #1)
// fun p -> p tru
const fst = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "p" },
    term: {
        $policy: "Application",
        function: { $policy: "Lookup", name: "p" },
        arg: tru
    }
};
// snd = λp. p fls;   (From #1)
// fun p -> p fls
const snd = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "p" },
    term: {
        $policy: "Application",
        function: { $policy: "Lookup", name: "p" },
        arg: fls
    }
};
// Church Numerals
const c0 = fls;
// scc = λn. λs. λz. s (n s z);   (From #1)
// fun n -> fun s -> fun z -> s ((n s) z)
const scc = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "n" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "s" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "z" },
            term: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "s" },
                arg: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: { $policy: "Lookup", name: "n" },
                        arg: { $policy: "Lookup", name: "s" }
                    },
                    arg: { $policy: "Lookup", name: "z" }
                }
            }
        }
    }
};
// plus = λm. λn. λs. λz. m s (n s z);      (From #1)
// fun m -> fun n -> fun s -> fun z -> (m s) ((n s) z)
const plus = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "n" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "s" },
            term: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: "z" },
                term: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: { $policy: "Lookup", name: "m" },
                        arg: { $policy: "Lookup", name: "s" }
                    },
                    arg: {
                        $policy: "Application",
                        function: {
                            $policy: "Application",
                            function: { $policy: "Lookup", name: "n" },
                            arg: { $policy: "Lookup", name: "s" }
                        },
                        arg: { $policy: "Lookup", name: "z" }
                    }
                }
            }
        }
    }
};
// times = λm. λn. m (plus n) c0;   (From #1)
// fun m -> fun n -> (m (plus n)) c0
const times = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "n" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "m" },
                arg: {
                    $policy: "Application",
                    function: plus,
                    arg: { $policy: "Lookup", name: "n" }
                }
            },
            arg: c0
        }
    }
};
// iszro = λm. m (λx. fls) tru;   (From #1)
// fun m -> (m (fun x -> fls)) tru
const iszro = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "m" },
            arg: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: "x" },
                term: fls
            }
        },
        arg: tru
    }
};
// zz = pair c0 c0;     (From #1)
// (pair c0) c0
const zz = {
    $policy: "Application",
    function: {
        $policy: "Application",
        function: pair,
        arg: c0
    },
    arg: c0
};
// ss = λp.pair (snd p) (plus c1 (snd p));   (From #1)
// fun p -> (pair (snd p)) ((plus c1) (snd p))
const ss = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "p" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: pair,
            arg: {
                $policy: "Application",
                function: snd,
                arg: { $policy: "Lookup", name: "p" }
            },
        },
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: plus,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            },
            arg: {
                $policy: "Application",
                function: snd,
                arg: { $policy: "Lookup", name: "p" }
            }
        }
    }
};
// prd = λm.fst (m ss zz);   (From #1)
// fun m -> fst ((m ss) zz)
const prd = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Application",
        function: fst,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "m" },
                arg: ss
            },
            arg: zz
        }
    }
};
// subtract1 = λm. λn. n prd m;  (From #1)
// fun m -> fun n -> (n prd) m
const subtract1 = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "n" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "n" },
                arg: prd
            },
            arg: { $policy: "Lookup", name: "m" }
        }
    }
};
// equal = λm. λn. and (iszro (m prd n)) (iszro (n prd m));  (From #1)
// fun m -> fun n -> (and (iszro ((m prd) n))) (iszro ((n prd) m))
const equal = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "n" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: and,
                arg: {
                    $policy: "Application",
                    function: iszro,
                    arg: {
                        $policy: "Application",
                        function: {
                            $policy: "Application",
                            function: { $policy: "Lookup", name: "m" },
                            arg: prd
                        },
                        arg: { $policy: "Lookup", name: "n" }
                    }
                }
            },
            arg: {
                $policy: "Application",
                function: iszro,
                arg: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: { $policy: "Lookup", name: "n" },
                        arg: prd
                    },
                    arg: { $policy: "Lookup", name: "m" }
                }
            }
        }
    }
};
// realbool = λb. b true false;  (From #1)
// fun b -> (b true) false
const realbool = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "b" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "b" },
            arg: true
        },
        arg: false
    }
};
// churchbool = λb. if b then tru else fls;  (From #1)
// fun b -> if b then tru else fls
const churchbool = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "b" },
    term: {
        $policy: "If",
        condition: { $policy: "Lookup", name: "b" },
        then: tru,
        else: fls
    }
};
// realeq = λm. λn. (equal m n) true false;  (From #1)
// fun m -> fun n -> (((equal m) n) true) false
const realeq = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "n" },
        term: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: equal,
                        arg: { $policy: "Lookup", name: "m" }
                    },
                    arg: { $policy: "Lookup", name: "n" }
                },
                arg: true
            },
            arg: false
        }
    }
};
// realnat = λm. m (λx. succ x) 0;  (From #1)
// fun m -> (m (fun x -> succ x)) 0
const realnat = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "m" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: { $policy: "Lookup", name: "m" },
            arg: {
                $policy: "Function",
                pattern: { $policy: "Lookup", name: "x" },
                term: {
                    $policy: "succ",
                    arg: { $policy: "Lookup", name: "x" }
                }
            }
        },
        arg: 0
    }
};
// fix = λf. (λx. f (λy. x x y)) (λx. f (λy. x x y));  (From #1)
// fun f -> (fun x -> f (fun y -> (x x) y)) (fun x -> f (fun y -> (x x) y))
const fix = {
    $policy: "Function",
    pattern: { $policy: "Lookup", name: "f" },
    term: {
        $policy: "Application",
        function: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "x" },
            term: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "f" },
                arg: {
                    $policy: "Function",
                    pattern: { $policy: "Lookup", name: "y" },
                    term: {
                        $policy: "Application",
                        function: {
                            $policy: "Application",
                            function: { $policy: "Lookup", name: "x" },
                            arg: { $policy: "Lookup", name: "x" }
                        },
                        arg: { $policy: "Lookup", name: "y" }
                    }
                }
            }
        },
        arg: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "x" },
            term: {
                $policy: "Application",
                function: { $policy: "Lookup", name: "f" },
                arg: {
                    $policy: "Function",
                    pattern: { $policy: "Lookup", name: "y" },
                    term: {
                        $policy: "Application",
                        function: {
                            $policy: "Application",
                            function: { $policy: "Lookup", name: "x" },
                            arg: { $policy: "Lookup", name: "x" }
                        },
                        arg: { $policy: "Lookup", name: "y" }
                    }
                }
            }
        }
    }
};
const machine_1 = require("./machine");
const term_1 = require("./term");
const tests_1 = require("./tests");
function testTAPL() {
    testFactorial();
    testRealnatTimes22();
    testRealnat2();
    testRealnat0();
    testRealeq01();
    testRealeq00();
    testChurchboolFalse();
    testChurchboolTrue();
    testRealboolFls();
    testRealboolTru();
    testEqual33();
    testEqual32();
    testEqual01();
    testEqual00();
    testIszroSubtract321();
    testIszroSubtract10();
    testIszroSubtract00();
    testIszroPrd1();
    testIszro1();
    testIszro0();
    testSnd();
    testFst();
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
class MachineWithSucc extends machine_1.Machine {
    copyWith(values) {
        return Object.assign(new MachineWithSucc(), this, values);
    }
    getRewriteFunction() {
        if ((this.term !== null) &&
            (typeof this.term === "object") &&
            ("$policy" in this.term)) {
            if (this.term.$policy === "succ") {
                return (function (mm) {
                    const x = mm.bindings["x"];
                    return mm.copyWith({ term: x + 1 });
                });
            }
            else {
                return super.getRewriteFunction();
            }
        }
        else {
            return super.getRewriteFunction();
        }
    }
}
function testFactorial() {
    // g = λfct. λn. if realeq n c0 then c1 else (times n (fct (prd n)));   (From #1)
    // fun fct -> fun n -> if realeq n c0 then c1 else ((times n) (fct (prd n)))
    const g = {
        $policy: "Function",
        pattern: { $policy: "Lookup", name: "fct" },
        term: {
            $policy: "Function",
            pattern: { $policy: "Lookup", name: "n" },
            term: {
                $policy: "If",
                condition: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: realeq,
                        arg: { $policy: "Lookup", name: "n" }
                    },
                    arg: c0
                },
                then: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                },
                else: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: times,
                        arg: { $policy: "Lookup", name: "n" }
                    },
                    arg: {
                        $policy: "Application",
                        function: { $policy: "Lookup", name: "fct" },
                        arg: {
                            $policy: "Application",
                            function: prd,
                            arg: { $policy: "Lookup", name: "n" }
                        }
                    }
                }
            }
        }
    };
    // factorial = fix g;   (From #1)
    const factorial = {
        $policy: "Application",
        function: fix,
        arg: g
    };
    const termFactorial0 = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: factorial,
            arg: c0
        }
    };
    const m0 = new MachineWithSucc(termFactorial0);
    const r0 = (0, term_1.rewriteTerm)(m0);
    (0, tests_1.passOrThrow)(r0.term === 1);
    (0, tests_1.passOrThrow)(r0.bindings === m0.bindings);
    const termFactorial1 = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: factorial,
            arg: {
                $policy: "Application",
                function: scc,
                arg: c0
            }
        }
    };
    const m1 = new MachineWithSucc(termFactorial1);
    const r1 = (0, term_1.rewriteTerm)(m1);
    (0, tests_1.passOrThrow)(r1.term === 1);
    (0, tests_1.passOrThrow)(r1.bindings === m1.bindings);
    const termFactorial2 = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: factorial,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            }
        }
    };
    const m2 = new MachineWithSucc(termFactorial2);
    const r2 = (0, term_1.rewriteTerm)(m2);
    (0, tests_1.passOrThrow)(r2.term === 2);
    (0, tests_1.passOrThrow)(r2.bindings === m2.bindings);
    const termFactorial3 = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: factorial,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: c0
                    }
                }
            }
        }
    };
    const m3 = new MachineWithSucc(termFactorial3);
    const r3 = (0, term_1.rewriteTerm)(m3);
    (0, tests_1.passOrThrow)(r3.term === 6);
    (0, tests_1.passOrThrow)(r3.bindings === m3.bindings);
    const termFactorial4 = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: factorial,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: {
                            $policy: "Application",
                            function: scc,
                            arg: c0
                        }
                    }
                }
            }
        }
    };
    const m4 = new MachineWithSucc(termFactorial4);
    const r4 = (0, term_1.rewriteTerm)(m4);
    (0, tests_1.passOrThrow)(r4.term === 24);
    (0, tests_1.passOrThrow)(r4.bindings === m4.bindings);
}
function testRealnatTimes22() {
    // realnat ((times c2) c2);   (From #1)
    const term = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: times,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: c0
                    }
                }
            },
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            }
        }
    };
    const m = new MachineWithSucc(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === 4);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealnat2() {
    // realnat 2
    const term = {
        $policy: "Application",
        function: realnat,
        arg: {
            $policy: "Application",
            function: scc,
            arg: {
                $policy: "Application",
                function: scc,
                arg: c0
            }
        }
    };
    const m = new MachineWithSucc(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === 2);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealnat0() {
    // realnat 0
    const term = {
        $policy: "Application",
        function: realnat,
        arg: c0
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === 0);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealeq01() {
    // (equal 0) 1
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: realeq,
            arg: c0
        },
        arg: {
            $policy: "Application",
            function: scc,
            arg: c0
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === false);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealeq00() {
    // (equal 0) 0
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: realeq,
            arg: c0
        },
        arg: c0
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === true);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testChurchboolFalse() {
    // churchbool false
    const term = {
        $policy: "Application",
        function: churchbool,
        arg: false
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testChurchboolTrue() {
    // churchbool true
    const term = {
        $policy: "Application",
        function: churchbool,
        arg: true
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealboolFls() {
    // realbool fls
    const term = {
        $policy: "Application",
        function: realbool,
        arg: fls
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === false);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testRealboolTru() {
    // realbool tru
    const term = {
        $policy: "Application",
        function: realbool,
        arg: tru
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === true);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testEqual33() {
    // (equal 3) 3
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: equal,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: {
                            $policy: "Application",
                            function: scc,
                            arg: c0
                        }
                    }
                }
            }
        },
        arg: {
            $policy: "Application",
            function: scc,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: c0
                    }
                }
            }
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testEqual32() {
    // (equal 3) 2
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: equal,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: {
                            $policy: "Application",
                            function: scc,
                            arg: c0
                        }
                    }
                }
            }
        },
        arg: {
            $policy: "Application",
            function: scc,
            arg: {
                $policy: "Application",
                function: scc,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            }
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testEqual01() {
    // (equal 0) 1
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: equal,
            arg: c0
        },
        arg: {
            $policy: "Application",
            function: scc,
            arg: c0
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testEqual00() {
    // (equal 0) 0
    const term = {
        $policy: "Application",
        function: {
            $policy: "Application",
            function: equal,
            arg: c0
        },
        arg: c0
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testIszroSubtract321() {
    // 0 = 3 - 2 - 1
    // iszro (subtract1 (((subtract1 3) 2) 1))
    const term = {
        $policy: "Application",
        function: iszro,
        arg: {
            $policy: "Application",
            function: subtract1,
            arg: {
                $policy: "Application",
                function: {
                    $policy: "Application",
                    function: {
                        $policy: "Application",
                        function: subtract1,
                        arg: {
                            $policy: "Application",
                            function: scc,
                            arg: {
                                $policy: "Application",
                                function: scc,
                                arg: {
                                    $policy: "Application",
                                    function: scc,
                                    arg: c0
                                }
                            }
                        }
                    },
                    arg: {
                        $policy: "Application",
                        function: scc,
                        arg: {
                            $policy: "Application",
                            function: scc,
                            arg: c0
                        }
                    }
                },
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            }
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testIszroSubtract10() {
    // iszro ((substract1 1) 0)
    const term = {
        $policy: "Application",
        function: iszro,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: subtract1,
                arg: {
                    $policy: "Application",
                    function: scc,
                    arg: c0
                }
            },
            arg: c0
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testIszroSubtract00() {
    // iszro ((substract1 0) 0)
    const term = {
        $policy: "Application",
        function: iszro,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: subtract1,
                arg: c0
            },
            arg: c0
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
// iszro (prd (scc c0))
function testIszroPrd1() {
    const term = {
        $policy: "Application",
        function: iszro,
        arg: {
            $policy: "Application",
            function: prd,
            arg: {
                $policy: "Application",
                function: scc,
                arg: c0
            }
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
// iszro (scc c0)
function testIszro1() {
    const term = {
        $policy: "Application",
        function: iszro,
        arg: {
            $policy: "Application",
            function: scc,
            arg: c0
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testIszro0() {
    const term = {
        $policy: "Application",
        function: iszro,
        arg: c0
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
function testSnd() {
    // snd ((pair v) w)
    const v = "v";
    const w = "w";
    const term = {
        $policy: "Application",
        function: snd,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: pair,
                arg: v
            },
            arg: w
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === w);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
// fst (pair v w) →∗ v   (From #1)
function testFst() {
    // fst ((pair v) w)
    const v = "v";
    const w = "w";
    const term = {
        $policy: "Application",
        function: fst,
        arg: {
            $policy: "Application",
            function: {
                $policy: "Application",
                function: pair,
                arg: v
            },
            arg: w
        }
    };
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    (0, tests_1.passOrThrow)(r.term === v);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsFls(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(equalsTru(r.term));
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(r.term === v);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(r.term === b);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
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
    (0, tests_1.passOrThrow)(r.term === a);
    (0, tests_1.passOrThrow)(r.bindings === m.bindings);
}
//# sourceMappingURL=testsTAPL.js.map