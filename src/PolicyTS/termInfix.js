"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInfix = isInfix;
exports.rewriteInfix = rewriteInfix;
exports.matchInfix = matchInfix;
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
    const resultOfLeft = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.left }));
    if (resultOfLeft.blocked) {
        throw "blocked";
    }
    const resultOfRight = (0, term_1.rewriteTerm)(m.copyWith({ term: m.term.right }));
    if (resultOfRight.blocked) {
        throw "blocked";
    }
    let result = undefined;
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
        case "&&":
            result = resultOfLeft.term && resultOfRight.term;
            break;
        case "||":
            result = resultOfLeft.term || resultOfRight.term;
            break;
        default:
            throw "unknown operator";
    }
    if (result === undefined) {
        throw "undefined";
    }
    return m.copyWith({ term: result });
}
/*
## Match Rules


*/
function matchInfix(pattern, value) {
    if (!(isInfix(pattern))) {
        throw "expected Infix";
    }
    ;
    // todo
    return false;
}
//# sourceMappingURL=termInfix.js.map