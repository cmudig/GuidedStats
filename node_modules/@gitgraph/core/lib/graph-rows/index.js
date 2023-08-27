"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mode_1 = require("../mode");
const compact_1 = require("./compact");
const regular_1 = require("./regular");
exports.GraphRows = regular_1.RegularGraphRows;
function createGraphRows(mode, commits) {
    return mode === mode_1.Mode.Compact
        ? new compact_1.CompactGraphRows(commits)
        : new regular_1.RegularGraphRows(commits);
}
exports.createGraphRows = createGraphRows;
//# sourceMappingURL=index.js.map