import { Commit } from "../commit";
import { RegularGraphRows } from "./regular";
export declare class CompactGraphRows<TNode> extends RegularGraphRows<TNode> {
    protected computeRowsFromCommits(commits: Array<Commit<TNode>>): void;
}
