import { Commit } from "../commit";
export declare class RegularGraphRows<TNode> {
    protected rows: Map<string, number>;
    private maxRowCache;
    constructor(commits: Array<Commit<TNode>>);
    getRowOf(commitHash: Commit["hash"]): number;
    getMaxRow(): number;
    protected computeRowsFromCommits(commits: Array<Commit<TNode>>): void;
}
