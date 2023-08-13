#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Yuqi(Adam) Zhang.
# Distributed under the terms of the Modified BSD License.

"""
Visualizer module for widgets
"""

import os
from typing import Callable
import pandas as pd

from ipywidgets import DOMWidget
from traitlets import Unicode, Dict, List , observe
import pandas as pd
from varname import argname
from varname.utils import ImproperUseError
from ipylab import JupyterFrontEnd
import warnings

from ._frontend import module_name, module_version

from .step import DataTransformationStep, Step
from .workflow import WorkFlow,RegressionFlow

class Visualizer(DOMWidget,WorkFlow):
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
    workflowInfo = Dict({}).tag(sync=True)
    # python only state
    # dataframe = None
    # app = JupyterFrontEnd()
    

    def __init__(self, dataset: pd.DataFrame, *args, **kwargs):
        super(Visualizer, self).__init__(*args, **kwargs)

        self.dataset = dataset
        
        self.observe(self.addWorkFlow, names='selectedWorkflow')
        
        # try:
        #     dfName = argname('dataframe')
        # except ImproperUseError:
        #     warnings.warn("Export to code will not work if dataframe is not assigned to variable before passing to Visualizer.", stacklevel=2)
        #     dfName = 'UnnamedDataFrame'
        
        self.getBuiltinWorkflow()
    
    def getBuiltinWorkflow(self):
        workflows = os.listdir("../cache")
        self.builtinWorkflows = workflows
        
    def addWorkFlow(self,change):
        cls = globals()[change["new"]]
        #TBC, dataset stuff should be refined
        dataset = pd.read_csv("../examples/test.csv")
        workflow = cls(dataset=dataset)
        self.workflowList.append(workflow)
        #TBC, workflowListInfo should be updated too
        workflow.startGuiding()
        
        #extract properties of the current workflow
        # workflowInfo = {
        #     "workflowName": workflow.workflowName,
        #     "currentStepId": workflow.currentStep.stepId,  
        # }
        # for step in workflow.stepList:
        #     {
        #         "stepName": step.stepName,
        #         "options": step. ,
        #         "result":, # vary among different steps
        #     }

        
        # self.workflowName = workflowName
        # self.stepList = []
        
        # #step-related state variable
        # self.loadStep = None
        # self.lastStep = None
        # self.currentStep = None
    
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
