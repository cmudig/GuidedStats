"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const branch_user_api_1 = require("./user-api/branch-user-api");
const DELETED_BRANCH_NAME = "";
exports.DELETED_BRANCH_NAME = DELETED_BRANCH_NAME;
class Branch {
    constructor(options) {
        this.gitgraph = options.gitgraph;
        this.name = options.name;
        this.style = options.style;
        this.parentCommitHash = options.parentCommitHash;
        this.commitDefaultOptions = options.commitDefaultOptions || { style: {} };
        this.onGraphUpdate = options.onGraphUpdate;
        this.renderLabel = options.renderLabel;
    }
    /**
     * Return the API to manipulate Gitgraph branch as a user.
     */
    getUserApi() {
        return new branch_user_api_1.BranchUserApi(this, this.gitgraph, this.onGraphUpdate);
    }
    /**
     * Return true if branch was deleted.
     */
    isDeleted() {
        return this.name === DELETED_BRANCH_NAME;
    }
}
exports.Branch = Branch;
function createDeletedBranch(gitgraph, style, onGraphUpdate) {
    return new Branch({
        name: DELETED_BRANCH_NAME,
        gitgraph,
        style,
        onGraphUpdate,
    });
}
exports.createDeletedBranch = createDeletedBranch;
//# sourceMappingURL=branch.js.map