"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Branch merge style enum
 */
var MergeStyle;
(function (MergeStyle) {
    MergeStyle["Bezier"] = "bezier";
    MergeStyle["Straight"] = "straight";
})(MergeStyle || (MergeStyle = {}));
exports.MergeStyle = MergeStyle;
exports.DEFAULT_FONT = "normal 12pt Calibri";
/**
 * Gitgraph template
 *
 * Set of design rules for the rendering.
 */
class Template {
    constructor(options) {
        // Options
        options.branch = options.branch || {};
        options.branch.label = options.branch.label || {};
        options.arrow = options.arrow || {};
        options.commit = options.commit || {};
        options.commit.dot = options.commit.dot || {};
        options.commit.message = options.commit.message || {};
        // One color per column
        this.colors = options.colors || ["#000000"];
        // Branch style
        this.branch = {
            color: options.branch.color,
            lineWidth: options.branch.lineWidth || 2,
            mergeStyle: options.branch.mergeStyle || MergeStyle.Bezier,
            spacing: utils_1.numberOptionOr(options.branch.spacing, 20),
            label: {
                display: utils_1.booleanOptionOr(options.branch.label.display, true),
                color: options.branch.label.color || options.commit.color,
                strokeColor: options.branch.label.strokeColor || options.commit.color,
                bgColor: options.branch.label.bgColor || "white",
                font: options.branch.label.font ||
                    options.commit.message.font ||
                    exports.DEFAULT_FONT,
                borderRadius: utils_1.numberOptionOr(options.branch.label.borderRadius, 10),
            },
        };
        // Arrow style
        this.arrow = {
            size: options.arrow.size || null,
            color: options.arrow.color || null,
            offset: options.arrow.offset || 2,
        };
        // Commit style
        this.commit = {
            color: options.commit.color,
            spacing: utils_1.numberOptionOr(options.commit.spacing, 25),
            hasTooltipInCompactMode: utils_1.booleanOptionOr(options.commit.hasTooltipInCompactMode, true),
            dot: {
                color: options.commit.dot.color || options.commit.color,
                size: options.commit.dot.size || 3,
                strokeWidth: utils_1.numberOptionOr(options.commit.dot.strokeWidth, 0),
                strokeColor: options.commit.dot.strokeColor,
                font: options.commit.dot.font ||
                    options.commit.message.font ||
                    "normal 10pt Calibri",
            },
            message: {
                display: utils_1.booleanOptionOr(options.commit.message.display, true),
                displayAuthor: utils_1.booleanOptionOr(options.commit.message.displayAuthor, true),
                displayHash: utils_1.booleanOptionOr(options.commit.message.displayHash, true),
                color: options.commit.message.color || options.commit.color,
                font: options.commit.message.font || exports.DEFAULT_FONT,
            },
        };
        // Tag style
        // This one is computed in the Tag instance. It needs Commit style
        // that is partially computed at runtime (for colors).
        this.tag = options.tag || {};
    }
}
exports.Template = Template;
/**
 * Black arrow template
 */
const blackArrowTemplate = new Template({
    colors: ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"],
    branch: {
        color: "#000000",
        lineWidth: 4,
        spacing: 50,
        mergeStyle: MergeStyle.Straight,
    },
    commit: {
        spacing: 60,
        dot: {
            size: 16,
            strokeColor: "#000000",
            strokeWidth: 4,
        },
        message: {
            color: "black",
        },
    },
    arrow: {
        size: 16,
        offset: -1.5,
    },
});
exports.blackArrowTemplate = blackArrowTemplate;
/**
 * Metro template
 */
const metroTemplate = new Template({
    colors: ["#979797", "#008fb5", "#f1c109"],
    branch: {
        lineWidth: 10,
        spacing: 50,
    },
    commit: {
        spacing: 80,
        dot: {
            size: 14,
        },
        message: {
            font: "normal 14pt Arial",
        },
    },
});
exports.metroTemplate = metroTemplate;
var TemplateName;
(function (TemplateName) {
    TemplateName["Metro"] = "metro";
    TemplateName["BlackArrow"] = "blackarrow";
})(TemplateName || (TemplateName = {}));
exports.TemplateName = TemplateName;
/**
 * Extend an existing template with new options.
 *
 * @param selectedTemplate Template to extend
 * @param options Template options
 */
function templateExtend(selectedTemplate, options) {
    const template = getTemplate(selectedTemplate);
    if (!options.branch)
        options.branch = {};
    if (!options.commit)
        options.commit = {};
    // This is tedious, but it seems acceptable so we don't need lodash
    // as we want to keep bundlesize small.
    return {
        colors: options.colors || template.colors,
        arrow: Object.assign({}, template.arrow, options.arrow),
        branch: Object.assign({}, template.branch, options.branch, { label: Object.assign({}, template.branch.label, options.branch.label) }),
        commit: Object.assign({}, template.commit, options.commit, { dot: Object.assign({}, template.commit.dot, options.commit.dot), message: Object.assign({}, template.commit.message, options.commit.message) }),
        tag: Object.assign({}, template.tag, options.tag),
    };
}
exports.templateExtend = templateExtend;
/**
 * Resolve the template to use regarding given `template` value.
 *
 * @param template Selected template name, or instance.
 */
function getTemplate(template) {
    if (!template)
        return metroTemplate;
    if (typeof template === "string") {
        return {
            [TemplateName.BlackArrow]: blackArrowTemplate,
            [TemplateName.Metro]: metroTemplate,
        }[template];
    }
    return template;
}
exports.getTemplate = getTemplate;
//# sourceMappingURL=template.js.map