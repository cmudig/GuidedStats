import { ISessionContext } from '@jupyterlab/apputils';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';
import { IObservableJSON, IObservableMap } from '@jupyterlab/observables';
import { IOutputPrompt, IStdin, OutputArea, Stdin } from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { KernelMessage } from '@jupyterlab/services';
import { JSONObject, JSONValue, PartialJSONValue } from '@lumino/coreutils';
import { Message } from '@lumino/messaging';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { ICellFooter, ICellHeader } from './headerfooter';
import { IInputPrompt, InputArea } from './inputarea';
import { IAttachmentsCellModel, ICellModel, ICodeCellModel, IMarkdownCellModel, IRawCellModel } from './model';
export declare const MARKDOWN_HEADING_COLLAPSED = "jp-MarkdownHeadingCollapsed";
/** ****************************************************************************
 * Cell
 ******************************************************************************/
/**
 * A base cell widget.
 */
export declare class Cell<T extends ICellModel = ICellModel> extends Widget {
    /**
     * Construct a new base cell widget.
     */
    constructor(options: Cell.IOptions<T>);
    /**
     * Initialize view state from model.
     *
     * #### Notes
     * Should be called after construction. For convenience, returns this, so it
     * can be chained in the construction, like `new Foo().initializeState();`
     */
    initializeState(): this;
    /**
     * The content factory used by the widget.
     */
    readonly contentFactory: Cell.IContentFactory;
    /**
     * Signal to indicate that widget has changed visibly (in size, in type, etc)
     */
    get displayChanged(): ISignal<this, void>;
    /**
     * Get the prompt node used by the cell.
     */
    get promptNode(): HTMLElement;
    /**
     * Get the CodeEditorWrapper used by the cell.
     */
    get editorWidget(): CodeEditorWrapper;
    /**
     * Get the CodeEditor used by the cell.
     */
    get editor(): CodeEditor.IEditor;
    /**
     * Get the model used by the cell.
     */
    get model(): T;
    /**
     * Get the input area for the cell.
     */
    get inputArea(): InputArea;
    /**
     * The read only state of the cell.
     */
    get readOnly(): boolean;
    set readOnly(value: boolean);
    /**
     * Save view editable state to model
     */
    saveEditableState(): void;
    /**
     * Load view editable state from model.
     */
    loadEditableState(): void;
    /**
     * A promise that resolves when the widget renders for the first time.
     */
    get ready(): Promise<void>;
    /**
     * Set the prompt for the widget.
     */
    setPrompt(value: string): void;
    /**
     * The view state of input being hidden.
     */
    get inputHidden(): boolean;
    set inputHidden(value: boolean);
    /**
     * Save view collapse state to model
     */
    saveCollapseState(): void;
    /**
     * Revert view collapse state from model.
     */
    loadCollapseState(): void;
    /**
     * Handle the input being hidden.
     *
     * #### Notes
     * This is called by the `inputHidden` setter so that subclasses
     * can perform actions upon the input being hidden without accessing
     * private state.
     */
    protected handleInputHidden(value: boolean): void;
    /**
     * Whether to sync the collapse state to the cell model.
     */
    get syncCollapse(): boolean;
    set syncCollapse(value: boolean);
    /**
     * Whether to sync the editable state to the cell model.
     */
    get syncEditable(): boolean;
    set syncEditable(value: boolean);
    /**
     * Clone the cell, using the same model.
     */
    clone(): Cell<T>;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Handle `after-attach` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle `fit-request` messages.
     */
    protected onFitRequest(msg: Message): void;
    /**
     * Handle `resize` messages.
     */
    protected onResize(msg: Widget.ResizeMessage): void;
    /**
     * Handle `update-request` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle changes in the metadata.
     */
    protected onMetadataChanged(model: IObservableJSON, args: IObservableMap.IChangedArgs<PartialJSONValue | undefined>): void;
    protected _displayChanged: Signal<this, void>;
    private _readOnly;
    private _model;
    private _inputHidden;
    private _input;
    private _inputWrapper;
    private _inputPlaceholder;
    private _syncCollapse;
    private _syncEditable;
    private _resizeDebouncer;
}
/**
 * The namespace for the `Cell` class statics.
 */
