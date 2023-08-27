"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const branch_1 = require("./branch");
const graph_rows_1 = require("./graph-rows");
const mode_1 = require("./mode");
const branches_order_1 = require("./branches-order");
const template_1 = require("./template");
const refs_1 = require("./refs");
const branches_paths_1 = require("./branches-paths");
const utils_1 = require("./utils");
const orientation_1 = require("./orientation");
const gitgraph_user_api_1 = require("./user-api/gitgraph-user-api");
class GitgraphCore {
    constructor(options = {}) {
        this.refs = new refs_1.Refs();
        this.tags = new refs_1.Refs();
        this.tagStyles = {};
        this.tagRenders = {};
        this.commits = [];
        this.branches = new Map();
        this.listeners = [];
        this.nextTimeoutId = null;
        this.template = template_1.getTemplate(options.template);
        // Set a default `master` branch
        this.currentBranch = this.createBranch("master");
        // Set all options with default values
        this.orientation = options.orientation;
        this.reverseArrow = utils_1.booleanOptionOr(options.reverseArrow, false);
        this.initCommitOffsetX = utils_1.numberOptionOr(options.initCommitOffsetX, 0);
        this.initCommitOffsetY = utils_1.numberOptionOr(options.initCommitOffsetY, 0);
        this.mode = options.mode;
        this.author = options.author || "Sergio Flores <saxo-guy@epic.com>";
        this.commitMessage =
            options.commitMessage || "He doesn't like George Michael! Boooo!";
        this.generateCommitHash =
            typeof options.generateCommitHash === "function"
                ? options.generateCommitHash
                : () => undefined;
        this.branchesOrderFunction =
            typeof options.compareBranchesOrder === "function"
                ? options.compareBranchesOrder
                : undefined;
        this.branchLabelOnEveryCommit = utils_1.booleanOptionOr(options.branchLabelOnEveryCommit, false);
    }
    get isHorizontal() {
        return (this.orientation === orientation_1.Orientation.Horizontal ||
            this.orientation === orientation_1.Orientation.HorizontalReverse);
    }
    get isVertical() {
        return !this.isHorizontal;
    }
    get isReverse() {
        return (this.orientation === orientation_1.Orientation.HorizontalReverse ||
            this.orientation === orientation_1.Orientation.VerticalReverse);
    }
    get shouldDisplayCommitMessage() {
        return !this.isHorizontal && this.mode !== mode_1.Mode.Compact;
    }
    /**
     * Return the API to manipulate Gitgraph as a user.
     * Rendering library should give that API to their consumer.
     */
    getUserApi() {
        return new gitgraph_user_api_1.GitgraphUserApi(this, () => this.next());
    }
    /**
     * Add a change listener.
     * It will be called any time the graph have changed (commit, merge…).
     *
     * @param listener A callback to be invoked on every change.
     * @returns A function to remove this change listener.
     */
    subscribe(listener) {
        this.listeners.push(listener);
        let isSubscribed = true;
        return () => {
            if (!isSubscribed)
                return;
            isSubscribed = false;
            const index = this.listeners.indexOf(listener);
            this.listeners.splice(index, 1);
        };
    }
    /**
     * Return all data required for rendering.
     * Rendering libraries will use this to implement their rendering strategy.
     */
    getRenderedData() {
        const commits = this.computeRenderedCommits();
        const branchesPaths = this.computeRenderedBranchesPaths(commits);
        const commitMessagesX = this.computeCommitMessagesX(branchesPaths);
        this.computeBranchesColor(commits, branchesPaths);
        return { commits, branchesPaths, commitMessagesX };
    }
    createBranch(args) {
        const defaultParentBranchName = "HEAD";
        let options = {
            gitgraph: this,
            name: "",
            parentCommitHash: this.refs.getCommit(defaultParentBranchName),
            style: this.template.branch,
            onGraphUpdate: () => this.next(),
        };
        if (typeof args === "string") {
            options.name = args;
            options.parentCommitHash = this.refs.getCommit(defaultParentBranchName);
        }
        else {
            const parentBranchName = args.from
                ? args.from.name
                : defaultParentBranchName;
            const parentCommitHash = this.refs.getCommit(parentBranchName) ||
                (this.refs.hasCommit(args.from) ? args.from : undefined);
            args.style = args.style || {};
            options = Object.assign({}, options, args, { parentCommitHash, style: Object.assign({}, options.style, args.style, { label: Object.assign({}, options.style.label, args.style.label) }) });
        }
        const branch = new branch_1.Branch(options);
        this.branches.set(branch.name, branch);
        return branch;
    }
    /**
     * Return commits with data for rendering.
     */
    computeRenderedCommits() {
        const branches = this.getBranches();
        // Commits that are not associated to a branch in `branches`
        // were in a deleted branch. If the latter was merged beforehand
        // they are reachable and are rendered. Others are not
        const reachableUnassociatedCommits = (() => {
            const unassociatedCommits = new Set(this.commits.reduce((commits, { hash }) => !branches.has(hash) ? [...commits, hash] : commits, []));
            const tipsOfMergedBranches = this.commits.reduce((tipsOfMergedBranches, commit) => commit.parents.length > 1
                ? [
                    ...tipsOfMergedBranches,
                    ...commit.parents
                        .slice(1)
                        .map((parentHash) => this.commits.find(({ hash }) => parentHash === hash)),
                ]
                : tipsOfMergedBranches, []);
            const reachableCommits = new Set();
            tipsOfMergedBranches.forEach((tip) => {
                let currentCommit = tip;
                while (currentCommit && unassociatedCommits.has(currentCommit.hash)) {
                    reachableCommits.add(currentCommit.hash);
                    currentCommit =
                        currentCommit.parents.length > 0
                            ? this.commits.find(({ hash }) => currentCommit.parents[0] === hash)
                            : undefined;
                }
            });
            return reachableCommits;
        })();
        const commitsToRender = this.commits.filter(({ hash }) => branches.has(hash) || reachableUnassociatedCommits.has(hash));
        const commitsWithBranches = commitsToRender.map((commit) => this.withBranches(branches, commit));
        const rows = graph_rows_1.createGraphRows(this.mode, commitsToRender);
        const branchesOrder = new branches_order_1.BranchesOrder(commitsWithBranches, this.template.colors, this.branchesOrderFunction);
        return (commitsWithBranches
            .map((commit) => commit.setRefs(this.refs))
            .map((commit) => this.withPosition(rows, branchesOrder, commit))
            // Fallback commit computed color on branch color.
            .map((commit) => commit.withDefaultColor(this.getBranchDefaultColor(branchesOrder, commit.branchToDisplay)))
            // Tags need commit style to be computed (with default color).
            .map((commit) => commit.setTags(this.tags, (name) => Object.assign({}, this.tagStyles[name], this.template.tag), (name) => this.tagRenders[name])));
    }
    /**
     * Return branches paths with all data required for rendering.
     *
     * @param commits List of commits with rendering data computed
     */
    computeRenderedBranchesPaths(commits) {
        return new branches_paths_1.BranchesPathsCalculator(commits, this.branches, this.template.commit.spacing, this.isVertical, this.isReverse, () => branch_1.createDeletedBranch(this, this.template.branch, () => this.next())).execute();
    }
    /**
     * Set branches colors based on branches paths.
     *
     * @param commits List of graph commits
     * @param branchesPaths Branches paths to be rendered
     */
    computeBranchesColor(commits, branchesPaths) {
        const branchesOrder = new branches_order_1.BranchesOrder(commits, this.template.colors, this.branchesOrderFunction);
        Array.from(branchesPaths).forEach(([branch]) => {
            branch.computedColor =
                branch.style.color ||
                    this.getBranchDefaultColor(branchesOrder, branch.name);
        });
    }
    /**
     * Return commit messages X position for rendering.
     *
     * @param branchesPaths Branches paths to be rendered
     */
    computeCommitMessagesX(branchesPaths) {
        const numberOfColumns = Array.from(branchesPaths).length;
        return numberOfColumns * this.template.branch.spacing;
    }
    /**
     * Add `branches` property to commit.
     *
     * @param branches All branches mapped by commit hash
     * @param commit Commit
     */
    withBranches(branches, commit) {
        let commitBranches = Array.from((branches.get(commit.hash) || new Set()).values());
        if (commitBranches.length === 0) {
            // No branch => branch has been deleted.
            commitBranches = [branch_1.DELETED_BRANCH_NAME];
        }
        return commit.setBranches(commitBranches);
    }
    /**
     * Get all branches from current commits.
     */
    getBranches() {
        const result = new Map();
        const queue = [];
        const branches = this.refs.getAllNames().filter((name) => name !== "HEAD");
        branches.forEach((branch) => {
            const commitHash = this.refs.getCommit(branch);
            if (commitHash) {
                queue.push(commitHash);
            }
            while (queue.length > 0) {
                const currentHash = queue.pop();
                const current = this.commits.find(({ hash }) => hash === currentHash);
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
    /**
     * Add position to given commit.
     *
     * @param rows Graph rows
     * @param branchesOrder Computed order of branches
     * @param commit Commit to position
     */
    withPosition(rows, branchesOrder, commit) {
        const row = rows.getRowOf(commit.hash);
        const maxRow = rows.getMaxRow();
        const order = branchesOrder.get(commit.branchToDisplay);
        switch (this.orientation) {
            default:
                return commit.setPosition({
                    x: this.initCommitOffsetX + this.template.branch.spacing * order,
                    y: this.initCommitOffsetY +
                        this.template.commit.spacing * (maxRow - row),
                });
            case orientation_1.Orientation.VerticalReverse:
                return commit.setPosition({
                    x: this.initCommitOffsetX + this.template.branch.spacing * order,
                    y: this.initCommitOffsetY + this.template.commit.spacing * row,
                });
            case orientation_1.Orientation.Horizontal:
                return commit.setPosition({
                    x: this.initCommitOffsetX + this.template.commit.spacing * row,
                    y: this.initCommitOffsetY + this.template.branch.spacing * order,
                });
            case orientation_1.Orientation.HorizontalReverse:
                return commit.setPosition({
                    x: this.initCommitOffsetX +
                        this.template.commit.spacing * (maxRow - row),
                    y: this.initCommitOffsetY + this.template.branch.spacing * order,
                });
        }
    }
    /**
     * Return the default color for given branch.
     *
     * @param branchesOrder Computed order of branches
     * @param branchName Name of the branch
     */
    getBranchDefaultColor(branchesOrder, branchName) {
        return branchesOrder.getColorOf(branchName);
    }
    /**
     * Tell each listener something new happened.
     * E.g. a rendering library will know it needs to re-render the graph.
     */
    next() {
        if (this.nextTimeoutId) {
            window.clearTimeout(this.nextTimeoutId);
        }
        // Use setTimeout() with `0` to debounce call to next tick.
        this.nextTimeoutId = window.setTimeout(() => {
            this.listeners.forEach((listener) => listener(this.getRenderedData()));
        }, 0);
    }
}
exports.GitgraphCore = GitgraphCore;
//# sourceMappingURL=gitgraph.js.map