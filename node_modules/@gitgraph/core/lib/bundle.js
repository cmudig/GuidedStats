(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./user-api/branch-user-api":15}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Calculate branches paths of the graph.
 *
 * It follows the Command pattern:
 * => a class with a single `execute()` public method.
 *
 * Main benefit is we can split computation in smaller steps without
 * passing around parameters (we can rely on private data).
 */
class BranchesPathsCalculator {
    constructor(commits, branches, commitSpacing, isGraphVertical, isGraphReverse, createDeletedBranch) {
        this.branchesPaths = new Map();
        this.commits = commits;
        this.branches = branches;
        this.commitSpacing = commitSpacing;
        this.isGraphVertical = isGraphVertical;
        this.isGraphReverse = isGraphReverse;
        this.createDeletedBranch = createDeletedBranch;
    }
    /**
     * Compute branches paths for graph.
     */
    execute() {
        this.fromCommits();
        this.withMergeCommits();
        return this.smoothBranchesPaths();
    }
    /**
     * Initialize branches paths from calculator's commits.
     */
    fromCommits() {
        this.commits.forEach((commit) => {
            let branch = this.branches.get(commit.branchToDisplay);
            if (!branch) {
                // NB: may not work properly if there are many deleted branches.
                branch = this.getDeletedBranchInPath() || this.createDeletedBranch();
            }
            const path = [];
            const existingBranchPath = this.branchesPaths.get(branch);
            const firstParentCommit = this.commits.find(({ hash }) => hash === commit.parents[0]);
            if (existingBranchPath) {
                path.push(...existingBranchPath);
            }
            else if (firstParentCommit) {
                // Make branch path starts from parent branch (parent commit).
                path.push({ x: firstParentCommit.x, y: firstParentCommit.y });
            }
            path.push({ x: commit.x, y: commit.y });
            this.branchesPaths.set(branch, path);
        });
    }
    /**
     * Insert merge commits points into `branchesPaths`.
     *
     * @example
     *     // Before
     *     [
     *       { x: 0, y: 640 },
     *       { x: 50, y: 560 }
     *     ]
     *
     *     // After
     *     [
     *       { x: 0, y: 640 },
     *       { x: 50, y: 560 },
     *       { x: 50, y: 560, mergeCommit: true }
     *     ]
     */
    withMergeCommits() {
        const mergeCommits = this.commits.filter(({ parents }) => parents.length > 1);
        mergeCommits.forEach((mergeCommit) => {
            const parentOnOriginBranch = this.commits.find(({ hash }) => {
                return hash === mergeCommit.parents[1];
            });
            if (!parentOnOriginBranch)
                return;
            const originBranchName = parentOnOriginBranch.branches
                ? parentOnOriginBranch.branches[0]
                : "";
            let branch = this.branches.get(originBranchName);
            if (!branch) {
                branch = this.getDeletedBranchInPath();
                if (!branch) {
                    // Still no branch? That's strange, we shouldn't set anything.
                    return;
                }
            }
            const lastPoints = [...(this.branchesPaths.get(branch) || [])];
            this.branchesPaths.set(branch, [
                ...lastPoints,
                { x: mergeCommit.x, y: mergeCommit.y, mergeCommit: true },
            ]);
        });
    }
    /**
     * Retrieve deleted branch from calculator's branches paths.
     */
    getDeletedBranchInPath() {
        return Array.from(this.branchesPaths.keys()).find((branch) => branch.isDeleted());
    }
    /**
     * Smooth all paths by putting points on each row.
     */
    smoothBranchesPaths() {
        const branchesPaths = new Map();
        this.branchesPaths.forEach((points, branch) => {
            if (points.length <= 1) {
                branchesPaths.set(branch, [points]);
                return;
            }
            // Cut path on each merge commits
            // Coordinate[] -> Coordinate[][]
            if (this.isGraphVertical) {
                points = points.sort((a, b) => (a.y > b.y ? -1 : 1));
            }
            else {
                points = points.sort((a, b) => (a.x > b.x ? 1 : -1));
            }
            if (this.isGraphReverse) {
                points = points.reverse();
            }
            const paths = points.reduce((mem, point, i) => {
                if (point.mergeCommit) {
                    mem[mem.length - 1].push(utils_1.pick(point, ["x", "y"]));
                    let j = i - 1;
                    let previousPoint = points[j];
                    // Find the last point which is not a merge
                    while (j >= 0 && previousPoint.mergeCommit) {
                        j--;
                        previousPoint = points[j];
                    }
                    // Start a new array with this point
                    if (j >= 0) {
                        mem.push([previousPoint]);
                    }
                }
                else {
                    mem[mem.length - 1].push(point);
                }
                return mem;
            }, [[]]);
            if (this.isGraphReverse) {
                paths.forEach((path) => path.reverse());
            }
            // Add intermediate points on each sub paths
            if (this.isGraphVertical) {
                paths.forEach((subPath) => {
                    if (subPath.length <= 1)
                        return;
                    const firstPoint = subPath[0];
                    const lastPoint = subPath[subPath.length - 1];
                    const column = subPath[1].x;
                    const branchSize = Math.round(Math.abs(firstPoint.y - lastPoint.y) / this.commitSpacing) - 1;
                    const branchPoints = branchSize > 0
                        ? new Array(branchSize).fill(0).map((_, i) => ({
                            x: column,
                            y: subPath[0].y - this.commitSpacing * (i + 1),
                        }))
                        : [];
                    const lastSubPaths = branchesPaths.get(branch) || [];
                    branchesPaths.set(branch, [
                        ...lastSubPaths,
                        [firstPoint, ...branchPoints, lastPoint],
                    ]);
                });
            }
            else {
                paths.forEach((subPath) => {
                    if (subPath.length <= 1)
                        return;
                    const firstPoint = subPath[0];
                    const lastPoint = subPath[subPath.length - 1];
                    const column = subPath[1].y;
                    const branchSize = Math.round(Math.abs(firstPoint.x - lastPoint.x) / this.commitSpacing) - 1;
                    const branchPoints = branchSize > 0
                        ? new Array(branchSize).fill(0).map((_, i) => ({
                            y: column,
                            x: subPath[0].x + this.commitSpacing * (i + 1),
                        }))
                        : [];
                    const lastSubPaths = branchesPaths.get(branch) || [];
                    branchesPaths.set(branch, [
                        ...lastSubPaths,
                        [firstPoint, ...branchPoints, lastPoint],
                    ]);
                });
            }
        });
        return branchesPaths;
    }
}
exports.BranchesPathsCalculator = BranchesPathsCalculator;
/**
 * Return a string ready to use in `svg.path.d` from coordinates
 *
 * @param coordinates Collection of coordinates
 */
function toSvgPath(coordinates, isBezier, isVertical) {
    return coordinates
        .map((path) => "M" +
        path
            .map(({ x, y }, i, points) => {
            if (isBezier &&
                points.length > 1 &&
                (i === 1 || i === points.length - 1)) {
                const previous = points[i - 1];
                if (isVertical) {
                    const middleY = (previous.y + y) / 2;
                    return `C ${previous.x} ${middleY} ${x} ${middleY} ${x} ${y}`;
                }
                else {
                    const middleX = (previous.x + x) / 2;
                    return `C ${middleX} ${previous.y} ${middleX} ${y} ${x} ${y}`;
                }
            }
            return `L ${x} ${y}`;
        })
            .join(" ")
            .slice(1))
        .join(" ");
}
exports.toSvgPath = toSvgPath;

},{"./utils":17}],4:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
var gitgraph_1 = require("./gitgraph");
exports.GitgraphCore = gitgraph_1.GitgraphCore;
var mode_1 = require("./mode");
exports.Mode = mode_1.Mode;
var gitgraph_user_api_1 = require("./user-api/gitgraph-user-api");
exports.GitgraphUserApi = gitgraph_user_api_1.GitgraphUserApi;
var branch_user_api_1 = require("./user-api/branch-user-api");
exports.BranchUserApi = branch_user_api_1.BranchUserApi;
var branch_1 = require("./branch");
exports.Branch = branch_1.Branch;
var commit_1 = require("./commit");
exports.Commit = commit_1.Commit;
var tag_1 = require("./tag");
exports.Tag = tag_1.Tag;
var refs_1 = require("./refs");
exports.Refs = refs_1.Refs;
var template_1 = require("./template");
exports.MergeStyle = template_1.MergeStyle;
exports.TemplateName = template_1.TemplateName;
exports.templateExtend = template_1.templateExtend;
var orientation_1 = require("./orientation");
exports.Orientation = orientation_1.Orientation;
var branches_paths_1 = require("./branches-paths");
exports.toSvgPath = branches_paths_1.toSvgPath;
var utils_1 = require("./utils");
exports.arrowSvgPath = utils_1.arrowSvgPath;

})));

},{"./branch":1,"./branches-paths":3,"./commit":5,"./gitgraph":6,"./mode":10,"./orientation":11,"./refs":12,"./tag":13,"./template":14,"./user-api/branch-user-api":15,"./user-api/gitgraph-user-api":16,"./utils":17}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = require("./tag");
/**
 * Generate a random hash.
 *
 * @return hex string with 40 chars
 */
