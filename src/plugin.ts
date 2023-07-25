// Copyright (c) Yuqi(Adam) Zhang
// Distributed under the terms of the Modified BSD License.


import type {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';
import * as widgetExports from './widget';
import { MODULE_NAME, MODULE_VERSION } from './version';
// import { INotebookTracker } from '@jupyterlab/notebook';

const EXTENSION_ID = 'guidedstats:plugin';

/**
 * The example plugin.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry], // INotebookTracker],
  activate: (app: JupyterFrontEnd, registry: IJupyterWidgetRegistry) => { // nbtracker: INotebookTracker) => {

    console.log("activating extension")
    registry.registerWidget({
      name: MODULE_NAME,
      version: MODULE_VERSION,
      exports: widgetExports,
    });

    // emitted when the user's notebook changes I think...
    // notebookTracker.currentChanged.connect((_, widget) => {
    //   console.log(">>>>>>>>Notebook changed>>>>>>>>")
    //   const notebook = new NotebookAPI(widget);
    //   notebook.ready.then(async () => {
    //     logger.setNoteook(notebook);
    //   });
    // });

  },
  autoStart: true,
};

export default extension;