export declare namespace Cell {
    /**
     * An options object for initializing a cell widget.
     */
    interface IOptions<T extends ICellModel> {
        /**
         * The model used by the cell.
         */
        model: T;
        /**
         * The factory object for customizable cell children.
         */
        contentFactory?: IContentFactory;
        /**
         * The configuration options for the text editor widget.
         */
        editorConfig?: Partial<CodeEditor.IConfig>;
        /**
         * Whether to send an update request to the editor when it is shown.
         */
        updateEditorOnShow?: boolean;
        /**
         * The maximum number of output items to display in cell output.
         */
        maxNumberOutputs?: number;
        /**
         * Whether this cell is a placeholder for future rendering.
         */
        placeholder?: boolean;
    }
    /**
     * The factory object for customizable cell children.
     *
     * This is used to allow users of cells to customize child content.
     *
     * This inherits from `OutputArea.IContentFactory` to avoid needless nesting and
     * provide a single factory object for all notebook/cell/outputarea related
     * widgets.
     */
    interface IContentFactory extends OutputArea.IContentFactory, InputArea.IContentFactory {
        /**
         * Create a new cell header for the parent widget.
         */
        createCellHeader(): ICellHeader;
        /**
         * Create a new cell header for the parent widget.
         */
        createCellFooter(): ICellFooter;
    }
    /**
     * The default implementation of an `IContentFactory`.
     *
     * This includes a CodeMirror editor factory to make it easy to use out of the box.
     */
    class ContentFactory implements IContentFactory {
        /**
         * Create a content factory for a cell.
         */
        constructor(options?: ContentFactory.IOptions);
        /**
         * The readonly editor factory that create code editors
         */
        get editorFactory(): CodeEditor.Factory;
        /**
         * Create a new cell header for the parent widget.
         */
        createCellHeader(): ICellHeader;
        /**
         * Create a new cell header for the parent widget.
         */
        createCellFooter(): ICellFooter;
        /**
         * Create an input prompt.
         */
        createInputPrompt(): IInputPrompt;
        /**
         * Create the output prompt for the widget.
         */
        createOutputPrompt(): IOutputPrompt;
        /**
         * Create an stdin widget.
         */
        createStdin(options: Stdin.IOptions): IStdin;
        private _editorFactory;
    }
    /**
     * A namespace for cell content factory.
     */
    namespace ContentFactory {
        /**
         * Options for the content factory.
         */
        interface IOptions {
            /**
             * The editor factory used by the content factory.
             *
             * If this is not passed, a default CodeMirror editor factory
             * will be used.
             */
            editorFactory?: CodeEditor.Factory;
        }
    }
    /**
     * The default content factory for cells.
     */
    const defaultContentFactory: ContentFactory;
}
/** ****************************************************************************
 * CodeCell
 ******************************************************************************/
/**
 * A widget for a code cell.
 */
export declare class CodeCell extends Cell<ICodeCellModel> {
    /**
     * Construct a code cell widget.
     */
    constructor(options: CodeCell.IOptions);
    /**
     * Initialize view state from model.
     *
     * #### Notes
     * Should be called after construction. For convenience, returns this, so it
     * can be chained in the construction, like `new Foo().initializeState();`
     */
    initializeState(): this;
    /**
     * Get the output area for the cell.
     */
    get outputArea(): OutputArea;
    /**
     * The view state of output being collapsed.
     */
    get outputHidden(): boolean;
    set outputHidden(value: boolean);
    /**
     * Save view collapse state to model
     */
    saveCollapseState(): void;
    /**
     * Revert view collapse state from model.
     *
     * We consider the `collapsed` metadata key as the source of truth for outputs
     * being hidden.
     */
    loadCollapseState(): void;
    /**
     * Whether the output is in a scrolled state?
     */
    get outputsScrolled(): boolean;
    set outputsScrolled(value: boolean);
    /**
     * Save view collapse state to model
     */
    saveScrolledState(): void;
    /**
     * Revert view collapse state from model.
     */
    loadScrolledState(): void;
    /**
     * Whether to sync the scrolled state to the cell model.
     */
    get syncScrolled(): boolean;
    set syncScrolled(value: boolean);
    /**
     * Handle the input being hidden.
     *
     * #### Notes
     * This method is called by the case cell implementation and is
     * subclasses here so the code cell can watch to see when input
     * is hidden without accessing private state.
     */
    protected handleInputHidden(value: boolean): void;
    /**
     * Clone the cell, using the same model.
     */
    clone(): CodeCell;
    /**
     * Clone the OutputArea alone, returning a simplified output area, using the same model.
     */
    cloneOutputArea(): OutputArea;
    /**
     * Dispose of the resources used by the widget.
     */
    dispose(): void;
    /**
     * Handle changes in the model.
     */
    protected onStateChanged(model: ICellModel, args: IChangedArgs<any>): void;
    /**
     * Handle changes in the metadata.
     */
    protected onMetadataChanged(model: IObservableJSON, args: IObservableMap.IChangedArgs<JSONValue>): void;
    /**
     * Handle changes in the number of outputs in the output area.
     */
    private _outputLengthHandler;
    private _rendermime;
    private _outputHidden;
    private _outputsScrolled;
    private _outputWrapper;
    private _outputPlaceholder;
    private _output;
    private _syncScrolled;
    private _savingMetadata;
}
/**
 * The namespace for the `CodeCell` class statics.
 */
export declare namespace CodeCell {
    /**
     * An options object for initializing a base cell widget.
     */
    interface IOptions extends Cell.IOptions<ICodeCellModel> {
        /**
         * The mime renderer for the cell widget.
         */
        rendermime: IRenderMimeRegistry;
    }
    /**
     * Execute a cell given a client session.
     */
    function execute(cell: CodeCell, sessionContext: ISessionContext, metadata?: JSONObject): Promise<KernelMessage.IExecuteReplyMsg | void>;
}
/**
 * `AttachmentsCell` - A base class for a cell widget that allows
 *  attachments to be drag/drop'd or pasted onto it
 */
