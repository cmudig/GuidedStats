import { Branch } from "./branch";
import { Commit } from "./commit";
export { BranchesOrder, CompareBranchesOrder };
declare type Color = string;
/**
 * Function used to determine the order of the branches in the rendered graph.
 *
 * Returns a value:
 * - < 0 if `branchNameA` should render before `branchNameB`
 * - \> 0 if `branchNameA` should render after `branchNameB`
 * - = 0 if ordering of both branches shouldn't change
 */
declare type CompareBranchesOrder = (branchNameA: Branch["name"], branchNameB: Branch["name"]) => number;
declare class BranchesOrder<TNode> {
    private branches;
    private colors;
    constructor(commits: Array<Commit<TNode>>, colors: Color[], compareFunction: CompareBranchesOrder | undefined);
    /**
     * Return the order of the given branch name.
     *
     * @param branchName Name of the branch
     */
    get(branchName: Branch["name"]): number;
    /**
     * Return the color of the given branch.
     *
     * @param branchName Name of the branch
     */
    getColorOf(branchName: Branch["name"]): Color;
}
