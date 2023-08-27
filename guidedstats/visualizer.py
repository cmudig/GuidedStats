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

from ipywidgets import DOMWidget
import traitlets as tl
from traitlets import Unicode, Dict, List , observe, link
import pandas as pd
from varname import argname
from varname.utils import ImproperUseError
from ipylab import JupyterFrontEnd
import warnings

from ._frontend import module_name, module_version

from .step import DataTransformationStep, Step
from .workflow import WorkFlow,RegressionFlow

class Visualizer(DOMWidget):
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
    
    workflow = tl.Instance(WorkFlow)
    workflowInfo = Dict({}).tag(sync=True)
    

    def __init__(self, dataset: pd.DataFrame, *args, **kwargs):
        super(Visualizer, self).__init__(*args, **kwargs)

        self.dataset = dataset
        
        self.observe(self.addWorkFlow, names='selectedWorkflow')
        
        self.getBuiltinWorkflow()
    
    def getBuiltinWorkflow(self):
        workflows = os.listdir("../cache")
        self.builtinWorkflows = workflows
        
    def addWorkFlow(self,change):
        cls = globals()[change["new"]]
        #TBC, dataset stuff should be refined
        workflow = cls(dataset=self.dataset)
        self.workflow = workflow
        self.workflow.observe(self.updateWorkflowInfo,names=["workflowInfo"])
        # self.observe(self.updateWorkflow,names=["workflowInfo"])
        self.workflow.startGuiding()
    
    def updateWorkflowInfo(self,change):
        self.workflowInfo = self.workflow.workflowInfo

    def deleteFlow(self,workflow:WorkFlow):
        #TODO
        pass
        
    def defineStep(self,transformationName:str,transformation:Callable):
        #TBC
        step = DataTransformationStep()
        step.addTransformation(transformationName,transformation)
        step.setTransformation(transformationName)
        
        self.builtinSteps = [*self.builtinSteps,transformationName]
    # def addNewCell(self, codeText):
    #     if codeText == '':
    #         return
    #     self.app.commands.execute('notebook:insert-cell-below')
    #     self.app.commands.execute('notebook:replace-selection', {'text': codeText})
