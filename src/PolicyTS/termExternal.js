"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExternal = isExternal;
exports.rewriteExternal = rewriteExternal;
function isExternal(term) {
    return (term !== null) &&
        (typeof term === "object") &&
        ("$policy" in term) && (term.$policy === "External") &&
        ("external" in term) &&
        (Object.keys(term).length === 2);
}
/*
## Rewrite Rules


*/
function rewriteExternal(m) {
    if (!(isExternal(m.term))) {
        throw "expected ExternalTerm";
    }
    ;
    const externalResult = m.term.external(m);
    return externalResult;
}
//# sourceMappingURL=termExternal.js.map