const getRandomHash = () => (Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3)).substring(0, 40);
class Commit {
    constructor(options) {
        /**
         * Ref names
         */
        this.refs = [];
        /**
         * Commit x position
         */
        this.x = 0;
        /**
         * Commit y position
         */
        this.y = 0;
        // Set author & committer
        let name, email;
        try {
            [, name, email] = options.author.match(/(.*) <(.*)>/);
        }
        catch (e) {
            [name, email] = [options.author, ""];
        }
        this.author = { name, email, timestamp: Date.now() };
        this.committer = { name, email, timestamp: Date.now() };
        // Set commit message
        this.subject = options.subject;
        this.body = options.body || "";
        // Set commit hash
        this.hash = options.hash || getRandomHash();
        this.hashAbbrev = this.hash.substring(0, 7);
        // Set parent hash
        this.parents = options.parents ? options.parents : [];
        this.parentsAbbrev = this.parents.map((commit) => commit.substring(0, 7));
        // Set style
        this.style = Object.assign({}, options.style, { message: Object.assign({}, options.style.message), dot: Object.assign({}, options.style.dot) });
        this.dotText = options.dotText;
        // Set callbacks
        this.onClick = () => (options.onClick ? options.onClick(this) : undefined);
        this.onMessageClick = () => options.onMessageClick ? options.onMessageClick(this) : undefined;
        this.onMouseOver = () => options.onMouseOver ? options.onMouseOver(this) : undefined;
        this.onMouseOut = () => options.onMouseOut ? options.onMouseOut(this) : undefined;
        // Set custom renders
        this.renderDot = options.renderDot;
        this.renderMessage = options.renderMessage;
        this.renderTooltip = options.renderTooltip;
    }
    /**
     * Message
     */
    get message() {
        let message = "";
        if (this.style.message.displayHash) {
            message += `${this.hashAbbrev} `;
        }
        message += this.subject;
        if (this.style.message.displayAuthor) {
            message += ` - ${this.author.name} <${this.author.email}>`;
        }
        return message;
    }
    /**
     * Branch that should be rendered
     */
    get branchToDisplay() {
        return this.branches ? this.branches[0] : "";
    }
    setRefs(refs) {
        this.refs = refs.getNames(this.hash);
        return this;
    }
    setTags(tags, getTagStyle, getTagRender) {
        this.tags = tags
            .getNames(this.hash)
            .map((name) => new tag_1.Tag(name, getTagStyle(name), getTagRender(name), this.style));
        return this;
    }
    setBranches(branches) {
        this.branches = branches;
        return this;
    }
    setPosition({ x, y }) {
        this.x = x;
        this.y = y;
        return this;
    }
    withDefaultColor(color) {
        const newStyle = Object.assign({}, this.style, { dot: Object.assign({}, this.style.dot), message: Object.assign({}, this.style.message) });
        if (!newStyle.color)
            newStyle.color = color;
        if (!newStyle.dot.color)
            newStyle.dot.color = color;
        if (!newStyle.message.color)
            newStyle.message.color = color;
        const commit = this.cloneCommit();
        commit.style = newStyle;
        return commit;
    }
    /**
     * Ideally, we want Commit to be a [Value Object](https://martinfowler.com/bliki/ValueObject.html).
     * We started with a mutable class. So we'll refactor that little by little.
     * This private function is a helper to create a new Commit from existing one.
     */
    cloneCommit() {
        const commit = new Commit({
            author: `${this.author.name} <${this.author.email}>`,
            subject: this.subject,
            style: this.style,
            body: this.body,
            hash: this.hash,
            parents: this.parents,
            dotText: this.dotText,
            onClick: this.onClick,
            onMessageClick: this.onMessageClick,
            onMouseOver: this.onMouseOver,
            onMouseOut: this.onMouseOut,
            renderDot: this.renderDot,
            renderMessage: this.renderMessage,
            renderTooltip: this.renderTooltip,
        });
        commit.refs = this.refs;
        commit.branches = this.branches;
        commit.tags = this.tags;
        commit.x = this.x;
        commit.y = this.y;
        return commit;
    }
}
exports.Commit = Commit;

},{"./tag":13}],6:[function(require,module,exports){
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

},{"./branch":1,"./branches-order":2,"./branches-paths":3,"./graph-rows":8,"./mode":10,"./orientation":11,"./refs":12,"./template":14,"./user-api/gitgraph-user-api":16,"./utils":17}],7:[function(require,module,exports){
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

},{"./regular":9}],8:[function(require,module,exports){
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

},{"../mode":10,"./compact":7,"./regular":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegularGraphRows {
    constructor(commits) {
        this.rows = new Map();
        this.maxRowCache = undefined;
        this.computeRowsFromCommits(commits);
    }
    getRowOf(commitHash) {
        return this.rows.get(commitHash) || 0;
    }
    getMaxRow() {
        if (this.maxRowCache === undefined) {
            this.maxRowCache = uniq(Array.from(this.rows.values())).length - 1;
        }
        return this.maxRowCache;
    }
    computeRowsFromCommits(commits) {
        commits.forEach((commit, i) => {
            this.rows.set(commit.hash, i);
        });
        this.maxRowCache = undefined;
    }
}
exports.RegularGraphRows = RegularGraphRows;
/**
 * Creates a duplicate-free version of an array.
 *
 * Don't use lodash's `uniq` as it increased bundlesize a lot for such a
 * simple function.
 * => The way we bundle for browser seems not to work with `lodash-es`.
 * => I didn't to get tree-shaking to work with `lodash` (the CommonJS version).
 *
 * @param array Array of values
 */
function uniq(array) {
    const set = new Set();
    array.forEach((value) => set.add(value));
    return Array.from(set);
}

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mode;
(function (Mode) {
    Mode["Compact"] = "compact";
})(Mode || (Mode = {}));
exports.Mode = Mode;

},{}],11:[function(require,module,exports){
"use strict";
// Extracted from `gitgraph.ts` because it caused `utils` tests to fail
// because of circular dependency between `utils` and `template`.
// It's not clear why (the circular dependency still exist) but `Orientation`
// was the only one causing issue. Maybe because it's an enum?
Object.defineProperty(exports, "__esModule", { value: true });
var Orientation;
(function (Orientation) {
    Orientation["VerticalReverse"] = "vertical-reverse";
    Orientation["Horizontal"] = "horizontal";
    Orientation["HorizontalReverse"] = "horizontal-reverse";
})(Orientation = exports.Orientation || (exports.Orientation = {}));

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Refs {
    constructor() {
        this.commitPerName = new Map();
        this.namesPerCommit = new Map();
    }
    /**
     * Set a new reference to a commit hash.
     *
     * @param name Name of the ref (ex: "master", "v1.0")
     * @param commitHash Commit hash
     */
    set(name, commitHash) {
        const prevCommitHash = this.commitPerName.get(name);
        if (prevCommitHash) {
            this.removeNameFrom(prevCommitHash, name);
        }
        this.addNameTo(commitHash, name);
        this.addCommitTo(name, commitHash);
        return this;
    }
    /**
     * Delete a reference
     *
     * @param name Name of the reference
     */
    delete(name) {
        if (this.hasName(name)) {
            this.removeNameFrom(this.getCommit(name), name);
            this.commitPerName.delete(name);
        }
        return this;
    }
    /**
     * Get the commit hash associated with the given reference name.
     *
     * @param name Name of the ref
     */
    getCommit(name) {
        return this.commitPerName.get(name);
    }
    /**
     * Get the list of reference names associated with given commit hash.
     *
     * @param commitHash Commit hash
     */
    getNames(commitHash) {
        return this.namesPerCommit.get(commitHash) || [];
    }
    /**
     * Get all reference names known.
     */
    getAllNames() {
        return Array.from(this.commitPerName.keys());
    }
    /**
     * Returns true if given commit hash is referenced.
     *
     * @param commitHash Commit hash
     */
    hasCommit(commitHash) {
        return this.namesPerCommit.has(commitHash);
    }
    /**
     * Returns true if given reference name exists.
     *
     * @param name Name of the ref
     */
    hasName(name) {
        return this.commitPerName.has(name);
    }
    removeNameFrom(commitHash, nameToRemove) {
        const names = this.namesPerCommit.get(commitHash) || [];
        this.namesPerCommit.set(commitHash, names.filter((name) => name !== nameToRemove));
    }
    addNameTo(commitHash, nameToAdd) {
        const prevNames = this.namesPerCommit.get(commitHash) || [];
        this.namesPerCommit.set(commitHash, [...prevNames, nameToAdd]);
    }
    addCommitTo(name, commitHashToAdd) {
        this.commitPerName.set(name, commitHashToAdd);
    }
}
exports.Refs = Refs;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template_1 = require("./template");
const utils_1 = require("./utils");
class Tag {
    constructor(name, style, render, commitStyle) {
        this.name = name;
        this.tagStyle = style;
        this.commitStyle = commitStyle;
        this.render = render;
    }
    /**
     * Style
     */
    get style() {
        return {
            strokeColor: this.tagStyle.strokeColor || this.commitStyle.color,
            bgColor: this.tagStyle.bgColor || this.commitStyle.color,
            color: this.tagStyle.color || "white",
            font: this.tagStyle.font || this.commitStyle.message.font || template_1.DEFAULT_FONT,
            borderRadius: utils_1.numberOptionOr(this.tagStyle.borderRadius, 10),
            pointerWidth: utils_1.numberOptionOr(this.tagStyle.pointerWidth, 12),
        };
    }
}
exports.Tag = Tag;

},{"./template":14,"./utils":17}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Branch merge style enum
 */
var MergeStyle;
(function (MergeStyle) {
    MergeStyle["Bezier"] = "bezier";
    MergeStyle["Straight"] = "straight";
})(MergeStyle || (MergeStyle = {}));
exports.MergeStyle = MergeStyle;
exports.DEFAULT_FONT = "normal 12pt Calibri";
/**
 * Gitgraph template
 *
 * Set of design rules for the rendering.
 */
class Template {
    constructor(options) {
        // Options
        options.branch = options.branch || {};
        options.branch.label = options.branch.label || {};
        options.arrow = options.arrow || {};
        options.commit = options.commit || {};
        options.commit.dot = options.commit.dot || {};
        options.commit.message = options.commit.message || {};
        // One color per column
        this.colors = options.colors || ["#000000"];
        // Branch style
        this.branch = {
            color: options.branch.color,
            lineWidth: options.branch.lineWidth || 2,
            mergeStyle: options.branch.mergeStyle || MergeStyle.Bezier,
            spacing: utils_1.numberOptionOr(options.branch.spacing, 20),
            label: {
                display: utils_1.booleanOptionOr(options.branch.label.display, true),
                color: options.branch.label.color || options.commit.color,
                strokeColor: options.branch.label.strokeColor || options.commit.color,
                bgColor: options.branch.label.bgColor || "white",
                font: options.branch.label.font ||
                    options.commit.message.font ||
                    exports.DEFAULT_FONT,
                borderRadius: utils_1.numberOptionOr(options.branch.label.borderRadius, 10),
            },
        };
        // Arrow style
        this.arrow = {
            size: options.arrow.size || null,
            color: options.arrow.color || null,
            offset: options.arrow.offset || 2,
        };
        // Commit style
        this.commit = {
            color: options.commit.color,
            spacing: utils_1.numberOptionOr(options.commit.spacing, 25),
            hasTooltipInCompactMode: utils_1.booleanOptionOr(options.commit.hasTooltipInCompactMode, true),
            dot: {
                color: options.commit.dot.color || options.commit.color,
                size: options.commit.dot.size || 3,
                strokeWidth: utils_1.numberOptionOr(options.commit.dot.strokeWidth, 0),
                strokeColor: options.commit.dot.strokeColor,
                font: options.commit.dot.font ||
                    options.commit.message.font ||
                    "normal 10pt Calibri",
            },
            message: {
                display: utils_1.booleanOptionOr(options.commit.message.display, true),
                displayAuthor: utils_1.booleanOptionOr(options.commit.message.displayAuthor, true),
                displayHash: utils_1.booleanOptionOr(options.commit.message.displayHash, true),
                color: options.commit.message.color || options.commit.color,
                font: options.commit.message.font || exports.DEFAULT_FONT,
            },
        };
        // Tag style
        // This one is computed in the Tag instance. It needs Commit style
        // that is partially computed at runtime (for colors).
        this.tag = options.tag || {};
    }
}
exports.Template = Template;
/**
 * Black arrow template
 */
const blackArrowTemplate = new Template({
    colors: ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"],
    branch: {
        color: "#000000",
        lineWidth: 4,
        spacing: 50,
        mergeStyle: MergeStyle.Straight,
    },
    commit: {
        spacing: 60,
        dot: {
            size: 16,
            strokeColor: "#000000",
            strokeWidth: 4,
        },
        message: {
            color: "black",
        },
    },
    arrow: {
        size: 16,
        offset: -1.5,
    },
});
exports.blackArrowTemplate = blackArrowTemplate;
/**
 * Metro template
 */
const metroTemplate = new Template({
    colors: ["#979797", "#008fb5", "#f1c109"],
    branch: {
        lineWidth: 10,
        spacing: 50,
    },
    commit: {
        spacing: 80,
        dot: {
            size: 14,
        },
        message: {
            font: "normal 14pt Arial",
        },
    },
});
exports.metroTemplate = metroTemplate;
var TemplateName;
(function (TemplateName) {
    TemplateName["Metro"] = "metro";
    TemplateName["BlackArrow"] = "blackarrow";
})(TemplateName || (TemplateName = {}));
exports.TemplateName = TemplateName;
/**
 * Extend an existing template with new options.
 *
 * @param selectedTemplate Template to extend
 * @param options Template options
 */
function templateExtend(selectedTemplate, options) {
    const template = getTemplate(selectedTemplate);
    if (!options.branch)
        options.branch = {};
    if (!options.commit)
        options.commit = {};
    // This is tedious, but it seems acceptable so we don't need lodash
    // as we want to keep bundlesize small.
    return {
        colors: options.colors || template.colors,
        arrow: Object.assign({}, template.arrow, options.arrow),
        branch: Object.assign({}, template.branch, options.branch, { label: Object.assign({}, template.branch.label, options.branch.label) }),
        commit: Object.assign({}, template.commit, options.commit, { dot: Object.assign({}, template.commit.dot, options.commit.dot), message: Object.assign({}, template.commit.message, options.commit.message) }),
        tag: Object.assign({}, template.tag, options.tag),
    };
}
exports.templateExtend = templateExtend;
/**
 * Resolve the template to use regarding given `template` value.
 *
 * @param template Selected template name, or instance.
 */
function getTemplate(template) {
    if (!template)
        return metroTemplate;
    if (typeof template === "string") {
        return {
            [TemplateName.BlackArrow]: blackArrowTemplate,
            [TemplateName.Metro]: metroTemplate,
        }[template];
    }
    return template;
}
exports.getTemplate = getTemplate;

},{"./utils":17}],15:[function(require,module,exports){
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

},{"../branch":1,"../commit":5,"../utils":17}],16:[function(require,module,exports){
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

},{"../branch":1,"../commit":5,"../refs":12}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orientation_1 = require("./orientation");
/**
 * Provide a default value to a boolean.
 * @param value
 * @param defaultValue
 */
function booleanOptionOr(value, defaultValue) {
    return typeof value === "boolean" ? value : defaultValue;
}
exports.booleanOptionOr = booleanOptionOr;
/**
 * Provide a default value to a number.
 * @param value
 * @param defaultValue
 */
function numberOptionOr(value, defaultValue) {
    return typeof value === "number" ? value : defaultValue;
}
exports.numberOptionOr = numberOptionOr;
/**
 * Creates an object composed of the picked object properties.
 * @param obj The source object
 * @param paths The property paths to pick
 */
function pick(obj, paths) {
    return Object.assign({}, paths.reduce((mem, key) => (Object.assign({}, mem, { [key]: obj[key] })), {}));
}
exports.pick = pick;
/**
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param paths The property paths to pick
 */
function debug(commits, paths) {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(commits.map((commit) => pick(commit, paths)), null, 2));
}
exports.debug = debug;
/**
 * Return true if is undefined.
 *
 * @param obj
 */
