"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteFile = rewriteFile;
const fs_1 = require("fs");
const machine_1 = require("./machine");
const term_1 = require("./term");
const crypto_1 = require("crypto");
if (process.argv.length === 3) {
    let plfile = process.argv[2];
    const m = new machine_1.Machine();
    const r = rewriteFile(m, plfile);
    const rjs = JSON.stringify(r.term);
    process.stdout.write(rjs);
}
function rewriteFile(m, file) {
    const js = (0, fs_1.readFileSync)(file).toString();
    let term = JSON.parse(js);
    const fileResult = (0, term_1.rewriteTerm)(m.copyWith({ term: term }));
    return fileResult;
}
function termHash(term) {
    const hash = (0, crypto_1.createHash)("sha256");
    if (term === null) {
        hash.update("null");
    }
    else if (term === true) {
        hash.update("true");
    }
    else if (term === false) {
        hash.update("false");
    }
    else if (Array.isArray(term)) {
        hash.update("[");
        for (let i = 0; i < term.length; i++) {
            if (i > 0) {
                hash.update(",");
            }
            const h = termHash(term[i]);
            hash.update(h);
        }
        hash.update("]");
    }
    else {
        switch (typeof term) {
            case "object":
                hash.update("{");
                let first = true;
                for (const p in term) {
                    if (first) {
                        first = false;
                    }
                    else {
                        hash.update(",");
                    }
                    const pjs = JSON.stringify(p);
                    hash.update(pjs);
                    hash.update(":");
                    const h = termHash(term[p]);
                    hash.update(h);
                }
                hash.update("}");
                break;
            case "string":
            case "number":
                const js = JSON.stringify(term);
                hash.update(js);
                break;
            default:
                throw "unexpected type";
        }
    }
    return hash.digest();
}
//# sourceMappingURL=app.js.map