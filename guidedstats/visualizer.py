#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Yuqi(Adam) Zhang.
# Distributed under the terms of the Modified BSD License.

"""
Visualizer module for widgets
"""

import json
import os
from typing import Callable
import pandas as pd
from itertools import groupby

from ipywidgets import DOMWidget
from IPython.display import display, Javascript, HTML
import traitlets as tl
from traitlets import Int, Unicode, Dict, List, Bool, Instance, observe, link
from varname import argname
from varname.utils import ImproperUseError
from ipylab import JupyterFrontEnd

from ._frontend import module_name, module_version

from .step import *
from .workflow import WorkFlow,RegressionFlow
from.export import *

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
    builtinSteps = List(['LoadDatasetStep','VariableSelectionStep','DataTransformationStep','AssumptionCheckingStep','TrainTestSplitStep','ModelStep','EvaluationStep']).tag(sync=True)
    selectedWorkflow = Unicode("").tag(sync=True)
    selectedStepInfo = Dict({}).tag(sync=True) # {stepType: the name of step, stepPos: the stepId of its subsequent step}
    
    workflow = Instance(WorkFlow)
    workflowInfo = Dict({}).tag(sync=True)
    dagdata = List([]).tag(sync=True)
    
    exportTableStepIdx = Int().tag(sync=True)
    exportVizStepIdx = Int().tag(sync=True)
    exportCode = Unicode("").tag(sync=True)
    
    def __init__(self, dataset: pd.DataFrame, datasetName: str = "dataset", *args, **kwargs):
        super(GuidedStats, self).__init__(*args, **kwargs)

        self.dataset = dataset
        self.datasetName = datasetName
        
        self.observe(self.addWorkFlow, names='selectedWorkflow')
        
        self.getBuiltinWorkflow()
        
        self.observe(self._handle_exportTable, names='exportTableStepIdx')
        self.observe(self._handle_exportViz, names='exportVizStepIdx')
        
    def _handle_exportTable(self, change):
        idx = change["new"] #evaluation step
        modelStep = self.workflow.steps[idx-1]
        results = modelStep.outputs["results"]
        html_table = exportTable([results])
        html_table = html_table.replace("\n","").replace('"', '\"')
        
        self.exportCode = html_table
    
    def _handle_exportViz(self, change):
        idx = change["new"]
        vizStep = self.workflow.steps[idx]
        if vizStep.config["viz"]["vizType"] == "boxplot":
            vizStats = vizStep.config["viz"]["vizStats"]
            vizCode = exportBoxplot(vizStats)
        elif vizStep.config["viz"]["vizType"] == "scatter":
            vizStats = vizStep.config["viz"]["vizStats"]
            vizCode = exportScatterplot(vizStats)
        self.exportCode = vizCode
          
    def getBuiltinWorkflow(self):
        workflows = os.listdir("../cache")
        self.builtinWorkflows = workflows
        
    def addWorkFlow(self,change):
        cls = globals()[change["new"]]
        #TBC, dataset stuff should be refined
        workflow = cls(dataset=self.dataset,datasetName=self.datasetName)
        self.workflow = workflow
        self.workflow.visualizer = self
        self.workflow.observe(self.updateWorkflowInfo,names=["workflowInfo"])
        # self.observe(self.updateWorkflow,names=["workflowInfo"])
        self.workflow.startGuiding()
    
    def updateWorkflowInfo(self, change):
        # with open("./test.txt", "a+") as f:
        #     f.write("updateWorkflowInfo onProceeding: " + str(self.workflow.onProceeding) + "\n")
        # if self.workflow.onProceeding == False:
        new_info = self.workflow.workflowInfo
        if new_info != self.workflowInfo:
            self.workflowInfo = new_info

    @tl.observe("workflowInfo")
    def onObserveWorkflowInfo(self, change):
        if self.workflow.isUpdatingWorkflowInfo == False:
            new_info = change["new"]
            if new_info != self.workflow.workflowInfo:
                self.workflow.workflowInfo = new_info

    def deleteFlow(self,workflow:WorkFlow):
        #TODO
        pass
    
    @tl.observe("selectedStepInfo")
    def addStep(self,change):
        stepInfo = change["new"]
        self.workflow.addStep(stepInfo["stepType"],stepInfo["stepPos"])
        
        
    def defineStep(self,transformationName:str,transformation:Callable):
        #TBC
        step = DataTransformationStep()
        step.addTransformation(transformationName,transformation)
        step.setTransformation(transformationName)
        
        self.builtinSteps = [*self.builtinSteps,transformationName]

