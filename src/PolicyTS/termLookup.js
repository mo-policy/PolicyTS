"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLookup = isLookup;
exports.rewriteLookup = rewriteLookup;
exports.matchLookup = matchLookup;
const term_1 = require("./term");
const termConstant_1 = require("./termConstant");
const termFunction_1 = require("./termFunction");
function isLookup(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "Lookup") &&
        ("name" in term) && (typeof term.name === "string") &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules

The lookup term has two reductions based on whether the value of
the 'name' property has been bound. If the 'name' property value is bound
to a value, then the lookup term reduces to the bound value. If the 'name'
property is not bound, then the lookup term blocks and the result of
the reduction is the lookup term.

*/
function rewriteLookup(m) {
    if (!(isLookup(m.term))) {
        throw "expected LookupTerm";
    }
    ;
    const binding = m.getBinding(m.term.name);
    if (binding === undefined) {
        return m.copyWith({ blocked: true });
    }
    else {
        if (((0, termConstant_1.isConstant)(binding) || (0, termFunction_1.isFunction)(binding))) {
            return m.copyWith({ term: binding });
        }
        else {
            return (0, term_1.rewriteTerm)(m.copyWith({ term: binding }));
        }
    }
}
/*
## Match Rules


*/
function matchLookup(pattern, value) {
    if (!(isLookup(pattern))) {
        throw "expected Lookup";
    }
    ;
    let r = {};
    if (pattern.name !== "_") {
        r[pattern.name] = value;
    }
    return r;
}
//# sourceMappingURL=termLookup.js.map