// Copyright (c) Mobile Ownership, mobileownership.org.  All Rights Reserved.  See LICENSE.txt in the project root for license information.

import { readFileSync } from "fs";
import { Machine } from "./machine";
import { rewriteTerm } from "./term";

if (process.argv.length === 3) {
    let plfile = process.argv[2];
    const m = new Machine();
    const r = rewriteFile(m, plfile);
    const rjs = JSON.stringify(r.term);
    process.stdout.write(rjs);
}

export function rewriteFile(m: Machine, file: string) {
    const js = readFileSync(file).toString();
    let term = JSON.parse(js);
    const fileResult = rewriteTerm(m.copyWith({ term: term }));
    return fileResult;
}
