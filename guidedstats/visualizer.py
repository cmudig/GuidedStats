#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Yuqi(Adam) Zhang.
# Distributed under the terms of the Modified BSD License.

"""
Visualizer module for widgets
"""

import pandas as pd
import random
import string

from IPython import get_ipython
from ipywidgets import DOMWidget
import traitlets as tl
from traitlets import Int, Unicode, Dict, List, Instance
from varname.utils import ImproperUseError

from ._frontend import module_name, module_version

from .step import *
from .workflow import WorkFlow
from .export import *
from .assumptions import ASSUMPTIONS
from .transformations import TRANSFORMATIONS


class GuidedStats(DOMWidget):
    # boilerplate for ipywidgets syncing
    _model_name = Unicode('VizualizerModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('VizualizerView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    # our synced traitlet state
    builtinWorkflows = List().tag(sync=True)
    builtinSteps = List().tag(sync=True)
    builtinAssumptions = List().tag(sync=True)
    builtinTransformations = List().tag(sync=True)

    selectedWorkflow = Unicode("").tag(sync=True)
    # {stepType: the name of step, stepPos: the stepId of its subsequent step}
    selectedStepInfo = Dict({}).tag(sync=True)

    workflow = Instance(WorkFlow)
    workflowInfo = Dict({}).tag(sync=True)

    serial = Unicode("").tag(sync=True)

    def __init__(self, dataset: pd.DataFrame, datasetName: str = "dataset", *args, **kwargs):
        super(GuidedStats, self).__init__(*args, **kwargs)

        self.dataset = dataset

        user_ns = get_ipython().user_ns
        for name, value in user_ns.items():
            if value is dataset:
                self.datasetName = name

        self.serial = ''.join(random.choices(
            string.ascii_letters + string.digits, k=4))
        self.ignore_update = False

        self.observe(self.addWorkFlow, names='selectedWorkflow')

        self.getBuiltinWorkflow()
        self.getBuiltinSteps()
        self.getBuiltinAssumptions()
        self.getBuiltinTransformations()

    def _handle_exportTable(self, change):
        idx = change["new"]  # evaluation step
        modelStep = self.workflow.steps[idx-1]
        results = modelStep.outputs["results"]
        html_table = exportTable([results])
        html_table = html_table.replace("\n", "").replace('"', '\"')

        self.exportCode = html_table

    def _import(self, name: str, item):
        if name == "dataset":
            # import dataset
            self.workflow.importDataset(item)
        else:
            raise ValueError("Invalid import item")

    def export(self, name: str, **kwargs):
        if name == "table":
            format = kwargs.get("format", "latex")
            table = self.exportTable(format=format)
            return table
        elif name == "report":
            report = self.exportReport()
            return report
        elif name == "model":
            model = self.exportCurrentModel()
            return model
        elif name == "dataset":
            dataset = self.exportDataset()
            return dataset
        elif name == "code":
            from ipylab import JupyterFrontEnd
            code = self.exportWorkflowCode(**kwargs)
            app = JupyterFrontEnd()
            app.commands.execute('notebook:move-cursor-up')
            app.commands.execute('notebook:insert-cell-below')
            app.commands.execute('notebook:enter-edit-mode')
            app.commands.execute('notebook:replace-selection', {'text': code})
        else:
            raise ValueError("Invalid export item")

    def exportTable(self, format="html"):
        # loop through all steps, find the last model step, and export its results
        modelStep = None
        for step in self.workflow.steps:
            if isinstance(step, ModelStep):
                modelStep = step
        if modelStep == None:
            raise ValueError("No model step found")
        else:
            results = modelStep.outputs["results"]
            table = exportTable([results], format=format)
            table = table.replace("\n", "").replace('"', '\"')

        return table
        # self.exportCode = html_table

    def exportReport(self):
        if self.workflow.current_model is not None:
            if self.workflow.current_model._results is None:
                raise ValueError("Model not fitted")
            if self.workflow.current_model._modelName == "Simple Linear Regression":
                return exportRegressionReport(self.workflow.current_model._results)
            elif self.workflow.current_model._modelName == "T Test":
                return exportTTestReport(self.workflow.current_model._results)
        else:
            raise ValueError("No model found")

    def exportCurrentModel(self):
        if self.workflow.current_model is not None:
            return copy.deepcopy(self.workflow.current_model)
        else:
            raise ValueError("No model found")

    def exportDataset(self):
        if self.workflow.current_dataframe is not None:
            return self.workflow.current_dataframe

    def exportWorkflowCode(self, step_no=None, export_viz_func=False, **kwargs):
        if self.workflow is not None:
            return self.workflow.exportCode(step_no=step_no, export_viz_func=export_viz_func, **kwargs)

    def getBuiltinWorkflow(self):
        self.builtinWorkflows = ["Linear Regression", "T Test"]

    def getBuiltinSteps(self):
        self.builtinSteps = [
            'Load Dataset', 'Select Variable(s)', 'Transform Data', 'Check Assumption', 'Split Data', 'Add Model', 'Evaluate Model']

    def getBuiltinAssumptions(self):
        display_names = []
        for name in ASSUMPTIONS.keys():
            display_name = ASSUMPTIONS[name]["display"]
            display_names.append(display_name)

        self.builtinAssumptions = display_names

    def getBuiltinTransformations(self):
        self.builtinTransformations = list(TRANSFORMATIONS.keys())

    def addWorkFlow(self, change):
        user_ns = get_ipython().user_ns
        for key, value in user_ns.items():
            #key should not be in the form of _2, _3, etc.
            if re.match(r'^_[0-9]*$', key):
                continue
            if value is self:
                self.workflowVariableName = key
        # TBC, dataset stuff should be refined
        workflow = WorkFlow(
            dataset=self.dataset, datasetName=self.datasetName, workflowName=change["new"])
        self.workflow = workflow
        self.workflow.outputsStorage[0] = {}
        self.workflow.outputsStorage[0]["workflowVariableName"] = self.workflowVariableName
        self.workflow.observe(self.updateWorkflowInfo, names=["workflowInfo"])
        self.workflow.startGuiding()

    def updateWorkflowInfo(self, change):
        self.ignore_update = True
        new_info = self.workflow.workflowInfo
        if new_info != self.workflowInfo:
            self.workflowInfo = new_info
        self.ignore_update = False

    @tl.observe("workflowInfo")
    def onObserveWorkflowInfo(self, change):
        if self.ignore_update:
            return
        new_info = change["new"]
        self.workflow.workflowInfo = new_info

    # add property "currentDF" to workflow
    @property
    def current_dataframe(self):
        return self.workflow.current_dataframe

    @current_dataframe.setter
    def current_dataframe(self, df):
        raise ImproperUseError("current_dataframe is read-only")
