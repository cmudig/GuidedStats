import { GitgraphCore } from "../gitgraph";
import { GitgraphCommitOptions, GitgraphBranchOptions, GitgraphTagOptions } from "./gitgraph-user-api";
import { Branch } from "../branch";
import { Omit } from "../utils";
export { BranchUserApi, GitgraphMergeOptions };
interface GitgraphMergeOptions<TNode> {
    /**
     * Branch or branch name.
     */
    branch: string | BranchUserApi<TNode>;
    /**
     * If `true`, perform a fast-forward merge (if possible).
     */
    fastForward?: boolean;
    /**
     * Commit options.
     */
    commitOptions?: GitgraphCommitOptions<TNode>;
}
declare type BranchTagOptions<TNode> = Omit<GitgraphTagOptions<TNode>, ["ref"]>;
declare class BranchUserApi<TNode> {
    /**
     * Name of the branch.
     * It needs to be public to be used when we merge another branch.
     */
    readonly name: Branch["name"];
    private _branch;
    private _graph;
    private _onGraphUpdate;
    constructor(branch: Branch<TNode>, graph: GitgraphCore<TNode>, onGraphUpdate: () => void);
    /**
     * Create a new branch (as `git branch`).
     *
     * @param options Options of the branch
     */
    branch(options: Omit<GitgraphBranchOptions<TNode>, "from">): BranchUserApi<TNode>;
    /**
     * Create a new branch (as `git branch`).
     *
     * @param name Name of the created branch
     */
    branch(name: string): BranchUserApi<TNode>;
    /**
     * Add a new commit in the branch (as `git commit`).
     *
     * @param subject Commit subject
     */
    commit(subject?: string): this;
    /**
     * Add a new commit in the branch (as `git commit`).
     *
     * @param options Options of the commit
     */
    commit(options?: GitgraphCommitOptions<TNode>): this;
    /**
     * Delete the branch (as `git branch -d`)
     */
    delete(): this;
    /**
     * Create a merge commit.
     *
     * @param branch Branch
     * @param subject Merge commit message
     */
    merge(branch: BranchUserApi<TNode>, subject?: string): this;
    /**
     * Create a merge commit.
     *
     * @param branchName Branch name
     * @param subject Merge commit message
     */
    merge(branchName: string, subject?: string): this;
    /**
     * Create a merge commit.
     *
     * @param options Options of the merge
     */
    merge(options: GitgraphMergeOptions<TNode>): this;
    /**
     * Tag the last commit of the branch.
     *
     * @param options Options of the tag
     */
    tag(options: BranchTagOptions<TNode>): this;
    /**
     * Tag the last commit of the branch.
     *
     * @param name Name of the tag
     */
    tag(name: BranchTagOptions<TNode>["name"]): this;
    /**
     * Checkout onto this branch and update "HEAD" in refs
     */
    checkout(): this;
    private _commitWithParents;
    private _areCommitsConnected;
    private _fastForwardTo;
    private _getCommitStyle;
    private _isReferenced;
}
