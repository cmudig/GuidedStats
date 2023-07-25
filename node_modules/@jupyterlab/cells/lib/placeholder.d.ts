import * as React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
/**
 * An abstract base class for placeholders
 *
 * ### Notes
 * A placeholder is the element that is shown when input/output
 * is hidden.
 */
export declare abstract class Placeholder extends ReactWidget {
    /**
     * Construct a new placeholder.
     */
    constructor(callback: (e: React.MouseEvent<HTMLDivElement>) => void);
    /**
     * Handle the click event.
     */
    protected handleClick(e: React.MouseEvent<HTMLDivElement>): void;
    private _callback;
}
/**
 * The input placeholder class.
 */
export declare class InputPlaceholder extends Placeholder {
    /**
     * Construct a new input placeholder.
     */
    constructor(callback: (e: React.MouseEvent<HTMLDivElement>) => void);
    /**
     * Render the input placeholder using the virtual DOM.
     */
    protected render(): React.ReactElement<any>[];
}
/**
 * The output placeholder class.
 */
export declare class OutputPlaceholder extends Placeholder {
    /**
     * Construct a new output placeholder.
     */
    constructor(callback: (e: React.MouseEvent<HTMLDivElement>) => void);
    /**
     * Render the output placeholder using the virtual DOM.
     */
    protected render(): React.ReactElement<any>[];
}
