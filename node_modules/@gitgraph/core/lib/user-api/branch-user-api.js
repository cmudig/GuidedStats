"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commit_1 = require("../commit");
const branch_1 = require("../branch");
const utils_1 = require("../utils");
class BranchUserApi {
    // tslint:enable:variable-name
    constructor(branch, graph, onGraphUpdate) {
        this._branch = branch;
        this.name = branch.name;
        this._graph = graph;
        this._onGraphUpdate = onGraphUpdate;
    }
    branch(args) {
        if (this._branch.isDeleted() && !this._isReferenced()) {
            throw new Error(`Cannot branch from the deleted branch "${this.name}"`);
        }
        const options = typeof args === "string" ? { name: args } : args;
        options.from = this;
        return this._graph.createBranch(options).getUserApi();
    }
    commit(options) {
        if (this._branch.isDeleted() && !this._isReferenced()) {
            throw new Error(`Cannot commit on the deleted branch "${this.name}"`);
        }
        // Deal with shorter syntax
        if (typeof options === "string")
            options = { subject: options };
        if (!options)
            options = {};
        this._commitWithParents(options, []);
        this._onGraphUpdate();
        return this;
    }
    /**
     * Delete the branch (as `git branch -d`)
     */
    delete() {
        // Delete all references to the branch from the graph (graph.branches and graph.refs)
        // and from the commits (commit.refs). Then, make the branch instance a deleted branch.
        // Like in git, the commits and tags in the deleted branch remain in the graph
        if (this._graph.refs.getCommit("HEAD") ===
            this._graph.refs.getCommit(this.name)) {
            throw new Error(`Cannot delete the checked out branch "${this.name}"`);
        }
        const branchCommits = (function* (graph, branch) {
            const lookupCommit = (graph, commitHash) => {
                return graph.commits.find(({ hash }) => hash === commitHash);
            };
            let currentCommit = lookupCommit(graph, graph.refs.getCommit(branch.name));
            while (currentCommit && currentCommit.hash !== branch.parentCommitHash) {
                yield currentCommit;
                currentCommit = lookupCommit(graph, currentCommit.parents[0]);
            }
            return;
        })(this._graph, this._branch);
        [...branchCommits].forEach((commit) => {
            commit.refs = commit.refs.filter((branchName) => branchName !== this.name);
        });
        this._graph.refs.delete(this.name);
        this._graph.branches.delete(this.name);
        this._branch = branch_1.createDeletedBranch(this._graph, this._branch.style, () => {
            // do nothing
        });
        this._onGraphUpdate();
        return this;
    }
    merge(...args) {
        if (this._branch.isDeleted() && !this._isReferenced()) {
            throw new Error(`Cannot merge to the deleted branch "${this.name}"`);
        }
        let options = args[0];
        if (!isBranchMergeOptions(options)) {
            options = {
                branch: args[0],
                fastForward: false,
                commitOptions: { subject: args[1] },
            };
        }
        const { branch, fastForward, commitOptions, } = options;
        const branchName = typeof branch === "string" ? branch : branch.name;
        const branchLastCommitHash = this._graph.refs.getCommit(branchName);
        if (!branchLastCommitHash) {
            throw new Error(`The branch called "${branchName}" is unknown`);
        }
        let canFastForward = false;
        if (fastForward) {
            const lastCommitHash = this._graph.refs.getCommit(this._branch.name);
            if (lastCommitHash) {
                canFastForward = this._areCommitsConnected(lastCommitHash, branchLastCommitHash);
            }
        }
        if (fastForward && canFastForward) {
            this._fastForwardTo(branchLastCommitHash);
        }
        else {
            this._commitWithParents(Object.assign({}, commitOptions, { subject: (commitOptions && commitOptions.subject) ||
                    `Merge branch ${branchName}` }), [branchLastCommitHash]);
        }
        this._onGraphUpdate();
        return this;
    }
    tag(options) {
        if (this._branch.isDeleted() && !this._isReferenced()) {
            throw new Error(`Cannot tag on the deleted branch "${this.name}"`);
        }
        if (typeof options === "string") {
            this._graph.getUserApi().tag({ name: options, ref: this._branch.name });
        }
        else {
            this._graph.getUserApi().tag(Object.assign({}, options, { ref: this._branch.name }));
        }
        return this;
    }
    /**
     * Checkout onto this branch and update "HEAD" in refs
     */
    checkout() {
        if (this._branch.isDeleted() && !this._isReferenced()) {
            throw new Error(`Cannot checkout the deleted branch "${this.name}"`);
        }
        const target = this._branch;
        const headCommit = this._graph.refs.getCommit(target.name);
        this._graph.currentBranch = target;
        // Update "HEAD" in refs when the target branch is not empty
        if (headCommit) {
            this._graph.refs.set("HEAD", headCommit);
        }
        return this;
    }
    // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users
    _commitWithParents(options, parents) {
        const parentOnSameBranch = this._graph.refs.getCommit(this._branch.name);
        if (parentOnSameBranch) {
            parents.unshift(parentOnSameBranch);
        }
        else if (this._branch.parentCommitHash) {
            parents.unshift(this._branch.parentCommitHash);
        }
        const { tag } = options, commitOptions = __rest(options, ["tag"]);
        const commit = new commit_1.Commit(Object.assign({ hash: this._graph.generateCommitHash(), author: this._branch.commitDefaultOptions.author || this._graph.author, subject: this._branch.commitDefaultOptions.subject ||
                this._graph.commitMessage }, commitOptions, { parents, style: this._getCommitStyle(options.style) }));
        if (parentOnSameBranch) {
            // Take all the refs from the parent
            const parentRefs = this._graph.refs.getNames(parentOnSameBranch);
            parentRefs.forEach((ref) => this._graph.refs.set(ref, commit.hash));
        }
        else {
            // Set the branch ref
            this._graph.refs.set(this._branch.name, commit.hash);
        }
        // Add the new commit
        this._graph.commits.push(commit);
        // Move HEAD on the last commit
        this.checkout();
        // Add a tag to the commit if `option.tag` is provide
        if (tag)
            this.tag(tag);
    }
    _areCommitsConnected(parentCommitHash, childCommitHash) {
        const childCommit = this._graph.commits.find(({ hash }) => childCommitHash === hash);
        if (!childCommit)
            return false;
        const isFirstCommitOfGraph = childCommit.parents.length === 0;
        if (isFirstCommitOfGraph)
            return false;
        if (childCommit.parents.includes(parentCommitHash)) {
            return true;
        }
        // `childCommitHash` is not a direct child of `parentCommitHash`.
        // But maybe one of `childCommitHash` parent is.
        return childCommit.parents.some((directParentHash) => this._areCommitsConnected(parentCommitHash, directParentHash));
    }
    _fastForwardTo(commitHash) {
        this._graph.refs.set(this._branch.name, commitHash);
    }
    _getCommitStyle(style = {}) {
        return Object.assign({}, utils_1.withoutUndefinedKeys(this._graph.template.commit), utils_1.withoutUndefinedKeys(this._branch.commitDefaultOptions.style), style, { message: Object.assign({}, utils_1.withoutUndefinedKeys(this._graph.template.commit.message), utils_1.withoutUndefinedKeys(this._branch.commitDefaultOptions.style.message), style.message, utils_1.withoutUndefinedKeys({
                display: this._graph.shouldDisplayCommitMessage && undefined,
            })), dot: Object.assign({}, utils_1.withoutUndefinedKeys(this._graph.template.commit.dot), utils_1.withoutUndefinedKeys(this._branch.commitDefaultOptions.style.dot), style.dot) });
    }
    _isReferenced() {
        return (this._graph.branches.has(this.name) ||
            this._graph.refs.hasName(this.name) ||
            this._graph.commits
                .reduce((allNames, { refs }) => [...allNames, ...refs], [])
                .includes(this.name));
    }
}
exports.BranchUserApi = BranchUserApi;
function isBranchMergeOptions(options) {
    return typeof options === "object" && !(options instanceof BranchUserApi);
}
//# sourceMappingURL=branch-user-api.js.map