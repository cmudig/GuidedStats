import { Commit } from "./commit";
import { Branch } from "./branch";
import { CommitStyleBase } from "./template";
export { BranchesPaths, Coordinate, BranchesPathsCalculator, toSvgPath };
declare type BranchesPaths<TNode> = Map<Branch<TNode>, Coordinate[][]>;
interface Coordinate {
    x: number;
    y: number;
}
/**
 * Calculate branches paths of the graph.
 *
 * It follows the Command pattern:
 * => a class with a single `execute()` public method.
 *
 * Main benefit is we can split computation in smaller steps without
 * passing around parameters (we can rely on private data).
 */
declare class BranchesPathsCalculator<TNode> {
    private commits;
    private branches;
    private commitSpacing;
    private isGraphVertical;
    private isGraphReverse;
    private createDeletedBranch;
    private branchesPaths;
    constructor(commits: Array<Commit<TNode>>, branches: Map<Branch["name"], Branch<TNode>>, commitSpacing: CommitStyleBase["spacing"], isGraphVertical: boolean, isGraphReverse: boolean, createDeletedBranch: () => Branch<TNode>);
    /**
     * Compute branches paths for graph.
     */
    execute(): BranchesPaths<TNode>;
    /**
     * Initialize branches paths from calculator's commits.
     */
    private fromCommits;
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
    private withMergeCommits;
    /**
     * Retrieve deleted branch from calculator's branches paths.
     */
    private getDeletedBranchInPath;
    /**
     * Smooth all paths by putting points on each row.
     */
    private smoothBranchesPaths;
}
/**
 * Return a string ready to use in `svg.path.d` from coordinates
 *
 * @param coordinates Collection of coordinates
 */
declare function toSvgPath(coordinates: Coordinate[][], isBezier: boolean, isVertical: boolean): string;
