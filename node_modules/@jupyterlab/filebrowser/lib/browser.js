// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { FilenameSearcher, showErrorMessage, Toolbar } from '@jupyterlab/apputils';
import { ServerConnection } from '@jupyterlab/services';
import { nullTranslator } from '@jupyterlab/translation';
import { PanelLayout, Widget } from '@lumino/widgets';
import { BreadCrumbs } from './crumbs';
import { DirListing } from './listing';
/**
 * The class name added to file browsers.
 */
const FILE_BROWSER_CLASS = 'jp-FileBrowser';
/**
 * The class name added to the filebrowser crumbs node.
 */
const CRUMBS_CLASS = 'jp-FileBrowser-crumbs';
/**
 * The class name added to the filebrowser filterbox node.
 */
const FILTERBOX_CLASS = 'jp-FileBrowser-filterBox';
/**
 * The class name added to the filebrowser toolbar node.
 */
const TOOLBAR_CLASS = 'jp-FileBrowser-toolbar';
/**
 * The class name added to the filebrowser listing node.
 */
const LISTING_CLASS = 'jp-FileBrowser-listing';
/**
 * A widget which hosts a file browser.
 *
 * The widget uses the Jupyter Contents API to retrieve contents,
 * and presents itself as a flat list of files and directories with
 * breadcrumbs.
 */
