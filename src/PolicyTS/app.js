"use strict";
// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const machine_1 = require("./machine");
const term_1 = require("./term");
if (process.argv.length === 3) {
    let plfile = process.argv[2];
    const js = (0, fs_1.readFileSync)(plfile).toString();
    let term = JSON.parse(js);
    const m = new machine_1.Machine(term);
    const r = (0, term_1.rewriteTerm)(m);
    const rjs = JSON.stringify(r.term);
    process.stdout.write(rjs);
}
//# sourceMappingURL=app.js.map