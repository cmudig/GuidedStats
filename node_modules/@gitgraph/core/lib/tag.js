"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template_1 = require("./template");
const utils_1 = require("./utils");
class Tag {
    constructor(name, style, render, commitStyle) {
        this.name = name;
        this.tagStyle = style;
        this.commitStyle = commitStyle;
        this.render = render;
    }
    /**
     * Style
     */
    get style() {
        return {
            strokeColor: this.tagStyle.strokeColor || this.commitStyle.color,
            bgColor: this.tagStyle.bgColor || this.commitStyle.color,
            color: this.tagStyle.color || "white",
            font: this.tagStyle.font || this.commitStyle.message.font || template_1.DEFAULT_FONT,
            borderRadius: utils_1.numberOptionOr(this.tagStyle.borderRadius, 10),
            pointerWidth: utils_1.numberOptionOr(this.tagStyle.pointerWidth, 12),
        };
    }
}
exports.Tag = Tag;
//# sourceMappingURL=tag.js.map