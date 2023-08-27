"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commit_1 = require("../commit");
const branch_1 = require("../branch");
const refs_1 = require("../refs");
class GitgraphUserApi {
    // tslint:enable:variable-name
    constructor(graph, onGraphUpdate) {
        this._graph = graph;
        this._onGraphUpdate = onGraphUpdate;
    }
    /**
     * Clear everything (as `rm -rf .git && git init`).
     */
    clear() {
        this._graph.refs = new refs_1.Refs();
        this._graph.tags = new refs_1.Refs();
        this._graph.commits = [];
        this._graph.branches = new Map();
        this._graph.currentBranch = this._graph.createBranch("master");
        this._onGraphUpdate();
        return this;
    }
    commit(options) {
        this._graph.currentBranch.getUserApi().commit(options);
        return this;
    }
    branch(args) {
        return this._graph.createBranch(args).getUserApi();
    }
    tag(...args) {
        // Deal with shorter syntax
        let name;
        let ref;
        let style;
        let render;
        if (typeof args[0] === "string") {
            name = args[0];
            ref = args[1];
        }
        else {
            name = args[0].name;
            ref = args[0].ref;
            style = args[0].style;
            render = args[0].render;
        }
        if (!ref) {
            const head = this._graph.refs.getCommit("HEAD");
            if (!head)
                return this;
            ref = head;
        }
        let commitHash;
        if (this._graph.refs.hasCommit(ref)) {
            // `ref` is a `Commit["hash"]`
            commitHash = ref;
        }
        if (this._graph.refs.hasName(ref)) {
            // `ref` is a `Branch["name"]`
            commitHash = this._graph.refs.getCommit(ref);
        }
        if (!commitHash) {
            throw new Error(`The ref "${ref}" does not exist`);
        }
        this._graph.tags.set(name, commitHash);
        this._graph.tagStyles[name] = style;
        this._graph.tagRenders[name] = render;
        this._onGraphUpdate();
        return this;
    }
    /**
     * Import a JSON.
     *
     * Data can't be typed since it comes from a JSON.
     * We validate input format and throw early if something is invalid.
     *
     * @experimental
     * @param data JSON from `git2json` output
     */
    import(data) {
        const invalidData = new Error("Only `git2json` format is supported for imported data.");
        // We manually validate input data instead of using a lib like yup.
        // => this is to keep bundlesize small.
        if (!Array.isArray(data)) {
            throw invalidData;
        }
        const areDataValid = data.every((options) => {
            return (typeof options === "object" &&
                typeof options.author === "object" &&
                Array.isArray(options.refs));
        });
        if (!areDataValid) {
            throw invalidData;
        }
        const commitOptionsList = data
            .map((options) => (Object.assign({}, options, { style: Object.assign({}, this._graph.template.commit, { message: Object.assign({}, this._graph.template.commit.message, { display: this._graph.shouldDisplayCommitMessage }) }), author: `${options.author.name} <${options.author.email}>` })))
            // Git2json outputs is reverse-chronological.
            // We need to commit it chronological order.
            .reverse();
        // Use validated `value`.
        this.clear();
        this._graph.commits = commitOptionsList.map((options) => new commit_1.Commit(options));
        // Create tags & refs.
        commitOptionsList.forEach(({ refs, hash }) => {
            if (!refs)
                return;
            if (!hash)
                return;
            const TAG_PREFIX = "tag: ";
            const tags = refs
                .map((ref) => ref.split(TAG_PREFIX))
                .map(([_, tag]) => tag)
                .filter((tag) => typeof tag === "string");
            tags.forEach((tag) => this._graph.tags.set(tag, hash));
            refs
                .filter((ref) => !ref.startsWith(TAG_PREFIX))
                .forEach((ref) => this._graph.refs.set(ref, hash));
        });
        // Create branches.
        const branches = this._getBranches();
        this._graph.commits
            .map((commit) => this._withBranches(branches, commit))
            .reduce((mem, commit) => {
            if (!commit.branches)
                return mem;
            commit.branches.forEach((branch) => mem.add(branch));
            return mem;
        }, new Set())
            .forEach((branch) => this.branch(branch));
        this._onGraphUpdate();
        return this;
    }
    // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users
    // TODO: get rid of these duplicated private methods.
    //
    // These belong to Gitgraph. It is duplicated because of `import()`.
    // `import()` should use regular user API instead.
    _withBranches(branches, commit) {
        let commitBranches = Array.from((branches.get(commit.hash) || new Set()).values());
        if (commitBranches.length === 0) {
            // No branch => branch has been deleted.
            commitBranches = [branch_1.DELETED_BRANCH_NAME];
        }
        return commit.setBranches(commitBranches);
    }
    _getBranches() {
        const result = new Map();
        const queue = [];
        const branches = this._graph.refs
            .getAllNames()
            .filter((name) => name !== "HEAD");
        branches.forEach((branch) => {
            const commitHash = this._graph.refs.getCommit(branch);
            if (commitHash) {
                queue.push(commitHash);
            }
            while (queue.length > 0) {
                const currentHash = queue.pop();
                const current = this._graph.commits.find(({ hash }) => hash === currentHash);
                const prevBranches = result.get(currentHash) || new Set();
                prevBranches.add(branch);
                result.set(currentHash, prevBranches);
                if (current && current.parents && current.parents.length > 0) {
                    queue.push(current.parents[0]);
                }
            }
        });
        return result;
    }
}
exports.GitgraphUserApi = GitgraphUserApi;
//# sourceMappingURL=gitgraph-user-api.js.map