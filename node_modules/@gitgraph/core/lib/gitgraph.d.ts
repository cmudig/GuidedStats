import { Branch } from "./branch";
import { Commit } from "./commit";
import { Mode } from "./mode";
import { CompareBranchesOrder } from "./branches-order";
import { Template, TemplateOptions, TemplateName } from "./template";
import { Refs } from "./refs";
import { BranchesPaths } from "./branches-paths";
import { Orientation } from "./orientation";
import { GitgraphUserApi, GitgraphBranchOptions, GitgraphTagOptions } from "./user-api/gitgraph-user-api";
export { GitgraphOptions, RenderedData, GitgraphCore };
interface GitgraphOptions {
    template?: TemplateName | Template;
    orientation?: Orientation;
    reverseArrow?: boolean;
    initCommitOffsetX?: number;
    initCommitOffsetY?: number;
    mode?: Mode;
    author?: string;
    branchLabelOnEveryCommit?: boolean;
    commitMessage?: string;
    generateCommitHash?: () => Commit["hash"];
    compareBranchesOrder?: CompareBranchesOrder;
}
interface RenderedData<TNode> {
    commits: Array<Commit<TNode>>;
    branchesPaths: BranchesPaths<TNode>;
    commitMessagesX: number;
}
declare class GitgraphCore<TNode = SVGElement> {
    orientation?: Orientation;
    readonly isHorizontal: boolean;
    readonly isVertical: boolean;
    readonly isReverse: boolean;
    readonly shouldDisplayCommitMessage: boolean;
    reverseArrow: boolean;
    initCommitOffsetX: number;
    initCommitOffsetY: number;
    mode?: Mode;
    author: string;
    commitMessage: string;
    generateCommitHash: () => Commit["hash"] | undefined;
    branchesOrderFunction: CompareBranchesOrder | undefined;
    template: Template;
    branchLabelOnEveryCommit: boolean;
    refs: Refs;
    tags: Refs;
    tagStyles: {
        [name: string]: TemplateOptions["tag"];
    };
    tagRenders: {
        [name: string]: GitgraphTagOptions<TNode>["render"];
    };
    commits: Array<Commit<TNode>>;
    branches: Map<Branch["name"], Branch<TNode>>;
    currentBranch: Branch<TNode>;
    private listeners;
    private nextTimeoutId;
    constructor(options?: GitgraphOptions);
    /**
     * Return the API to manipulate Gitgraph as a user.
     * Rendering library should give that API to their consumer.
     */
    getUserApi(): GitgraphUserApi<TNode>;
    /**
     * Add a change listener.
     * It will be called any time the graph have changed (commit, merge…).
     *
     * @param listener A callback to be invoked on every change.
     * @returns A function to remove this change listener.
     */
    subscribe(listener: (data: RenderedData<TNode>) => void): () => void;
    /**
     * Return all data required for rendering.
     * Rendering libraries will use this to implement their rendering strategy.
     */
    getRenderedData(): RenderedData<TNode>;
    /**
     * Create a new branch.
     *
     * @param options Options of the branch
     */
    createBranch(options: GitgraphBranchOptions<TNode>): Branch<TNode>;
    /**
     * Create a new branch. (as `git branch`)
     *
     * @param name Name of the created branch
     */
    createBranch(name: string): Branch<TNode>;
    /**
     * Return commits with data for rendering.
     */
    private computeRenderedCommits;
    /**
     * Return branches paths with all data required for rendering.
     *
     * @param commits List of commits with rendering data computed
     */
    private computeRenderedBranchesPaths;
    /**
     * Set branches colors based on branches paths.
     *
     * @param commits List of graph commits
     * @param branchesPaths Branches paths to be rendered
     */
    private computeBranchesColor;
    /**
     * Return commit messages X position for rendering.
     *
     * @param branchesPaths Branches paths to be rendered
     */
    private computeCommitMessagesX;
    /**
     * Add `branches` property to commit.
     *
     * @param branches All branches mapped by commit hash
     * @param commit Commit
     */
    private withBranches;
    /**
     * Get all branches from current commits.
     */
    private getBranches;
    /**
     * Add position to given commit.
     *
     * @param rows Graph rows
     * @param branchesOrder Computed order of branches
     * @param commit Commit to position
     */
    private withPosition;
    /**
     * Return the default color for given branch.
     *
     * @param branchesOrder Computed order of branches
     * @param branchName Name of the branch
     */
    private getBranchDefaultColor;
    /**
     * Tell each listener something new happened.
     * E.g. a rendering library will know it needs to re-render the graph.
     */
    private next;
}
