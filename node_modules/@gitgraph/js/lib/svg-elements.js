export { createSvg, createG, createText, createCircle, createRect, createPath, createUse, createClipPath, createDefs, createForeignObject, };
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function createSvg(options) {
    var svg = document.createElementNS(SVG_NAMESPACE, "svg");
    if (!options)
        return svg;
    if (options.children) {
        options.children.forEach(function (child) { return svg.appendChild(child); });
    }
    if (options.viewBox) {
        svg.setAttribute("viewBox", options.viewBox);
    }
    if (options.height) {
        svg.setAttribute("height", options.height.toString());
    }
    if (options.width) {
        svg.setAttribute("width", options.width.toString());
    }
    return svg;
}
function createG(options) {
    var g = document.createElementNS(SVG_NAMESPACE, "g");
    options.children.forEach(function (child) { return child && g.appendChild(child); });
    if (options.translate) {
        g.setAttribute("transform", "translate(" + options.translate.x + ", " + options.translate.y + ")");
    }
    if (options.fill) {
        g.setAttribute("fill", options.fill);
    }
    if (options.stroke) {
        g.setAttribute("stroke", options.stroke);
    }
    if (options.strokeWidth) {
        g.setAttribute("stroke-width", options.strokeWidth.toString());
    }
    if (options.onClick) {
        g.addEventListener("click", options.onClick);
    }
    if (options.onMouseOver) {
        g.addEventListener("mouseover", options.onMouseOver);
    }
    if (options.onMouseOut) {
        g.addEventListener("mouseout", options.onMouseOut);
    }
    return g;
}
function createText(options) {
    var text = document.createElementNS(SVG_NAMESPACE, "text");
    text.setAttribute("alignment-baseline", "central");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = options.content;
    if (options.fill) {
        text.setAttribute("fill", options.fill);
    }
    if (options.font) {
        text.setAttribute("style", "font: " + options.font);
    }
    if (options.anchor) {
        text.setAttribute("text-anchor", options.anchor);
    }
    if (options.translate) {
        text.setAttribute("x", options.translate.x.toString());
        text.setAttribute("y", options.translate.y.toString());
    }
    if (options.onClick) {
        text.addEventListener("click", options.onClick);
    }
    return text;
}
function createCircle(options) {
    var circle = document.createElementNS(SVG_NAMESPACE, "circle");
    circle.setAttribute("cx", options.radius.toString());
    circle.setAttribute("cy", options.radius.toString());
    circle.setAttribute("r", options.radius.toString());
    if (options.id) {
        circle.setAttribute("id", options.id);
    }
    if (options.fill) {
        circle.setAttribute("fill", options.fill);
    }
    return circle;
}
function createRect(options) {
    var rect = document.createElementNS(SVG_NAMESPACE, "rect");
    rect.setAttribute("width", options.width.toString());
    rect.setAttribute("height", options.height.toString());
    if (options.borderRadius) {
        rect.setAttribute("rx", options.borderRadius.toString());
    }
    if (options.fill) {
        rect.setAttribute("fill", options.fill || "none");
    }
    if (options.stroke) {
        rect.setAttribute("stroke", options.stroke);
    }
    return rect;
}
function createPath(options) {
    var path = document.createElementNS(SVG_NAMESPACE, "path");
    path.setAttribute("d", options.d);
    if (options.fill) {
        path.setAttribute("fill", options.fill);
    }
    if (options.stroke) {
        path.setAttribute("stroke", options.stroke);
    }
    if (options.strokeWidth) {
        path.setAttribute("stroke-width", options.strokeWidth.toString());
    }
    if (options.translate) {
        path.setAttribute("transform", "translate(" + options.translate.x + ", " + options.translate.y + ")");
    }
    return path;
}
function createUse(href) {
    var use = document.createElementNS(SVG_NAMESPACE, "use");
    use.setAttribute("href", "#" + href);
    // xlink:href is deprecated in SVG2, but we keep it for retro-compatibility
    // => https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use#Browser_compatibility
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + href);
    return use;
}
function createClipPath() {
    return document.createElementNS(SVG_NAMESPACE, "clipPath");
}
function createDefs(children) {
    var defs = document.createElementNS(SVG_NAMESPACE, "defs");
    children.forEach(function (child) { return defs.appendChild(child); });
    return defs;
}
function createForeignObject(options) {
    var result = document.createElementNS(SVG_NAMESPACE, "foreignObject");
    result.setAttribute("width", options.width.toString());
    if (options.translate) {
        result.setAttribute("x", options.translate.x.toString());
        result.setAttribute("y", options.translate.y.toString());
    }
    var p = document.createElement("p");
    p.textContent = options.content;
    result.appendChild(p);
    return result;
}
//# sourceMappingURL=svg-elements.js.map