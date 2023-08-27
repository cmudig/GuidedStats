import { TagStyle, TemplateOptions } from "../template";
import { Commit, CommitRenderOptions } from "../commit";
import { Branch, BranchCommitDefaultOptions, BranchRenderOptions } from "../branch";
import { GitgraphCore } from "../gitgraph";
import { BranchUserApi } from "./branch-user-api";
export { GitgraphCommitOptions, GitgraphBranchOptions, GitgraphTagOptions, GitgraphUserApi, };
interface GitgraphCommitOptions<TNode> extends CommitRenderOptions<TNode> {
    author?: string;
    subject?: string;
    body?: string;
    hash?: string;
    style?: TemplateOptions["commit"];
    dotText?: string;
    tag?: string;
    onClick?: (commit: Commit<TNode>) => void;
    onMessageClick?: (commit: Commit<TNode>) => void;
    onMouseOver?: (commit: Commit<TNode>) => void;
    onMouseOut?: (commit: Commit<TNode>) => void;
}
interface GitgraphTagOptions<TNode> {
    name: string;
    style?: TemplateOptions["tag"];
    ref?: Commit["hash"] | Branch["name"];
    render?: (name: string, style: TagStyle) => TNode;
}
interface GitgraphBranchOptions<TNode> extends BranchRenderOptions<TNode> {
    /**
     * Branch name
     */
    name: string;
    /**
     * Origin branch or commit hash
     */
    from?: BranchUserApi<TNode> | Commit["hash"];
    /**
     * Default options for commits
     */
    commitDefaultOptions?: BranchCommitDefaultOptions<TNode>;
    /**
     * Branch style
     */
    style?: TemplateOptions["branch"];
}
declare class GitgraphUserApi<TNode> {
    private _graph;
    private _onGraphUpdate;
    constructor(graph: GitgraphCore<TNode>, onGraphUpdate: () => void);
    /**
     * Clear everything (as `rm -rf .git && git init`).
     */
    clear(): this;
    /**
     * Add a new commit in the history (as `git commit`).
     *
     * @param subject Commit subject
     */
    commit(subject?: string): this;
    /**
     * Add a new commit in the history (as `git commit`).
     *
     * @param options Options of the commit
     */
    commit(options?: GitgraphCommitOptions<TNode>): this;
    /**
     * Create a new branch (as `git branch`).
     *
     * @param options Options of the branch
     */
    branch(options: GitgraphBranchOptions<TNode>): BranchUserApi<TNode>;
    /**
     * Create a new branch (as `git branch`).
     *
     * @param name Name of the created branch
     */
    branch(name: string): BranchUserApi<TNode>;
    /**
     * Tag a specific commit.
     *
     * @param options Options of the tag
     */
    tag(options: GitgraphTagOptions<TNode>): this;
    /**
     * Tag a specific commit.
     *
     * @param name Name of the tag
     * @param ref Commit or branch name or commit hash
     */
    tag(name: GitgraphTagOptions<TNode>["name"], ref?: GitgraphTagOptions<TNode>["ref"]): this;
    /**
     * Import a JSON.
     *
     * Data can't be typed since it comes from a JSON.
     * We validate input format and throw early if something is invalid.
     *
     * @experimental
     * @param data JSON from `git2json` output
     */
    import(data: unknown): this;
    private _withBranches;
    private _getBranches;
}
