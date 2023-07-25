// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { sessionContextDialogs } from '@jupyterlab/apputils';
import { ABCWidgetFactory } from '@jupyterlab/docregistry';
import { ToolbarItems } from './default-toolbar';
import { NotebookPanel } from './panel';
import { StaticNotebook } from './widget';
/**
 * A widget factory for notebook panels.
 */
export class NotebookWidgetFactory extends ABCWidgetFactory {
    /**
     * Construct a new notebook widget factory.
     *
     * @param options - The options used to construct the factory.
     */
    constructor(options) {
        super(options);
        this.rendermime = options.rendermime;
        this.contentFactory =
            options.contentFactory || NotebookPanel.defaultContentFactory;
        this.mimeTypeService = options.mimeTypeService;
        this._editorConfig =
            options.editorConfig || StaticNotebook.defaultEditorConfig;
        this._notebookConfig =
            options.notebookConfig || StaticNotebook.defaultNotebookConfig;
        this._sessionDialogs = options.sessionDialogs || sessionContextDialogs;
    }
    /**
     * A configuration object for cell editor settings.
     */
    get editorConfig() {
        return this._editorConfig;
    }
    set editorConfig(value) {
        this._editorConfig = value;
    }
    /**
     * A configuration object for notebook settings.
     */
    get notebookConfig() {
        return this._notebookConfig;
    }
    set notebookConfig(value) {
        this._notebookConfig = value;
    }
    /**
     * Create a new widget.
     *
     * #### Notes
     * The factory will start the appropriate kernel.
     */
    createNewWidget(context, source) {
        const nbOptions = {
            rendermime: source
                ? source.content.rendermime
                : this.rendermime.clone({ resolver: context.urlResolver }),
            contentFactory: this.contentFactory,
            mimeTypeService: this.mimeTypeService,
            editorConfig: source ? source.content.editorConfig : this._editorConfig,
            notebookConfig: source
                ? source.content.notebookConfig
                : this._notebookConfig,
            translator: this.translator
        };
        const content = this.contentFactory.createNotebook(nbOptions);
        return new NotebookPanel({ context, content });
    }
    /**
     * Default factory for toolbar items to be added after the widget is created.
     */
    defaultToolbarFactory(widget) {
        return ToolbarItems.getDefaultItems(widget, this._sessionDialogs, this.translator);
    }
}
//# sourceMappingURL=widgetfactory.js.map