export declare abstract class AttachmentsCell<T extends IAttachmentsCellModel> extends Cell<T> {
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Modify the cell source to include a reference to the attachment.
     */
    protected abstract updateCellSourceWithAttachment(attachmentName: string, URI?: string): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * A message handler invoked on a `'before-detach'`
     * message
     */
    protected onBeforeDetach(msg: Message): void;
    private _evtDragOver;
    /**
     * Handle the `paste` event for the widget
     */
    private _evtPaste;
    /**
     * Handle the `drop` event for the widget
     */
    private _evtNativeDrop;
    /**
     * Handle the `'lm-drop'` event for the widget.
     */
    private _evtDrop;
    /**
     * Attaches all DataTransferItems (obtained from
     * clipboard or native drop events) to the cell
     */
    private _attachFiles;
    /**
     * Takes in a file object and adds it to
     * the cell attachments
     */
    private _attachFile;
    /**
     * Generates a unique URI for a file
     * while preserving the file extension.
     */
    private _generateURI;
}
/** ****************************************************************************
 * MarkdownCell
 ******************************************************************************/
/**
 * A widget for a Markdown cell.
 *
 * #### Notes
 * Things get complicated if we want the rendered text to update
 * any time the text changes, the text editor model changes,
 * or the input area model changes.  We don't support automatically
 * updating the rendered text in all of these cases.
 */
export declare class MarkdownCell extends AttachmentsCell<IMarkdownCellModel> {
    /**
     * Construct a Markdown cell widget.
     */
    constructor(options: MarkdownCell.IOptions);
    /**
     * A promise that resolves when the widget renders for the first time.
     */
    get ready(): Promise<void>;
    /**
     * Text that represents the heading if cell is a heading.
     * Returns empty string if not a heading.
     */
    get headingInfo(): {
        text: string;
        level: number;
    };
    get headingCollapsed(): boolean;
    set headingCollapsed(value: boolean);
    get numberChildNodes(): number;
    set numberChildNodes(value: number);
    get toggleCollapsedSignal(): Signal<this, boolean>;
    /**
     * Whether the cell is rendered.
     */
    get rendered(): boolean;
    set rendered(value: boolean);
    get showEditorForReadOnly(): boolean;
    set showEditorForReadOnly(value: boolean);
    dispose(): void;
    protected maybeCreateCollapseButton(): void;
    protected maybeCreateOrUpdateExpandButton(): void;
    /**
     * Render the collapse button for heading cells,
     * and for collapsed heading cells render the "expand hidden cells"
     * button.
     */
    protected renderCollapseButtons(widget: Widget): void;
    /**
     * Render an input instead of the text editor.
     */
    protected renderInput(widget: Widget): void;
    /**
     * Show the text editor instead of rendered input.
     */
    protected showEditor(): void;
    protected onUpdateRequest(msg: Message): void;
    /**
     * Modify the cell source to include a reference to the attachment.
     */
    protected updateCellSourceWithAttachment(attachmentName: string, URI?: string): void;
    /**
     * Handle the rendered state.
     */
    private _handleRendered;
    /**
     * Update the rendered input.
     */
    private _updateRenderedInput;
    /**
     * Clone the cell, using the same model.
     */
    clone(): MarkdownCell;
    private _monitor;
    private _numberChildNodes;
    private _headingCollapsed;
    private _toggleCollapsedSignal;
    private _renderer;
    private _rendermime;
    private _rendered;
    private _prevText;
    private _ready;
    private _showEditorForReadOnlyMarkdown;
}
/**
 * The namespace for the `CodeCell` class statics.
 */
export declare namespace MarkdownCell {
    /**
     * An options object for initializing a base cell widget.
     */
    interface IOptions extends Cell.IOptions<IMarkdownCellModel> {
        /**
         * The mime renderer for the cell widget.
         */
        rendermime: IRenderMimeRegistry;
        /**
         * Show editor for read-only Markdown cells.
         */
        showEditorForReadOnlyMarkdown?: boolean;
    }
    /**
     * Default value for showEditorForReadOnlyMarkdown.
     */
    const defaultShowEditorForReadOnlyMarkdown = true;
}
/** ****************************************************************************
 * RawCell
 ******************************************************************************/
/**
 * A widget for a raw cell.
 */
export declare class RawCell extends Cell<IRawCellModel> {
    /**
     * Construct a raw cell widget.
     */
    constructor(options: RawCell.IOptions);
    /**
     * Clone the cell, using the same model.
     */
    clone(): RawCell;
}
/**
 * The namespace for the `RawCell` class statics.
 */
export declare namespace RawCell {
    /**
     * An options object for initializing a base cell widget.
     */
    interface IOptions extends Cell.IOptions<IRawCellModel> {
    }
}
