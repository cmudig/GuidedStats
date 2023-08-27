"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orientation_1 = require("./orientation");
/**
 * Provide a default value to a boolean.
 * @param value
 * @param defaultValue
 */
function booleanOptionOr(value, defaultValue) {
    return typeof value === "boolean" ? value : defaultValue;
}
exports.booleanOptionOr = booleanOptionOr;
/**
 * Provide a default value to a number.
 * @param value
 * @param defaultValue
 */
function numberOptionOr(value, defaultValue) {
    return typeof value === "number" ? value : defaultValue;
}
exports.numberOptionOr = numberOptionOr;
/**
 * Creates an object composed of the picked object properties.
 * @param obj The source object
 * @param paths The property paths to pick
 */
function pick(obj, paths) {
    return Object.assign({}, paths.reduce((mem, key) => (Object.assign({}, mem, { [key]: obj[key] })), {}));
}
exports.pick = pick;
/**
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param paths The property paths to pick
 */
function debug(commits, paths) {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(commits.map((commit) => pick(commit, paths)), null, 2));
}
exports.debug = debug;
/**
 * Return true if is undefined.
 *
 * @param obj
 */
function isUndefined(obj) {
    return obj === undefined;
}
exports.isUndefined = isUndefined;
/**
 * Return a version of the object without any undefined keys.
 *
 * @param obj
 */
function withoutUndefinedKeys(obj = {}) {
    return Object.keys(obj).reduce((mem, key) => isUndefined(obj[key]) ? mem : Object.assign({}, mem, { [key]: obj[key] }), {});
}
exports.withoutUndefinedKeys = withoutUndefinedKeys;
/**
 * Return a string ready to use in `svg.path.d` to draw an arrow from params.
 *
 * @param graph Graph context
 * @param parent Parent commit of the target commit
 * @param commit Target commit
 */
function arrowSvgPath(graph, parent, commit) {
    const commitRadius = commit.style.dot.size;
    const size = graph.template.arrow.size;
    const h = commitRadius + graph.template.arrow.offset;
    // Delta between left & right (radian)
    const delta = Math.PI / 7;
    // Alpha angle between parent & commit (radian)
    const alpha = getAlpha(graph, parent, commit);
    // Top
    const x1 = h * Math.cos(alpha);
    const y1 = h * Math.sin(alpha);
    // Bottom right
    const x2 = (h + size) * Math.cos(alpha - delta);
    const y2 = (h + size) * Math.sin(alpha - delta);
    // Bottom center
    const x3 = (h + size / 2) * Math.cos(alpha);
    const y3 = (h + size / 2) * Math.sin(alpha);
    // Bottom left
    const x4 = (h + size) * Math.cos(alpha + delta);
    const y4 = (h + size) * Math.sin(alpha + delta);
    return `M${x1},${y1} L${x2},${y2} Q${x3},${y3} ${x4},${y4} L${x4},${y4}`;
}
exports.arrowSvgPath = arrowSvgPath;
function getAlpha(graph, parent, commit) {
    const deltaX = parent.x - commit.x;
    const deltaY = parent.y - commit.y;
    const commitSpacing = graph.template.commit.spacing;
    let alphaY;
    let alphaX;
    // Angle usually start from previous commit Y position:
    //
    // o
    // ↑ ↖ ︎
    // o  |  <-- path is straight until last commit Y position
    // ↑  o
    // | ↗︎
    // o
    //
    // So we can to default to commit spacing.
    // For horizontal orientation => same with commit X position.
    switch (graph.orientation) {
        case orientation_1.Orientation.Horizontal:
            alphaY = deltaY;
            alphaX = -commitSpacing;
            break;
        case orientation_1.Orientation.HorizontalReverse:
            alphaY = deltaY;
            alphaX = commitSpacing;
            break;
        case orientation_1.Orientation.VerticalReverse:
            alphaY = -commitSpacing;
            alphaX = deltaX;
            break;
        default:
            alphaY = commitSpacing;
            alphaX = deltaX;
            break;
    }
    // If commit is distant from its parent, there should be no angle.
    //
    //    o ︎
    //    ↑  <-- arrow is like previous commit was on same X position
    // o  |
    // | /
    // o
    //
    // For horizontal orientation => same with commit Y position.
    if (graph.isVertical) {
        if (Math.abs(deltaY) > commitSpacing)
            alphaX = 0;
    }
    else {
        if (Math.abs(deltaX) > commitSpacing)
            alphaY = 0;
    }
    if (graph.reverseArrow) {
        alphaY *= -1;
        alphaX *= -1;
    }
    return Math.atan2(alphaY, alphaX);
}
//# sourceMappingURL=utils.js.map