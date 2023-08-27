import { Commit, CommitRenderOptions } from "./commit";
import { GitgraphCore } from "./gitgraph";
import { BranchUserApi } from "./user-api/branch-user-api";
import { TemplateOptions, BranchStyle } from "./template";
export { BranchCommitDefaultOptions, BranchRenderOptions, BranchOptions, DELETED_BRANCH_NAME, createDeletedBranch, Branch, };
interface BranchCommitDefaultOptions<TNode> extends CommitRenderOptions<TNode> {
    author?: string;
    subject?: string;
    style?: TemplateOptions["commit"];
}
interface BranchRenderOptions<TNode> {
    renderLabel?: (branch: Branch<TNode>) => TNode;
}
interface BranchOptions<TNode = SVGElement> extends BranchRenderOptions<TNode> {
    /**
     * Gitgraph constructor
     */
    gitgraph: GitgraphCore<TNode>;
    /**
     * Branch name
     */
    name: string;
    /**
     * Branch style
     */
    style: BranchStyle;
    /**
     * Parent commit
     */
    parentCommitHash?: Commit["hash"];
    /**
     * Default options for commits
     */
    commitDefaultOptions?: BranchCommitDefaultOptions<TNode>;
    /**
     * On graph update.
     */
    onGraphUpdate: () => void;
}
declare const DELETED_BRANCH_NAME = "";
declare class Branch<TNode = SVGElement> {
    name: BranchOptions["name"];
    style: BranchStyle;
    computedColor?: BranchStyle["color"];
    parentCommitHash: BranchOptions["parentCommitHash"];
    commitDefaultOptions: BranchCommitDefaultOptions<TNode>;
    renderLabel: BranchOptions<TNode>["renderLabel"];
    private gitgraph;
    private onGraphUpdate;
    constructor(options: BranchOptions<TNode>);
    /**
     * Return the API to manipulate Gitgraph branch as a user.
     */
    getUserApi(): BranchUserApi<TNode>;
    /**
     * Return true if branch was deleted.
     */
    isDeleted(): boolean;
}
declare function createDeletedBranch<TNode>(gitgraph: GitgraphCore<TNode>, style: BranchStyle, onGraphUpdate: () => void): Branch<TNode>;
