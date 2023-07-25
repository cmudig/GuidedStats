import { Toolbar } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';
import { ITranslator } from '@jupyterlab/translation';
import { IIterator } from '@lumino/algorithm';
import { PanelLayout, Widget } from '@lumino/widgets';
import { BreadCrumbs } from './crumbs';
import { DirListing } from './listing';
import { FilterFileBrowserModel } from './model';
/**
 * A widget which hosts a file browser.
 *
 * The widget uses the Jupyter Contents API to retrieve contents,
 * and presents itself as a flat list of files and directories with
 * breadcrumbs.
 */
export declare class FileBrowser extends Widget {
    /**
     * Construct a new file browser.
     *
     * @param options - The file browser options.
     */
    constructor(options: FileBrowser.IOptions);
    /**
     * The model used by the file browser.
     */
    readonly model: FilterFileBrowserModel;
    /**
     * The toolbar used by the file browser.
     */
    readonly toolbar: Toolbar<Widget>;
    /**
     * Override Widget.layout with a more specific PanelLayout type.
     */
    layout: PanelLayout;
    /**
     * Whether to show active file in file browser
     */
    get navigateToCurrentDirectory(): boolean;
    set navigateToCurrentDirectory(value: boolean);
    /**
     * Whether to show the last modified column
     */
    get showLastModifiedColumn(): boolean;
    set showLastModifiedColumn(value: boolean);
    /**
     * Whether to use fuzzy filtering on file names.
     */
    set useFuzzyFilter(value: boolean);
    /**
     * Whether to show hidden files
     */
    get showHiddenFiles(): boolean;
    set showHiddenFiles(value: boolean);
    /**
     * Create an iterator over the listing's selected items.
     *
     * @returns A new iterator over the listing's selected items.
     */
    selectedItems(): IIterator<Contents.IModel>;
    /**
     * Select an item by name.
     *
     * @param name - The name of the item to select.
     */
    selectItemByName(name: string): Promise<void>;
    clearSelectedItems(): void;
    /**
     * Rename the first currently selected item.
     *
     * @returns A promise that resolves with the new name of the item.
     */
    rename(): Promise<string>;
    /**
     * Cut the selected items.
     */
    cut(): void;
    /**
     * Copy the selected items.
     */
    copy(): void;
    /**
     * Paste the items from the clipboard.
     *
     * @returns A promise that resolves when the operation is complete.
     */
    paste(): Promise<void>;
    /**
     * Create a new directory
     */
    createNewDirectory(): void;
    /**
     * Create a new file
     */
    createNewFile(options: FileBrowser.IFileOptions): void;
    /**
     * Delete the currently selected item(s).
     *
     * @returns A promise that resolves when the operation is complete.
     */
    delete(): Promise<void>;
    /**
     * Duplicate the currently selected item(s).
     *
     * @returns A promise that resolves when the operation is complete.
     */
    duplicate(): Promise<void>;
    /**
     * Download the currently selected item(s).
     */
    download(): Promise<void>;
    /**
     * Shut down kernels on the applicable currently selected items.
     *
     * @returns A promise that resolves when the operation is complete.
     */
    shutdownKernels(): Promise<void>;
    /**
     * Select next item.
     */
    selectNext(): void;
    /**
     * Select previous item.
     */
    selectPrevious(): void;
    /**
     * Find a model given a click.
     *
     * @param event - The mouse event.
     *
     * @returns The model for the selected file.
     */
    modelForClick(event: MouseEvent): Contents.IModel | undefined;
    /**
     * Create the underlying DirListing instance.
     *
     * @param options - The DirListing constructor options.
     *
     * @returns The created DirListing instance.
     */
    protected createDirListing(options: DirListing.IOptions): DirListing;
    protected translator: ITranslator;
    /**
     * Handle a connection lost signal from the model.
     */
    private _onConnectionFailure;
    protected listing: DirListing;
    protected crumbs: BreadCrumbs;
    private _trans;
    private _filenameSearcher;
    private _manager;
    private _directoryPending;
    private _filePending;
    private _navigateToCurrentDirectory;
    private _showLastModifiedColumn;
    private _useFuzzyFilter;
    private _showHiddenFiles;
}
/**
 * The namespace for the `FileBrowser` class statics.
 */
export declare namespace FileBrowser {
    /**
     * An options object for initializing a file browser widget.
     */
    interface IOptions {
        /**
         * The widget/DOM id of the file browser.
         */
        id: string;
        /**
         * A file browser model instance.
         */
        model: FilterFileBrowserModel;
        /**
         * An optional renderer for the directory listing area.
         *
         * The default is a shared instance of `DirListing.Renderer`.
         */
        renderer?: DirListing.IRenderer;
        /**
         * Whether a file browser automatically restores state when instantiated.
         * The default is `true`.
         *
         * #### Notes
         * The file browser model will need to be restored manually for the file
         * browser to be able to save its state.
         */
        restore?: boolean;
        /**
         * The application language translator.
         */
        translator?: ITranslator;
    }
    /**
     * An options object for creating a file.
     */
    interface IFileOptions {
        /**
         * The file extension.
         */
        ext: string;
    }
}
