// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as nbformat from '@jupyterlab/nbformat';
import { ObservableList } from '@jupyterlab/observables';
import { OutputModel } from '@jupyterlab/rendermime';
import { each, map, toArray } from '@lumino/algorithm';
import { JSONExt } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
/**
 * The default implementation of the IOutputAreaModel.
 */
export class OutputAreaModel {
    /**
     * Construct a new observable outputs instance.
     */
    constructor(options = {}) {
        /**
         * A flag that is set when we want to clear the output area
         * *after* the next addition to it.
         */
        this.clearNext = false;
        this._trusted = false;
        this._isDisposed = false;
        this._stateChanged = new Signal(this);
        this._changed = new Signal(this);
        this._trusted = !!options.trusted;
        this.contentFactory =
            options.contentFactory || OutputAreaModel.defaultContentFactory;
        this.list = new ObservableList();
        if (options.values) {
            each(options.values, value => {
                this._add(value);
            });
        }
        this.list.changed.connect(this._onListChanged, this);
    }
    /**
     * A signal emitted when the model state changes.
     */
    get stateChanged() {
        return this._stateChanged;
    }
    /**
     * A signal emitted when the model changes.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Get the length of the items in the model.
     */
    get length() {
        return this.list ? this.list.length : 0;
    }
    /**
     * Get whether the model is trusted.
     */
    get trusted() {
        return this._trusted;
    }
    /**
     * Set whether the model is trusted.
     *
     * #### Notes
     * Changing the value will cause all of the models to re-set.
     */
    set trusted(value) {
        if (value === this._trusted) {
            return;
        }
        const trusted = (this._trusted = value);
        for (let i = 0; i < this.list.length; i++) {
            let item = this.list.get(i);
            const value = item.toJSON();
            item.dispose();
            item = this._createItem({ value, trusted });
            this.list.set(i, item);
        }
    }
    /**
     * Test whether the model is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources used by the model.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this.list.dispose();
        Signal.clearData(this);
    }
    /**
     * Get an item at the specified index.
     */
    get(index) {
        return this.list.get(index);
    }
    /**
     * Set the value at the specified index.
     */
    set(index, value) {
        value = JSONExt.deepCopy(value);
        // Normalize stream data.
        Private.normalize(value);
        const item = this._createItem({ value, trusted: this._trusted });
        this.list.set(index, item);
    }
    /**
     * Add an output, which may be combined with previous output.
     *
     * @returns The total number of outputs.
     *
     * #### Notes
     * The output bundle is copied.
     * Contiguous stream outputs of the same `name` are combined.
     */
    add(output) {
        // If we received a delayed clear message, then clear now.
        if (this.clearNext) {
            this.clear();
            this.clearNext = false;
        }
        return this._add(output);
    }
    /**
     * Clear all of the output.
     *
     * @param wait Delay clearing the output until the next message is added.
     */
    clear(wait = false) {
        this._lastStream = '';
        if (wait) {
            this.clearNext = true;
            return;
        }
        each(this.list, (item) => {
            item.dispose();
        });
        this.list.clear();
    }
    /**
     * Deserialize the model from JSON.
     *
     * #### Notes
     * This will clear any existing data.
     */
    fromJSON(values) {
        this.clear();
        each(values, value => {
            this._add(value);
        });
    }
    /**
     * Serialize the model to JSON.
     */
    toJSON() {
        return toArray(map(this.list, (output) => output.toJSON()));
    }
    /**
     * Add a copy of the item to the list.
     */
    _add(value) {
        const trusted = this._trusted;
        value = JSONExt.deepCopy(value);
        // Normalize the value.
        Private.normalize(value);
        // Consolidate outputs if they are stream outputs of the same kind.
        if (nbformat.isStream(value) &&
            this._lastStream &&
            value.name === this._lastName &&
            this.shouldCombine({
                value,
                lastModel: this.list.get(this.length - 1)
            })) {
            // In order to get a list change event, we add the previous
            // text to the current item and replace the previous item.
            // This also replaces the metadata of the last item.
            this._lastStream += value.text;
            this._lastStream = Private.removeOverwrittenChars(this._lastStream);
            value.text = this._lastStream;
            const item = this._createItem({ value, trusted });
            const index = this.length - 1;
            const prev = this.list.get(index);
            prev.dispose();
            this.list.set(index, item);
            return index;
        }
        if (nbformat.isStream(value)) {
            value.text = Private.removeOverwrittenChars(value.text);
        }
        // Create the new item.
        const item = this._createItem({ value, trusted });
        // Update the stream information.
        if (nbformat.isStream(value)) {
            this._lastStream = value.text;
            this._lastName = value.name;
        }
        else {
            this._lastStream = '';
        }
        // Add the item to our list and return the new length.
        return this.list.push(item);
    }
    /**
     * Whether a new value should be consolidated with the previous output.
     *
     * This will only be called if the minimal criteria of both being stream
     * messages of the same type.
     */
    shouldCombine(options) {
        return true;
    }
    /**
     * Create an output item and hook up its signals.
     */
    _createItem(options) {
        const factory = this.contentFactory;
        const item = factory.createOutputModel(options);
        item.changed.connect(this._onGenericChange, this);
        return item;
    }
    /**
     * Handle a change to the list.
     */
    _onListChanged(sender, args) {
        this._changed.emit(args);
    }
    /**
     * Handle a change to an item.
     */
    _onGenericChange() {
        this._stateChanged.emit(void 0);
    }
}
/**
 * The namespace for OutputAreaModel class statics.
 */
(function (OutputAreaModel) {
    /**
     * The default implementation of a `IModelOutputFactory`.
     */
    class ContentFactory {
        /**
         * Create an output model.
         */
        createOutputModel(options) {
            return new OutputModel(options);
        }
    }
    OutputAreaModel.ContentFactory = ContentFactory;
    /**
     * The default output model factory.
     */
    OutputAreaModel.defaultContentFactory = new ContentFactory();
})(OutputAreaModel || (OutputAreaModel = {}));
/**
 * A namespace for module-private functionality.
 */
var Private;
(function (Private) {
    /**
     * Normalize an output.
     */
    function normalize(value) {
        if (nbformat.isStream(value)) {
            if (Array.isArray(value.text)) {
                value.text = value.text.join('\n');
            }
        }
    }
    Private.normalize = normalize;
    /**
     * Remove characters that are overridden by backspace characters.
     */
    function fixBackspace(txt) {
        let tmp = txt;
        do {
            txt = tmp;
            // Cancel out anything-but-newline followed by backspace
            tmp = txt.replace(/[^\n]\x08/gm, ''); // eslint-disable-line no-control-regex
        } while (tmp.length < txt.length);
        return txt;
    }
    /**
     * Remove chunks that should be overridden by the effect of
     * carriage return characters.
     */
    function fixCarriageReturn(txt) {
        txt = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
        while (txt.search(/\r[^$]/g) > -1) {
            const base = txt.match(/^(.*)\r+/m)[1];
            let insert = txt.match(/\r+(.*)$/m)[1];
            insert = insert + base.slice(insert.length, base.length);
            txt = txt.replace(/\r+.*$/m, '\r').replace(/^.*\r/m, insert);
        }
        return txt;
    }
    /*
     * Remove characters overridden by backspaces and carriage returns
     */
    function removeOverwrittenChars(text) {
        return fixCarriageReturn(fixBackspace(text));
    }
    Private.removeOverwrittenChars = removeOverwrittenChars;
})(Private || (Private = {}));
//# sourceMappingURL=model.js.map