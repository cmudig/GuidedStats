// Copyright (c) Yuqi(Adam) Zhang
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';
import { MODULE_NAME, MODULE_VERSION } from './version';
import Widget from './Widget.svelte'

export class VizualizerModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: VizualizerModel.model_name,
      _model_module: VizualizerModel.model_module,
      _model_module_version: VizualizerModel.model_module_version,
      _view_name: VizualizerModel.view_name,
      _view_module: VizualizerModel.view_module,
      _view_module_version: VizualizerModel.view_module_version,
      builtinWorkflows: [],
      dfProfile: {},
      exportedCode: '',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'VizualizerModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'VizualizerView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class VizualizerView extends DOMWidgetView {
  render() {
    new Widget({ target: this.el, props: { model: this.model } });
  }
}
