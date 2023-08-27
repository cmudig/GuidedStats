import { TagStyle, CommitStyle } from "./template";
import { GitgraphTagOptions } from "./user-api/gitgraph-user-api";
export { Tag };
declare class Tag<TNode> {
    /**
     * Name
     */
    readonly name: string;
    /**
     * Custom render function
     */
    readonly render?: GitgraphTagOptions<TNode>["render"];
    /**
     * Style
     */
    readonly style: TagStyle;
    private readonly tagStyle;
    private readonly commitStyle;
    constructor(name: string, style: Partial<TagStyle>, render: GitgraphTagOptions<TNode>["render"], commitStyle: CommitStyle);
}
