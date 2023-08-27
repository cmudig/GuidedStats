export { MergeStyle, ArrowStyle, BranchStyle, CommitDotStyle, CommitMessageStyle, CommitStyleBase, CommitStyle, TemplateOptions, Template, TemplateName, blackArrowTemplate, metroTemplate, templateExtend, getTemplate, };
/**
 * Branch merge style enum
 */
declare enum MergeStyle {
    Bezier = "bezier",
    Straight = "straight"
}
/**
 * Arrow style
 */
interface ArrowStyle {
    /**
     * Arrow color
     */
    color: string | null;
    /**
     * Arrow size in pixel
     */
    size: number | null;
    /**
     * Arrow offset in pixel
     */
    offset: number;
}
declare type ArrowStyleOptions = Partial<ArrowStyle>;
interface BranchStyle {
    /**
     * Branch color
     */
    color?: string;
    /**
     * Branch line width in pixel
     */
    lineWidth: number;
    /**
     * Branch merge style
     */
    mergeStyle: MergeStyle;
    /**
     * Space between branches
     */
    spacing: number;
    /**
     * Branch label style
     */
    label: BranchLabelStyleOptions;
}
declare type BranchStyleOptions = Partial<BranchStyle>;
interface BranchLabelStyle {
    /**
     * Branch label visibility
     */
    display: boolean;
    /**
     * Branch label text color
     */
    color: string;
    /**
     * Branch label stroke color
     */
    strokeColor: string;
    /**
     * Branch label background color
     */
    bgColor: string;
    /**
     * Branch label font
     */
    font: string;
    /**
     * Branch label border radius
     */
    borderRadius: number;
}
declare type BranchLabelStyleOptions = Partial<BranchLabelStyle>;
export interface TagStyle {
    /**
     * Tag text color
     */
    color: string;
    /**
     * Tag stroke color
     */
    strokeColor?: string;
    /**
     * Tag background color
     */
    bgColor?: string;
    /**
     * Tag font
     */
    font: string;
    /**
     * Tag border radius
     */
    borderRadius: number;
    /**
     * Width of the tag pointer
     */
    pointerWidth: number;
}
declare type TagStyleOptions = Partial<TagStyle>;
interface CommitDotStyle {
    /**
     * Commit dot color
     */
    color?: string;
    /**
     * Commit dot size in pixel
     */
    size: number;
    /**
     * Commit dot stroke width
     */
    strokeWidth?: number;
    /**
     * Commit dot stroke color
     */
    strokeColor?: string;
    /**
     * Commit dot font
     */
    font: string;
}
declare type CommitDotStyleOptions = Partial<CommitDotStyle>;
interface CommitMessageStyle {
    /**
     * Commit message color
     */
    color?: string;
    /**
     * Commit message display policy
     */
    display: boolean;
    /**
     * Commit message author display policy
     */
    displayAuthor: boolean;
    /**
     * Commit message hash display policy
     */
    displayHash: boolean;
    /**
     * Commit message font
     */
    font: string;
}
declare type CommitMessageStyleOptions = Partial<CommitMessageStyle>;
interface CommitStyleBase {
    /**
     * Spacing between commits
     */
    spacing: number;
    /**
     * Commit color (dot & message)
     */
    color?: string;
    /**
     * Tooltips policy
     */
    hasTooltipInCompactMode: boolean;
}
interface CommitStyle extends CommitStyleBase {
    /**
     * Commit message style
     */
    message: CommitMessageStyle;
    /**
     * Commit dot style
     */
    dot: CommitDotStyle;
}
interface CommitStyleOptions extends Partial<CommitStyleBase> {
    /**
     * Commit message style
     */
    message?: CommitMessageStyleOptions;
    /**
     * Commit dot style
     */
    dot?: CommitDotStyleOptions;
}
interface TemplateOptions {
    /**
     * Colors scheme: One color for each column
     */
    colors?: string[];
    /**
     * Arrow style
     */
    arrow?: ArrowStyleOptions;
    /**
     * Branch style
     */
    branch?: BranchStyleOptions;
    /**
     * Commit style
     */
    commit?: CommitStyleOptions;
    /**
     * Tag style
     */
    tag?: TagStyleOptions;
}
export declare const DEFAULT_FONT = "normal 12pt Calibri";
/**
 * Gitgraph template
 *
 * Set of design rules for the rendering.
 */
declare class Template {
    /**
     * Colors scheme: One color for each column
     */
    colors: string[];
    /**
     * Arrow style
     */
    arrow: ArrowStyle;
    /**
     * Branch style
     */
    branch: BranchStyle;
    /**
     * Commit style
     */
    commit: CommitStyle;
    /**
     * Tag style
     */
    tag: TagStyleOptions;
    constructor(options: TemplateOptions);
}
/**
 * Black arrow template
 */
declare const blackArrowTemplate: Template;
/**
 * Metro template
 */
declare const metroTemplate: Template;
declare enum TemplateName {
    Metro = "metro",
    BlackArrow = "blackarrow"
}
/**
 * Extend an existing template with new options.
 *
 * @param selectedTemplate Template to extend
 * @param options Template options
 */
declare function templateExtend(selectedTemplate: TemplateName, options: TemplateOptions): Template;
/**
 * Resolve the template to use regarding given `template` value.
 *
 * @param template Selected template name, or instance.
 */
declare function getTemplate(template?: TemplateName | Template): Template;
