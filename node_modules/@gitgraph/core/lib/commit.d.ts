import { CommitStyle, TagStyle } from "./template";
import { Branch } from "./branch";
import { Refs } from "./refs";
import { Tag } from "./tag";
import { GitgraphTagOptions } from "./user-api/gitgraph-user-api";
export { CommitRenderOptions, CommitOptions, Commit };
interface CommitRenderOptions<TNode> {
    renderDot?: (commit: Commit<TNode>) => TNode;
    renderMessage?: (commit: Commit<TNode>) => TNode;
    renderTooltip?: (commit: Commit<TNode>) => TNode;
}
interface CommitOptions<TNode> extends CommitRenderOptions<TNode> {
    author: string;
    subject: string;
    style: CommitStyle;
    body?: string;
    hash?: string;
    parents?: string[];
    dotText?: string;
    onClick?: (commit: Commit<TNode>) => void;
    onMessageClick?: (commit: Commit<TNode>) => void;
    onMouseOver?: (commit: Commit<TNode>) => void;
    onMouseOut?: (commit: Commit<TNode>) => void;
}
declare class Commit<TNode = SVGElement> {
    /**
     * Ref names
     */
    refs: Array<Branch["name"] | "HEAD">;
    /**
     * Commit x position
     */
    x: number;
    /**
     * Commit y position
     */
    y: number;
    /**
     * Commit hash
     */
    hash: string;
    /**
     * Abbreviated commit hash
     */
    hashAbbrev: string;
    /**
     * Parent hashes
     */
    parents: Array<Commit<TNode>["hash"]>;
    /**
     * Abbreviated parent hashed
     */
    parentsAbbrev: Array<Commit<TNode>["hashAbbrev"]>;
    /**
     * Author
     */
    author: {
        /**
         * Author name
         */
        name: string;
        /**
         * Author email
         */
        email: string;
        /**
         * Author date
         */
        timestamp: number;
    };
    /**
     * Committer
     */
    committer: {
        /**
         * Commiter name
         */
        name: string;
        /**
         * Commiter email
         */
        email: string;
        /**
         * Commiter date
         */
        timestamp: number;
    };
    /**
     * Subject
     */
    subject: string;
    /**
     * Body
     */
    body: string;
    /**
     * Message
     */
    readonly message: string;
    /**
     * Style
     */
    style: CommitStyle;
    /**
     * Text inside commit dot
     */
    dotText?: string;
    /**
     * List of branches attached
     */
    branches?: Array<Branch["name"]>;
    /**
     * Branch that should be rendered
     */
    readonly branchToDisplay: Branch["name"];
    /**
     * List of tags attached
     */
    tags?: Array<Tag<TNode>>;
    /**
     * Callback to execute on click.
     */
    onClick: () => void;
    /**
     * Callback to execute on click on the commit message.
     */
    onMessageClick: () => void;
    /**
     * Callback to execute on mouse over.
     */
    onMouseOver: () => void;
    /**
     * Callback to execute on mouse out.
     */
    onMouseOut: () => void;
    /**
     * Custom dot render
     */
    renderDot?: (commit: Commit<TNode>) => TNode;
    /**
     * Custom message render
     */
    renderMessage?: (commit: Commit<TNode>) => TNode;
    /**
     * Custom tooltip render
     */
    renderTooltip?: (commit: Commit<TNode>) => TNode;
    constructor(options: CommitOptions<TNode>);
    setRefs(refs: Refs): this;
    setTags(tags: Refs, getTagStyle: (name: Tag<TNode>["name"]) => Partial<TagStyle>, getTagRender: (name: Tag<TNode>["name"]) => GitgraphTagOptions<TNode>["render"]): this;
    setBranches(branches: Array<Branch["name"]>): this;
    setPosition({ x, y }: {
        x: number;
        y: number;
    }): this;
    withDefaultColor(color: string): Commit<TNode>;
    /**
     * Ideally, we want Commit to be a [Value Object](https://martinfowler.com/bliki/ValueObject.html).
     * We started with a mutable class. So we'll refactor that little by little.
     * This private function is a helper to create a new Commit from existing one.
     */
    private cloneCommit;
}
