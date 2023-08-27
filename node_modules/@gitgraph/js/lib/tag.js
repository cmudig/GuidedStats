import { createG, createText, createPath } from "./svg-elements";
export { createTag, PADDING_X };
var PADDING_X = 10;
var PADDING_Y = 5;
function createTag(tag) {
    var path = createPath({
        d: "",
        fill: tag.style.bgColor,
        stroke: tag.style.strokeColor,
    });
    var text = createText({
        content: tag.name,
        fill: tag.style.color,
        font: tag.style.font,
        translate: { x: 0, y: 0 },
    });
    var result = createG({ children: [path] });
    var offset = tag.style.pointerWidth;
    var observer = new MutationObserver(function () {
        var _a = text.getBBox(), height = _a.height, width = _a.width;
        if (height === 0 || width === 0)
            return;
        var radius = tag.style.borderRadius;
        var boxWidth = offset + width + 2 * PADDING_X;
        var boxHeight = height + 2 * PADDING_Y;
        var pathD = [
            "M 0,0",
            "L " + offset + "," + boxHeight / 2,
            "V " + boxHeight / 2,
            "Q " + offset + "," + boxHeight / 2 + " " + (offset + radius) + "," + boxHeight / 2,
            "H " + (boxWidth - radius),
            "Q " + boxWidth + "," + boxHeight / 2 + " " + boxWidth + "," + (boxHeight / 2 - radius),
            "V -" + (boxHeight / 2 - radius),
            "Q " + boxWidth + ",-" + boxHeight / 2 + " " + (boxWidth - radius) + ",-" + boxHeight / 2,
            "H " + (offset + radius),
            "Q " + offset + ",-" + boxHeight / 2 + " " + offset + ",-" + boxHeight / 2,
            "V -" + boxHeight / 2,
            "z",
        ].join(" ");
        // Ideally, it would be great to refactor these behavior into SVG elements.
        path.setAttribute("d", pathD.toString());
        text.setAttribute("x", (offset + PADDING_X).toString());
    });
    observer.observe(result, {
        attributes: false,
        subtree: false,
        childList: true,
    });
    // Add text after observer is set up => react based on text size.
    // We might refactor it by including `onChildrenUpdate()` to `createG()`.
    result.appendChild(text);
    return result;
}
//# sourceMappingURL=tag.js.map