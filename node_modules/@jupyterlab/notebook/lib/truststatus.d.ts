/// <reference types="react" />
import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { Notebook } from '.';
/**
 * The NotebookTrust status item.
 */
export declare class NotebookTrustStatus extends VDomRenderer<NotebookTrustStatus.Model> {
    /**
     * Construct a new status item.
     */
    constructor(translator?: ITranslator);
    /**
     * Render the NotebookTrust status item.
     */
    render(): JSX.Element | null;
    translator: ITranslator;
}
/**
 * A namespace for NotebookTrust statics.
 */
export declare namespace NotebookTrustStatus {
    /**
     * A VDomModel for the NotebookTrust status item.
     */
    class Model extends VDomModel {
        /**
         * The number of trusted cells in the current notebook.
         */
        get trustedCells(): number;
        /**
         * The total number of cells in the current notebook.
         */
        get totalCells(): number;
        /**
         * Whether the active cell is trusted.
         */
        get activeCellTrusted(): boolean;
        /**
         * The current notebook for the model.
         */
        get notebook(): Notebook | null;
        set notebook(model: Notebook | null);
        /**
         * When the notebook model changes, update the trust state.
         */
        private _onModelChanged;
        /**
         * When the active cell changes, update the trust state.
         */
        private _onActiveCellChanged;
        /**
         * Given a notebook model, figure out how many of the cells are trusted.
         */
        private _deriveCellTrustState;
        /**
         * Get the current state of the model.
         */
        private _getAllState;
        /**
         * Trigger a change in the renderer.
         */
        private _triggerChange;
        private _trustedCells;
        private _totalCells;
        private _activeCellTrusted;
        private _notebook;
    }
}
