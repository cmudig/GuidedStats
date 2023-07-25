/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
import * as React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { ellipsesIcon } from '@jupyterlab/ui-components';
/**
 * The CSS class added to placeholders.
 */
const PLACEHOLDER_CLASS = 'jp-Placeholder';
/**
 * The CSS classes added to input placeholder prompts.
 */
const INPUT_PROMPT_CLASS = 'jp-Placeholder-prompt jp-InputPrompt';
/**
 * The CSS classes added to output placeholder prompts.
 */
const OUTPUT_PROMPT_CLASS = 'jp-Placeholder-prompt jp-OutputPrompt';
/**
 * The CSS class added to placeholder content.
 */
const CONTENT_CLASS = 'jp-Placeholder-content';
/**
 * The CSS class added to input placeholders.
 */
const INPUT_PLACEHOLDER_CLASS = 'jp-InputPlaceholder';
/**
 * The CSS class added to output placeholders.
 */
const OUTPUT_PLACEHOLDER_CLASS = 'jp-OutputPlaceholder';
/**
 * An abstract base class for placeholders
 *
 * ### Notes
 * A placeholder is the element that is shown when input/output
 * is hidden.
 */
export class Placeholder extends ReactWidget {
    /**
     * Construct a new placeholder.
     */
    constructor(callback) {
        super();
        this.addClass(PLACEHOLDER_CLASS);
        this._callback = callback;
    }
    /**
     * Handle the click event.
     */
    handleClick(e) {
        const callback = this._callback;
        callback(e);
    }
}
/**
 * The input placeholder class.
 */
export class InputPlaceholder extends Placeholder {
    /**
     * Construct a new input placeholder.
     */
    constructor(callback) {
        super(callback);
        this.addClass(INPUT_PLACEHOLDER_CLASS);
    }
    /**
     * Render the input placeholder using the virtual DOM.
     */
    render() {
        return [
            React.createElement("div", { className: INPUT_PROMPT_CLASS, key: "input" }),
            React.createElement("div", { className: CONTENT_CLASS, onClick: e => this.handleClick(e), key: "content" },
                React.createElement(ellipsesIcon.react, { className: "jp-MoreHorizIcon", elementPosition: "center", height: "auto", width: "32px" }))
        ];
    }
}
/**
 * The output placeholder class.
 */
export class OutputPlaceholder extends Placeholder {
    /**
     * Construct a new output placeholder.
     */
    constructor(callback) {
        super(callback);
        this.addClass(OUTPUT_PLACEHOLDER_CLASS);
    }
    /**
     * Render the output placeholder using the virtual DOM.
     */
    render() {
        return [
            React.createElement("div", { className: OUTPUT_PROMPT_CLASS, key: "output" }),
            React.createElement("div", { className: CONTENT_CLASS, onClick: e => this.handleClick(e), key: "content" },
                React.createElement(ellipsesIcon.react, { className: "jp-MoreHorizIcon", elementPosition: "center", height: "auto", width: "32px" }))
        ];
    }
}
//# sourceMappingURL=placeholder.js.map