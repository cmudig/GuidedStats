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
    selectedStepInfo = Dict({}).tag(sync=True) # {stepType: the name of step, stepPos: the stepId of its subsequent step}
    
    workflow = Instance(WorkFlow)
    workflowInfo = Dict({}).tag(sync=True)
    
    exportTableStepIdx = Int().tag(sync=True)
    exportVizStepIdx = Int(-1).tag(sync=True)
    exportVizIdx = Int(-1).tag(sync=True) 
    exportCode = Unicode("").tag(sync=True)
    
    def __init__(self, dataset: pd.DataFrame, datasetName: str = "dataset", *args, **kwargs):
        super(GuidedStats, self).__init__(*args, **kwargs)

        self.dataset = dataset
        self.datasetName = datasetName
        
        self.observe(self.addWorkFlow, names='selectedWorkflow')
        
        self.getBuiltinWorkflow()
        self.getBuiltinSteps()
        self.getBuiltinAssumptions()
        self.getBuiltinTransformations()
        
        self.observe(self._handle_exportTable, names='exportTableStepIdx')
        self.observe(self._handle_exportViz, names='exportVizIdx')
        
    def _handle_exportTable(self, change):
        idx = change["new"] #evaluation step
        modelStep = self.workflow.steps[idx-1]
        results = modelStep.outputs["results"]
        html_table = exportTable([results])
        html_table = html_table.replace("\n","").replace('"', '\"')
        
        self.exportCode = html_table
    
    def _handle_exportViz(self, change):
        viz_idx = change["new"]
        if viz_idx >=0 and self.exportVizStepIdx >= 0 and self.exportVizStepIdx < len(self.workflow.steps):
            vizStep = self.workflow.steps[self.exportVizStepIdx]
            viz = vizStep.config["viz"][viz_idx]
            if viz["vizType"] == "boxplot":
                vizStats = viz["vizStats"]
                vizCode = exportBoxplot(vizStats)
            elif viz["vizType"] == "scatter":
                vizStats = viz["vizStats"]
                vizCode = exportScatterplot(vizStats)
            
            self.exportCode = vizCode
        
    def export(self,item:str,**kwargs):
        if item == "table":
            format = kwargs.get("format","latex")
            table = self.exportTable(format=format)
            return table
        elif item == "report":
            report = self.exportReport()
            return report
        elif item == "models":
            models = self.exportModels()
            return models
        elif item == "currentModel":
            model = self.exportCurrentModel()
            return model
        elif item == "results":
            results = self.exportModelResults()
            return results
        else:
            raise ValueError("Invalid export item")
            
    
    def exportTable(self,format="html"):
        # loop through all steps, find the last model step, and export its results
        modelStep = None
        for step in self.workflow.steps:
            if isinstance(step,ModelStep):
                modelStep = step
        if modelStep == None:
            raise ValueError("No model step found")
        else:      
            results = modelStep.outputs["results"]
            table = exportTable([results],format=format)
            table = table.replace("\n","").replace('"', '\"')
        
        return table
        # self.exportCode = html_table
        
    def exportReport(self):
        if self.workflow.current_model_results is not None:
            # print(exportReport(self.workflow.current_model_results))
            return exportReport(self.workflow.current_model_results)
        else:
            raise ValueError("No model results found")
        
    def exportModels(self):
        if len(self.workflow.all_models) != 0:
            return self.workflow.all_models
        else:
            raise ValueError("No models found")
    
    def exportCurrentModel(self):
        if self.workflow.current_model is not None:
            return self.workflow.current_model
        else:
            raise ValueError("No model found")
    
    def exportModelResults(self):
        if self.workflow.current_model_results is not None:
            return self.workflow.current_model_results
        else:
            raise ValueError("No model results found")
    
      
    def getBuiltinWorkflow(self):
        self.builtinWorkflows = ["Linear Regression","T Test"]
        
    def getBuiltinSteps(self):
        self.builtinSteps = ['Load Dataset','Select Variable(s)','Transform Data','Check Assumption','Split Data','Add Model','Evaluate Model']
    
    def getBuiltinAssumptions(self):      
        display_names = []
        for name in ASSUMPTIONS.keys():
            display_name = ASSUMPTIONS[name]["display"]
            display_names.append(display_name)
        
        self.builtinAssumptions = display_names
    
    def getBuiltinTransformations(self):
        self.builtinTransformations = list(TRANSFORMATIONS.keys())
            
    def addWorkFlow(self,change):
        #TBC, dataset stuff should be refined
        workflow = WorkFlow(dataset=self.dataset,datasetName=self.datasetName,workflowName=change["new"])
        self.workflow = workflow
        self.workflow.visualizer = self
        self.workflow.observe(self.updateWorkflowInfo,names=["workflowInfo"])
        self.workflow.startGuiding()
    
    def updateWorkflowInfo(self, change):
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
        with open("./test.txt", "a+") as f:
            f.write("addStep onProceeding: " + str(change["new"]) + "\n")
        stepInfo = change["new"]
        self.workflow.addStep(stepInfo["stepType"],stepInfo["stepPos"])
        
        
    def defineStep(self,transformationName:str,transformation:Callable):
        #TBC
        step = DataTransformationStep()
        step.addTransformation(transformationName,transformation)
        step.setTransformation(transformationName)
        
        self.builtinSteps = [*self.builtinSteps,transformationName]
        
    #add property "currentDF" to workflow
    @property
    def current_dataframe(self):
        return self.workflow.current_dataframe
    
    @current_dataframe.setter
    def current_dataframe(self, df):
        raise ImproperUseError("current_dataframe is read-only")

