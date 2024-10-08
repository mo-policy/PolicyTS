// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { readFileSync } from "fs";
import { Machine } from "./machine";
import { rewriteTerm } from "./term";

if (process.argv.length === 3) {
    let plfile = process.argv[2];
    const js = readFileSync(plfile).toString();
    let term = JSON.parse(js);

    const m = new Machine(term);
    const r = rewriteTerm(m);
    const rjs = JSON.stringify(r.term);
    process.stdout.write(rjs);
}
