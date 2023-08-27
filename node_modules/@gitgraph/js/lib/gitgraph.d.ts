import { GitgraphOptions, GitgraphCommitOptions, MergeStyle, Mode, BranchUserApi, GitgraphBranchOptions, GitgraphTagOptions, GitgraphMergeOptions, Orientation, TemplateName, templateExtend } from "@gitgraph/core";
declare type CommitOptions = GitgraphCommitOptions<SVGElement>;
declare type BranchOptions = GitgraphBranchOptions<SVGElement>;
declare type TagOptions = GitgraphTagOptions<SVGElement>;
declare type MergeOptions = GitgraphMergeOptions<SVGElement>;
declare type Branch = BranchUserApi<SVGElement>;
export { createGitgraph, CommitOptions, Branch, BranchOptions, TagOptions, MergeOptions, Mode, Orientation, TemplateName, templateExtend, MergeStyle, };
declare function createGitgraph(graphContainer: HTMLElement, options?: GitgraphOptions & {
    responsive?: boolean;
}): import("@gitgraph/core/lib/user-api/gitgraph-user-api").GitgraphUserApi<SVGElement>;