function isUndefined(obj) {
    return obj === undefined;
}
exports.isUndefined = isUndefined;
/**
 * Return a version of the object without any undefined keys.
 *
 * @param obj
 */
function withoutUndefinedKeys(obj = {}) {
    return Object.keys(obj).reduce((mem, key) => isUndefined(obj[key]) ? mem : Object.assign({}, mem, { [key]: obj[key] }), {});
}
exports.withoutUndefinedKeys = withoutUndefinedKeys;
/**
 * Return a string ready to use in `svg.path.d` to draw an arrow from params.
 *
 * @param graph Graph context
 * @param parent Parent commit of the target commit
 * @param commit Target commit
 */
function arrowSvgPath(graph, parent, commit) {
    const commitRadius = commit.style.dot.size;
    const size = graph.template.arrow.size;
    const h = commitRadius + graph.template.arrow.offset;
    // Delta between left & right (radian)
    const delta = Math.PI / 7;
    // Alpha angle between parent & commit (radian)
    const alpha = getAlpha(graph, parent, commit);
    // Top
    const x1 = h * Math.cos(alpha);
    const y1 = h * Math.sin(alpha);
    // Bottom right
    const x2 = (h + size) * Math.cos(alpha - delta);
    const y2 = (h + size) * Math.sin(alpha - delta);
    // Bottom center
    const x3 = (h + size / 2) * Math.cos(alpha);
    const y3 = (h + size / 2) * Math.sin(alpha);
    // Bottom left
    const x4 = (h + size) * Math.cos(alpha + delta);
    const y4 = (h + size) * Math.sin(alpha + delta);
    return `M${x1},${y1} L${x2},${y2} Q${x3},${y3} ${x4},${y4} L${x4},${y4}`;
}
exports.arrowSvgPath = arrowSvgPath;
function getAlpha(graph, parent, commit) {
    const deltaX = parent.x - commit.x;
    const deltaY = parent.y - commit.y;
    const commitSpacing = graph.template.commit.spacing;
    let alphaY;
    let alphaX;
    // Angle usually start from previous commit Y position:
    //
    // o
    // ↑ ↖ ︎
    // o  |  <-- path is straight until last commit Y position
    // ↑  o
    // | ↗︎
    // o
    //
    // So we can to default to commit spacing.
    // For horizontal orientation => same with commit X position.
    switch (graph.orientation) {
        case orientation_1.Orientation.Horizontal:
            alphaY = deltaY;
            alphaX = -commitSpacing;
            break;
        case orientation_1.Orientation.HorizontalReverse:
            alphaY = deltaY;
            alphaX = commitSpacing;
            break;
        case orientation_1.Orientation.VerticalReverse:
            alphaY = -commitSpacing;
            alphaX = deltaX;
            break;
        default:
            alphaY = commitSpacing;
            alphaX = deltaX;
            break;
    }
    // If commit is distant from its parent, there should be no angle.
    //
    //    o ︎
    //    ↑  <-- arrow is like previous commit was on same X position
    // o  |
    // | /
    // o
    //
    // For horizontal orientation => same with commit Y position.
    if (graph.isVertical) {
        if (Math.abs(deltaY) > commitSpacing)
            alphaX = 0;
    }
    else {
        if (Math.abs(deltaX) > commitSpacing)
            alphaY = 0;
    }
    if (graph.reverseArrow) {
        alphaY *= -1;
        alphaX *= -1;
    }
    return Math.atan2(alphaY, alphaX);
}

},{"./orientation":11}]},{},[4]);
