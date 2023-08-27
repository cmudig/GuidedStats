import { Branch, Commit } from "@gitgraph/core";
export { createBranchLabel, PADDING_X, PADDING_Y };
declare const PADDING_X = 10;
declare const PADDING_Y = 5;
declare function createBranchLabel(branch: Branch, commit: Commit): SVGElement;
