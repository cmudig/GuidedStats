import { GitgraphCore, MergeStyle, arrowSvgPath, toSvgPath, Mode, Orientation, TemplateName, templateExtend, } from "@gitgraph/core";
import { createSvg, createG, createText, createCircle, createUse, createPath, createClipPath, createDefs, createForeignObject, } from "./svg-elements";
import { createBranchLabel, PADDING_X as BRANCH_LABEL_PADDING_X, PADDING_Y as BRANCH_LABEL_PADDING_Y, } from "./branch-label";
import { createTag, PADDING_X as TAG_PADDING_X } from "./tag";
import { createTooltip, PADDING as TOOLTIP_PADDING } from "./tooltip";
export { createGitgraph, Mode, Orientation, TemplateName, templateExtend, MergeStyle, };
function createGitgraph(graphContainer, options) {
    var commitsElements = {};
    // Store a map to replace commits y with the correct value,
    // including the message offset. Allows custom, flexible message height.
    // E.g. {20: 30} means for commit: y=20 -> y=30
    // Offset should be computed when graph is rendered (componentDidUpdate).
    var commitYWithOffsets = {};
    var shouldRecomputeOffsets = false;
    var lastData;
    var $commits;
    var commitMessagesX = 0;
    var $tooltip = null;
    // Create an `svg` context in which we'll render the graph.
    var svg = createSvg();
    adaptSvgOnUpdate(Boolean(options && options.responsive));
    graphContainer.appendChild(svg);
    if (options && options.responsive) {
        graphContainer.setAttribute("style", "display:inline-block; position: relative; width:100%; padding-bottom:100%; vertical-align:middle; overflow:hidden;");
    }
    // React on gitgraph updates to re-render the graph.
    var gitgraph = new GitgraphCore(options);
    gitgraph.subscribe(function (data) {
        shouldRecomputeOffsets = true;
        render(data);
    });
    // Return usable API for end-user.
    return gitgraph.getUserApi();
    function render(data) {
        // Reset before new rendering to flush previous state.
        commitsElements = {};
        var commits = data.commits, branchesPaths = data.branchesPaths;
        commitMessagesX = data.commitMessagesX;
        // Store data so we can re-render after offsets are computed.
        lastData = data;
        // Store $commits so we can compute offsets from actual height.
        $commits = renderCommits(commits);
        // Reset SVG with new content.
        svg.innerHTML = "";
        svg.appendChild(createG({
            // Translate graph left => left-most branch label is not cropped (horizontal)
            // Translate graph down => top-most commit tooltip is not cropped
            translate: { x: BRANCH_LABEL_PADDING_X, y: TOOLTIP_PADDING },
            children: [renderBranchesPaths(branchesPaths), $commits],
        }));
    }
    function adaptSvgOnUpdate(adaptToContainer) {
        var observer = new MutationObserver(function () {
            if (shouldRecomputeOffsets) {
                shouldRecomputeOffsets = false;
                computeOffsets();
                render(lastData);
            }
            else {
                positionCommitsElements();
                adaptGraphDimensions(adaptToContainer);
            }
        });
        observer.observe(svg, {
            attributes: false,
            // Listen to subtree changes to react when we append the tooltip.
            subtree: true,
            childList: true,
        });
        function computeOffsets() {
            var commits = Array.from($commits.children);
            var totalOffsetY = 0;
            // In VerticalReverse orientation, commits are in the same order in the DOM.
            var orientedCommits = gitgraph.orientation === Orientation.VerticalReverse
                ? commits
                : commits.reverse();
            commitYWithOffsets = orientedCommits.reduce(function (newOffsets, commit) {
                var commitY = parseInt(commit.getAttribute("transform").split(",")[1].slice(0, -1), 10);
                var firstForeignObject = commit.getElementsByTagName("foreignObject")[0];
                var customHtmlMessage = firstForeignObject && firstForeignObject.firstElementChild;
                newOffsets[commitY] = commitY + totalOffsetY;
                // Increment total offset after setting the offset
                // => offset next commits accordingly.
                totalOffsetY += getMessageHeight(customHtmlMessage);
                return newOffsets;
            }, {});
        }
        function positionCommitsElements() {
            if (gitgraph.isHorizontal) {
                // Elements don't appear on horizontal mode, yet.
                return;
            }
            var padding = 10;
            // Ensure commits elements (branch labels, message…) are well positionned.
            // It can't be done at render time since elements size is dynamic.
            Object.keys(commitsElements).forEach(function (commitHash) {
                var _a = commitsElements[commitHash], branchLabel = _a.branchLabel, tags = _a.tags, message = _a.message;
                // We'll store X position progressively and translate elements.
                var x = commitMessagesX;
                if (branchLabel) {
                    moveElement(branchLabel, x);
                    // BBox width misses box padding
                    // => they are set later, on branch label update.
                    // We would need to make branch label update happen before to solve it.
                    var branchLabelWidth = branchLabel.getBBox().width + 2 * BRANCH_LABEL_PADDING_X;
                    x += branchLabelWidth + padding;
                }
                tags.forEach(function (tag) {
                    moveElement(tag, x);
                    // BBox width misses box padding and offset
                    // => they are set later, on tag update.
                    // We would need to make tag update happen before to solve it.
                    var offset = parseFloat(tag.getAttribute("data-offset") || "0");
                    var tagWidth = tag.getBBox().width + 2 * TAG_PADDING_X + offset;
                    x += tagWidth + padding;
                });
                if (message) {
                    moveElement(message, x);
                }
            });
        }
        function adaptGraphDimensions(adaptToContainer) {
            var _a = svg.getBBox(), height = _a.height, width = _a.width;
            // FIXME: In horizontal mode, we mimic @gitgraph/react behavior
            // => it gets re-rendered after offsets are computed
            // => it applies paddings twice!
            //
            // It works… by chance. Technically, we should compute what would
            // *actually* go beyond the computed limits of the graph.
            var horizontalCustomOffset = 50;
            var verticalCustomOffset = 20;
            var widthOffset = gitgraph.isHorizontal
                ? horizontalCustomOffset
                : // Add `TOOLTIP_PADDING` so we don't crop the tooltip text.
                    // Add `BRANCH_LABEL_PADDING_X` so we don't cut branch label.
                    BRANCH_LABEL_PADDING_X + TOOLTIP_PADDING;
            var heightOffset = gitgraph.isHorizontal
                ? horizontalCustomOffset
                : // Add `TOOLTIP_PADDING` so we don't crop tooltip text
                    // Add `BRANCH_LABEL_PADDING_Y` so we don't crop branch label.
                    BRANCH_LABEL_PADDING_Y + TOOLTIP_PADDING + verticalCustomOffset;
            if (adaptToContainer) {
                svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
                svg.setAttribute("viewBox", "0 0 " + (width + widthOffset) + " " + (height + heightOffset));
            }
            else {
                svg.setAttribute("width", (width + widthOffset).toString());
                svg.setAttribute("height", (height + heightOffset).toString());
            }
        }
    }
    function moveElement(target, x) {
        var transform = target.getAttribute("transform") || "translate(0, 0)";
        target.setAttribute("transform", transform.replace(/translate\(([\d\.]+),/, "translate(" + x + ","));
    }
    function renderBranchesPaths(branchesPaths) {
        var offset = gitgraph.template.commit.dot.size;
        var isBezier = gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;
        var paths = Array.from(branchesPaths).map(function (_a) {
            var branch = _a[0], coordinates = _a[1];
            return createPath({
                d: toSvgPath(coordinates.map(function (coordinate) { return coordinate.map(getWithCommitOffset); }), isBezier, gitgraph.isVertical),
                fill: "none",
                stroke: branch.computedColor || "",
                strokeWidth: branch.style.lineWidth,
                translate: {
                    x: offset,
                    y: offset,
                },
            });
        });
        return createG({ children: paths });
    }
    function renderCommits(commits) {
        return createG({ children: commits.map(renderCommit) });
        function renderCommit(commit) {
            var _a = getWithCommitOffset(commit), x = _a.x, y = _a.y;
            return createG({
                translate: { x: x, y: y },
                children: [
                    renderDot(commit)
                ].concat(renderArrows(commit), [
                    createG({
                        translate: { x: -x, y: 0 },
                        children: [
                            renderMessage(commit)
                        ].concat(renderBranchLabels(commit), renderTags(commit)),
                    }),
                ]),
            });
        }
        function renderArrows(commit) {
            if (!gitgraph.template.arrow.size) {
                return [null];
            }
            var commitRadius = commit.style.dot.size;
            return commit.parents.map(function (parentHash) {
                var parent = commits.find(function (_a) {
                    var hash = _a.hash;
                    return hash === parentHash;
                });
                if (!parent)
                    return null;
                // Starting point, relative to commit
                var origin = gitgraph.reverseArrow
                    ? {
                        x: commitRadius + (parent.x - commit.x),
                        y: commitRadius + (parent.y - commit.y),
                    }
                    : { x: commitRadius, y: commitRadius };
                var path = createPath({
                    d: arrowSvgPath(gitgraph, parent, commit),
                    fill: gitgraph.template.arrow.color || "",
                });
                return createG({ translate: origin, children: [path] });
            });
        }
    }
    function renderMessage(commit) {
        if (!commit.style.message.display) {
            return null;
        }
        var message;
        if (commit.renderMessage) {
            message = createG({ children: [] });
            // Add message after observer is set up => react based on body height.
            // We might refactor it by including `onChildrenUpdate()` to `createG()`.
            adaptMessageBodyHeight(message);
            message.appendChild(commit.renderMessage(commit));
            setMessageRef(commit, message);
            return message;
        }
        var text = createText({
            content: commit.message,
            fill: commit.style.message.color || "",
            font: commit.style.message.font,
            onClick: commit.onMessageClick,
        });
        message = createG({
            translate: { x: 0, y: commit.style.dot.size },
            children: [text],
        });
        if (commit.body) {
            var body = createForeignObject({
                width: 600,
                translate: { x: 10, y: 0 },
                content: commit.body,
            });
            // Add message after observer is set up => react based on body height.
            // We might refactor it by including `onChildrenUpdate()` to `createG()`.
            adaptMessageBodyHeight(message);
            message.appendChild(body);
        }
        setMessageRef(commit, message);
        return message;
    }
    function adaptMessageBodyHeight(message) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (_a) {
                var target = _a.target;
                return setChildrenForeignObjectHeight(target);
            });
        });
        observer.observe(message, {
            attributes: false,
            subtree: false,
            childList: true,
        });
        function setChildrenForeignObjectHeight(node) {
            if (node.nodeName === "foreignObject") {
                // We have to access the first child's parentElement to retrieve
                // the Element instead of the Node => we can compute dimensions.
                var foreignObject = node.firstChild && node.firstChild.parentElement;
                if (!foreignObject)
                    return;
                // Force the height of the foreignObject (browser issue)
                foreignObject.setAttribute("height", getMessageHeight(foreignObject.firstElementChild).toString());
            }
            node.childNodes.forEach(setChildrenForeignObjectHeight);
        }
    }
    function renderBranchLabels(commit) {
        // @gitgraph/core could compute branch labels into commits directly.
        // That will make it easier to retrieve them, just like tags.
        var branches = Array.from(gitgraph.branches.values());
        return branches.map(function (branch) {
            if (!branch.style.label.display)
                return null;
            if (!gitgraph.branchLabelOnEveryCommit) {
                var commitHash = gitgraph.refs.getCommit(branch.name);
                if (commit.hash !== commitHash)
                    return null;
            }
            // For the moment, we don't handle multiple branch labels.
            // To do so, we'd need to reposition each of them appropriately.
            if (commit.branchToDisplay !== branch.name)
                return null;
            var branchLabel = branch.renderLabel
                ? branch.renderLabel(branch)
                : createBranchLabel(branch, commit);
            var branchLabelContainer;
            if (gitgraph.isVertical) {
                branchLabelContainer = createG({
                    children: [branchLabel],
                });
            }
            else {
                var commitDotSize = commit.style.dot.size * 2;
                var horizontalMarginTop = 10;
                branchLabelContainer = createG({
                    translate: { x: commit.x, y: commitDotSize + horizontalMarginTop },
                    children: [branchLabel],
                });
            }
            setBranchLabelRef(commit, branchLabelContainer);
            return branchLabelContainer;
        });
    }
    function renderTags(commit) {
        if (!commit.tags)
            return [];
        if (gitgraph.isHorizontal)
            return [];
        return commit.tags.map(function (tag) {
            var tagElement = tag.render
                ? tag.render(tag.name, tag.style)
                : createTag(tag);
            var tagContainer = createG({
                translate: { x: 0, y: commit.style.dot.size },
                children: [tagElement],
            });
            // `data-offset` is used to position tag element in `positionCommitsElements`.
            // => because when it's executed, tag offsets are not resolved yet
            tagContainer.setAttribute("data-offset", tag.style.pointerWidth.toString());
            setTagRef(commit, tagContainer);
            return tagContainer;
        });
    }
    function renderDot(commit) {
        if (commit.renderDot) {
            return commit.renderDot(commit);
        }
        /*
        In order to handle strokes, we need to do some complex stuff here… 😅
    
        Problem: strokes are drawn inside & outside the circle.
        But we want the stroke to be drawn inside only!
    
        The outside overlaps with other elements, as we expect the dot to have a fixed size. So we want to crop the outside part.
    
        Solution:
        1. Create the circle in a <defs>
        2. Define a clip path that references the circle
        3. Use the clip path, adding the stroke.
        4. Double stroke width as half of it will be clipped (the outside part).
    
        Ref.: https://stackoverflow.com/a/32162431/3911841
    
        P.S. there is a proposal for a stroke-alignment property,
        but it's still a W3C Draft ¯\_(ツ)_/¯
        https://svgwg.org/specs/strokes/#SpecifyingStrokeAlignment
      */
        var circleId = commit.hash;
        var circle = createCircle({
            id: circleId,
            radius: commit.style.dot.size,
            fill: commit.style.dot.color || "",
        });
        var clipPathId = "clip-" + commit.hash;
        var circleClipPath = createClipPath();
        circleClipPath.setAttribute("id", clipPathId);
        circleClipPath.appendChild(createUse(circleId));
        var useCirclePath = createUse(circleId);
        useCirclePath.setAttribute("clip-path", "url(#" + clipPathId + ")");
        useCirclePath.setAttribute("stroke", commit.style.dot.strokeColor || "");
        var strokeWidth = commit.style.dot.strokeWidth
            ? commit.style.dot.strokeWidth * 2
            : 0;
        useCirclePath.setAttribute("stroke-width", strokeWidth.toString());
        var dotText = commit.dotText
            ? createText({
                content: commit.dotText,
                font: commit.style.dot.font,
                anchor: "middle",
                translate: { x: commit.style.dot.size, y: commit.style.dot.size },
            })
            : null;
        return createG({
            onClick: commit.onClick,
            onMouseOver: function () {
                appendTooltipToGraph(commit);
                commit.onMouseOver();
            },
            onMouseOut: function () {
                if ($tooltip)
                    $tooltip.remove();
                commit.onMouseOut();
            },
            children: [createDefs([circle, circleClipPath]), useCirclePath, dotText],
        });
    }
    function appendTooltipToGraph(commit) {
        if (!svg.firstChild)
            return;
        if (gitgraph.isVertical && gitgraph.mode !== Mode.Compact)
            return;
        if (gitgraph.isVertical && !commit.style.hasTooltipInCompactMode)
            return;
        var tooltip = commit.renderTooltip
            ? commit.renderTooltip(commit)
            : createTooltip(commit);
        $tooltip = createG({
            translate: getWithCommitOffset(commit),
            children: [tooltip],
        });
        svg.firstChild.appendChild($tooltip);
    }
    function getWithCommitOffset(_a) {
        var x = _a.x, y = _a.y;
        return { x: x, y: commitYWithOffsets[y] || y };
    }
    function setBranchLabelRef(commit, branchLabels) {
        if (!commitsElements[commit.hashAbbrev]) {
            initCommitElements(commit);
        }
        commitsElements[commit.hashAbbrev].branchLabel = branchLabels;
    }
    function setMessageRef(commit, message) {
        if (!commitsElements[commit.hashAbbrev]) {
            initCommitElements(commit);
        }
        commitsElements[commit.hashAbbrev].message = message;
    }
    function setTagRef(commit, tag) {
        if (!commitsElements[commit.hashAbbrev]) {
            initCommitElements(commit);
        }
        commitsElements[commit.hashAbbrev].tags.push(tag);
    }
    function initCommitElements(commit) {
        commitsElements[commit.hashAbbrev] = {
            branchLabel: null,
            tags: [],
            message: null,
        };
    }
}
function getMessageHeight(message) {
    var messageHeight = 0;
    if (message) {
        var height = message.getBoundingClientRect().height;
        var marginTopInPx = window.getComputedStyle(message).marginTop || "0px";
        var marginTop = parseInt(marginTopInPx.replace("px", ""), 10);
        messageHeight = height + marginTop;
    }
    return messageHeight;
}
//# sourceMappingURL=gitgraph.js.map