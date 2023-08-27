import { createG, createRect, createText } from "./svg-elements";
export { createBranchLabel, PADDING_X, PADDING_Y };
var PADDING_X = 10;
var PADDING_Y = 5;
function createBranchLabel(branch, commit) {
    var rect = createRect({
        width: 0,
        height: 0,
        borderRadius: branch.style.label.borderRadius,
        stroke: branch.style.label.strokeColor || commit.style.color,
        fill: branch.style.label.bgColor,
    });
    var text = createText({
        content: branch.name,
        translate: {
            x: PADDING_X,
            y: 0,
        },
        font: branch.style.label.font,
        fill: branch.style.label.color || commit.style.color,
    });
    var branchLabel = createG({ children: [rect] });
    var observer = new MutationObserver(function () {
        var _a = text.getBBox(), height = _a.height, width = _a.width;
        var boxWidth = width + 2 * PADDING_X;
        var boxHeight = height + 2 * PADDING_Y;
        // Ideally, it would be great to refactor these behavior into SVG elements.
        rect.setAttribute("width", boxWidth.toString());
        rect.setAttribute("height", boxHeight.toString());
        text.setAttribute("y", (boxHeight / 2).toString());
    });
    observer.observe(branchLabel, {
        attributes: false,
        subtree: false,
        childList: true,
    });
    // Add text after observer is set up => react based on text size.
    // We might refactor it by including `onChildrenUpdate()` to `createG()`.
    branchLabel.appendChild(text);
    return branchLabel;
}
//# sourceMappingURL=branch-label.js.map