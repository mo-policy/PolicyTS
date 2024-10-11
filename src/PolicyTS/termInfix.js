"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInfix = isInfix;
exports.rewriteInfix = rewriteInfix;
const term_1 = require("./term");
function isInfix(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Infix") &&
        ("operator" in term) && (typeof term.operator === "string") &&
        ("left" in term) &&
        ("right" in term) &&
        (Object.keys(term).length === 4);
}
/*
## Rewrite Rules

rewrite left
rewrite right
< <= = >= >
+, -, *, /, %
&& ||

*/
function rewriteInfix(m) {
    if (!(isInfix(m.term))) {
        throw "expected InfixTerm";
    }
    ;
    let blockedTerm = Object.assign({}, m.term);
    let steps = m.steps;
    let result = undefined;
    const resultOfLeft = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.left }));
    Object.assign(blockedTerm, { left: resultOfLeft.term });
    steps = resultOfLeft.steps;
    if (resultOfLeft.blocked) {
        return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
    }
    else {
        if (m.term.operator === "&&") {
            if (resultOfLeft.term) {
                const resultOfRight = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.right, steps: steps }));
                Object.assign(blockedTerm, { right: resultOfRight.term });
                steps = resultOfRight.steps;
                if (resultOfRight.blocked) {
                    return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
                }
                else {
                    result = resultOfRight.term;
                }
            }
            else {
                result = false;
            }
        }
        else if (m.term.operator === "||") {
            if (resultOfLeft.term) {
                result = true;
            }
            else {
                const resultOfRight = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.right, steps: steps }));
                Object.assign(blockedTerm, { right: resultOfRight.term });
                steps = resultOfRight.steps;
                if (resultOfRight.blocked) {
                    return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
                }
                else {
                    result = resultOfRight.term;
                }
            }
        }
        else {
            const resultOfRight = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.right, steps: steps }));
            Object.assign(blockedTerm, { right: resultOfRight.term });
            steps = resultOfRight.steps;
            if (resultOfRight.blocked) {
                return m.copyWith({ term: blockedTerm, blocked: true, steps: steps });
            }
            else {
                switch (m.term.operator) {
                    case "=":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) === 0);
                        break;
                    case "<>":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) !== 0);
                        break;
                    case "<":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) < 0);
                        break;
                    case ">":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) > 0);
                        break;
                    case "<=":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) <= 0);
                        break;
                    case ">=":
                        result = (m.compare(resultOfLeft.term, resultOfRight.term) >= 0);
                        break;
                    case "+":
                        result = resultOfLeft.term + resultOfRight.term;
                        break;
                    case "-":
                        result = resultOfLeft.term - resultOfRight.term;
                        break;
                    case "*":
                        result = resultOfLeft.term * resultOfRight.term;
                        break;
                    case "^":
                        result = resultOfLeft.term ^ resultOfRight.term;
                        break;
                    case "/":
                        result = resultOfLeft.term / resultOfRight.term;
                        break;
                    case "%":
                        result = resultOfLeft.term % resultOfRight.term;
                        break;
                    default:
                        throw "unknown operator";
                }
            }
        }
    }
    if (result === undefined) {
        throw "undefined";
    }
    else {
        steps = (0, term_1.stepsMinusOne)(steps);
    }
    return (0, term_1.rewriteTerm)(m.copyWith({ term: result, steps: steps }));
}
//# sourceMappingURL=termInfix.js.map