import { Commit } from "@gitgraph/core";
export { createTooltip, PADDING };
declare const PADDING = 10;
declare function createTooltip(commit: Commit): SVGElement;
