"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BranchesOrder {
    constructor(commits, colors, compareFunction) {
        this.branches = new Set();
        this.colors = colors;
        commits.forEach((commit) => this.branches.add(commit.branchToDisplay));
        if (compareFunction) {
            this.branches = new Set(Array.from(this.branches).sort(compareFunction));
        }
    }
    /**
     * Return the order of the given branch name.
     *
     * @param branchName Name of the branch
     */
    get(branchName) {
        return Array.from(this.branches).findIndex((branch) => branch === branchName);
    }
    /**
     * Return the color of the given branch.
     *
     * @param branchName Name of the branch
     */
    getColorOf(branchName) {
        return this.colors[this.get(branchName) % this.colors.length];
    }
}
exports.BranchesOrder = BranchesOrder;
//# sourceMappingURL=branches-order.js.map