export class FileBrowser extends Widget {
    /**
     * Construct a new file browser.
     *
     * @param options - The file browser options.
     */
    constructor(options) {
        super();
        this._showLastModifiedColumn = true;
        this._useFuzzyFilter = true;
        this._showHiddenFiles = false;
        this.addClass(FILE_BROWSER_CLASS);
        this.id = options.id;
        const model = (this.model = options.model);
        const renderer = options.renderer;
        const translator = this.translator;
        model.connectionFailure.connect(this._onConnectionFailure, this);
        this.translator = options.translator || nullTranslator;
        this._manager = model.manager;
        this._trans = this.translator.load('jupyterlab');
        this.crumbs = new BreadCrumbs({ model, translator });
        this.toolbar = new Toolbar();
        // a11y
        this.toolbar.node.setAttribute('role', 'navigation');
        this.toolbar.node.setAttribute('aria-label', this._trans.__('file browser'));
        this._directoryPending = false;
        this.listing = this.createDirListing({
            model,
            renderer,
            translator: this.translator
        });
        this._filenameSearcher = FilenameSearcher({
            updateFilter: (filterFn, query) => {
                this.listing.model.setFilter(value => {
                    return filterFn(value.name.toLowerCase());
                });
            },
            useFuzzyFilter: this._useFuzzyFilter,
            placeholder: this._trans.__('Filter files by name')
        });
        this.crumbs.addClass(CRUMBS_CLASS);
        this.toolbar.addClass(TOOLBAR_CLASS);
        this._filenameSearcher.addClass(FILTERBOX_CLASS);
        this.listing.addClass(LISTING_CLASS);
        this.layout = new PanelLayout();
        this.layout.addWidget(this.toolbar);
        this.layout.addWidget(this._filenameSearcher);
        this.layout.addWidget(this.crumbs);
        this.layout.addWidget(this.listing);
        if (options.restore !== false) {
            void model.restore(this.id);
        }
    }
    /**
     * Whether to show active file in file browser
     */
    get navigateToCurrentDirectory() {
        return this._navigateToCurrentDirectory;
    }
    set navigateToCurrentDirectory(value) {
        this._navigateToCurrentDirectory = value;
    }
    /**
     * Whether to show the last modified column
     */
    get showLastModifiedColumn() {
        return this._showLastModifiedColumn;
    }
    set showLastModifiedColumn(value) {
        if (this.listing.setColumnVisibility) {
            this.listing.setColumnVisibility('last_modified', value);
            this._showLastModifiedColumn = value;
        }
        else {
            console.warn('Listing does not support toggling column visibility');
        }
    }
    /**
     * Whether to use fuzzy filtering on file names.
     */
    set useFuzzyFilter(value) {
        this._useFuzzyFilter = value;
        this._filenameSearcher = FilenameSearcher({
            updateFilter: (filterFn, query) => {
                this.listing.model.setFilter(value => {
                    return filterFn(value.name.toLowerCase());
                });
            },
            useFuzzyFilter: this._useFuzzyFilter,
            placeholder: this._trans.__('Filter files by name'),
            forceRefresh: true
        });
        this._filenameSearcher.addClass(FILTERBOX_CLASS);
        this.layout.removeWidget(this._filenameSearcher);
        this.layout.removeWidget(this.crumbs);
        this.layout.removeWidget(this.listing);
        this.layout.addWidget(this._filenameSearcher);
        this.layout.addWidget(this.crumbs);
        this.layout.addWidget(this.listing);
    }
    /**
     * Whether to show hidden files
     */
    get showHiddenFiles() {
        return this._showHiddenFiles;
    }
    set showHiddenFiles(value) {
        this.model.showHiddenFiles(value);
        this._showHiddenFiles = value;
    }
    /**
     * Create an iterator over the listing's selected items.
     *
     * @returns A new iterator over the listing's selected items.
     */
    selectedItems() {
        return this.listing.selectedItems();
    }
    /**
     * Select an item by name.
     *
     * @param name - The name of the item to select.
     */
    async selectItemByName(name) {
        await this.listing.selectItemByName(name);
    }
    clearSelectedItems() {
        this.listing.clearSelectedItems();
    }
    /**
     * Rename the first currently selected item.
     *
     * @returns A promise that resolves with the new name of the item.
     */
    rename() {
        return this.listing.rename();
    }
    /**
     * Cut the selected items.
     */
    cut() {
        this.listing.cut();
    }
    /**
     * Copy the selected items.
     */
    copy() {
        this.listing.copy();
    }
    /**
     * Paste the items from the clipboard.
     *
     * @returns A promise that resolves when the operation is complete.
     */
    paste() {
        return this.listing.paste();
    }
    /**
     * Create a new directory
     */
    createNewDirectory() {
        if (this._directoryPending === true) {
            return;
        }
        this._directoryPending = true;
        // TODO: We should provide a hook into when the
        // directory is done being created. This probably
        // means storing a pendingDirectory promise and
        // returning that if there is already a directory
        // request.
        void this._manager
            .newUntitled({
            path: this.model.path,
            type: 'directory'
        })
            .then(async (model) => {
            await this.listing.selectItemByName(model.name);
            await this.rename();
            this._directoryPending = false;
        })
            .catch(err => {
            void showErrorMessage(this._trans.__('Error'), err);
            this._directoryPending = false;
        });
    }
    /**
     * Create a new file
     */
    createNewFile(options) {
        if (this._filePending === true) {
            return;
        }
        this._filePending = true;
        // TODO: We should provide a hook into when the
        // file is done being created. This probably
        // means storing a pendingFile promise and
        // returning that if there is already a file
        // request.
        void this._manager
            .newUntitled({
            path: this.model.path,
            type: 'file',
            ext: options.ext
        })
            .then(async (model) => {
            await this.listing.selectItemByName(model.name);
            await this.rename();
            this._filePending = false;
        })
            .catch(err => {
            void showErrorMessage(this._trans.__('Error'), err);
            this._filePending = false;
        });
    }
    /**
     * Delete the currently selected item(s).
     *
     * @returns A promise that resolves when the operation is complete.
     */
    delete() {
        return this.listing.delete();
    }
    /**
     * Duplicate the currently selected item(s).
     *
     * @returns A promise that resolves when the operation is complete.
     */
    duplicate() {
        return this.listing.duplicate();
    }
    /**
     * Download the currently selected item(s).
     */
    download() {
        return this.listing.download();
    }
    /**
     * Shut down kernels on the applicable currently selected items.
     *
     * @returns A promise that resolves when the operation is complete.
     */
    shutdownKernels() {
        return this.listing.shutdownKernels();
    }
    /**
     * Select next item.
     */
    selectNext() {
        this.listing.selectNext();
    }
    /**
     * Select previous item.
     */
    selectPrevious() {
        this.listing.selectPrevious();
    }
    /**
     * Find a model given a click.
     *
     * @param event - The mouse event.
     *
     * @returns The model for the selected file.
     */
    modelForClick(event) {
        return this.listing.modelForClick(event);
    }
    /**
     * Create the underlying DirListing instance.
     *
     * @param options - The DirListing constructor options.
     *
     * @returns The created DirListing instance.
     */
    createDirListing(options) {
        return new DirListing(options);
    }
    /**
     * Handle a connection lost signal from the model.
     */
    _onConnectionFailure(sender, args) {
        if (args instanceof ServerConnection.ResponseError &&
            args.response.status === 404) {
            const title = this._trans.__('Directory not found');
            args.message = this._trans.__('Directory not found: "%1"', this.model.path);
            void showErrorMessage(title, args);
        }
    }
}
//# sourceMappingURL=browser.js.map