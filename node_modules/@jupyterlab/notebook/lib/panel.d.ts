import { ISessionContext, Printing } from '@jupyterlab/apputils';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { ITranslator } from '@jupyterlab/translation';
import { Token } from '@lumino/coreutils';
import { INotebookModel } from './model';
import { Notebook, StaticNotebook } from './widget';
/**
 * A widget that hosts a notebook toolbar and content area.
 *
 * #### Notes
 * The widget keeps the document metadata in sync with the current
 * kernel on the context.
 */
export declare class NotebookPanel extends DocumentWidget<Notebook, INotebookModel> {
    /**
     * Construct a new notebook panel.
     */
    constructor(options: DocumentWidget.IOptions<Notebook, INotebookModel>);
    _onSave(sender: DocumentRegistry.Context, state: DocumentRegistry.SaveState): void;
    /**
     * The session context used by the panel.
     */
    get sessionContext(): ISessionContext;
    /**
     * The model for the widget.
     */
    get model(): INotebookModel | null;
    /**
     * Update the options for the current notebook panel.
     *
     * @param config new options to set
     */
    setConfig(config: NotebookPanel.IConfig): void;
    /**
     * Set URI fragment identifier.
     */
    setFragment(fragment: string): void;
    /**
     * Dispose of the resources used by the widget.
     */
    dispose(): void;
    /**
     * Prints the notebook by converting to HTML with nbconvert.
     */
    [Printing.symbol](): () => Promise<void>;
    /**
     * Handle a fully rendered signal notebook.
     */
    private _onFullyRendered;
    /**
     * Handle a change in the kernel by updating the document metadata.
     */
    private _onKernelChanged;
    private _onSessionStatusChanged;
    /**
     * Update the kernel language.
     */
    private _updateLanguage;
    /**
     * Update the kernel spec.
     */
    private _updateSpec;
    translator: ITranslator;
    private _trans;
    /**
     * Whether we are currently in a series of autorestarts we have already
     * notified the user about.
     */
    private _autorestarting;
}
/**
 * A namespace for `NotebookPanel` statics.
 */
export declare namespace NotebookPanel {
    /**
     * Notebook config interface for NotebookPanel
     */
    interface IConfig {
        /**
         * A config object for cell editors
         */
        editorConfig: StaticNotebook.IEditorConfig;
        /**
         * A config object for notebook widget
         */
        notebookConfig: StaticNotebook.INotebookConfig;
        /**
         * Whether to shut down the kernel when closing the panel or not
         */
        kernelShutdown: boolean;
    }
    /**
     * A content factory interface for NotebookPanel.
     */
    interface IContentFactory extends Notebook.IContentFactory {
        /**
         * Create a new content area for the panel.
         */
        createNotebook(options: Notebook.IOptions): Notebook;
    }
    /**
     * The default implementation of an `IContentFactory`.
     */
    class ContentFactory extends Notebook.ContentFactory implements IContentFactory {
        /**
         * Create a new content area for the panel.
         */
        createNotebook(options: Notebook.IOptions): Notebook;
    }
    /**
     * Default content factory for the notebook panel.
     */
    const defaultContentFactory: ContentFactory;
    /**
     * The notebook renderer token.
     */
    const IContentFactory: Token<IContentFactory>;
}
