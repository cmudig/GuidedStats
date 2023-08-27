"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regular_1 = require("./regular");
class CompactGraphRows extends regular_1.RegularGraphRows {
    computeRowsFromCommits(commits) {
        commits.forEach((commit, i) => {
            let newRow = i;
            const isFirstCommit = i === 0;
            if (!isFirstCommit) {
                const parentRow = this.getRowOf(commit.parents[0]);
                const historyParent = commits[i - 1];
                newRow = Math.max(parentRow + 1, this.getRowOf(historyParent.hash));
                const isMergeCommit = commit.parents.length > 1;
                if (isMergeCommit) {
                    // Push commit to next row to avoid collision when the branch in which
                    // the merge happens has more commits than the merged branch.
                    const mergeTargetParentRow = this.getRowOf(commit.parents[1]);
                    if (parentRow < mergeTargetParentRow)
                        newRow++;
                }
            }
            this.rows.set(commit.hash, newRow);
        });
    }
}
exports.CompactGraphRows = CompactGraphRows;
//# sourceMappingURL=compact.js.map