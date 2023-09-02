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
import traitlets as tl
from traitlets import Unicode, Dict, List , Instance, observe, link
from varname import argname
from varname.utils import ImproperUseError
from ipylab import JupyterFrontEnd

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
    
    workflow = Instance(WorkFlow)
    workflowInfo = Dict({}).tag(sync=True)
    dagdata = List([]).tag(sync=True)
    
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
        
    def createDAGData(self):
        step_pos = {}
        last_steps_in_branch = {} #{branch:stepId}
        flows = sorted(self.workflowInfo["flows"],key=lambda flow:flow["sourceStepId"])
        grouped_flows = {source:[flow["targetStepId"] for flow in group] for source,group in groupby(flows, key=lambda flow: flow["sourceStepId"])}# {source:[...targets]}    

        for i,step in enumerate(self.workflowInfo["steps"]):
            y = i

            branch = None
            branchFound = False

            if len(last_steps_in_branch) == 0:
                branch = 0
                branchFound = True
            else:
                for j,last_step_id in last_steps_in_branch.items(): 
                    branch = j
                    if step["stepId"] in grouped_flows[last_step_id]:
                        branch = j
                        branchFound = True
                        break                 
            if branchFound:        
                step_pos[step["stepId"]] = [branch,y,branch] #[x_pos,y_pos,branch]
                last_steps_in_branch[branch] = step["stepId"]
            else:
                branch += 1
                step_pos[step["stepId"]] = [branch,y,branch] #[x_pos,y_pos,branch]
                last_steps_in_branch[branch] = step["stepId"]
            
        dagdata = []
        max_branch = 0 # for current commit, the maximum number of branches horizontally 
        for source,[x_pos,y_pos,branch] in step_pos.items():
            dot = [x_pos,branch]
            routes = []
            if source in grouped_flows:
                for target in grouped_flows[source]:
                    max_branch = max(step_pos[target][2],max_branch)
                    routes.append([step_pos[source][0],step_pos[target][0],step_pos[target][2]])
            
            #TBC
            merged_branches = []
            if step_pos[source][2] > step_pos[target][2]: #merge
                merged_branches.append(step_pos[source][2])
            print(source)
            print(merged_branches)
            print(max_branch)
            while max_branch in merged_branches:
                max_branch -= 1
            
            for i in range(max_branch+1):
                if i not in merged_branches:
                    routes.append([i,i,i])
                
            dagdata.append([source,dot,routes])
        
        # for source,targets in grouped_flows.items():
        #     dot = [step_pos[source][0],step_pos[source][2]]
        #     routes = []
        #     for target in targets:
        #         routes.append([step_pos[source][0],step_pos[target][0],step_pos[target][2]])
        #     dagdata.append([source,dot,routes])
        
        self.dagdata = dagdata


    # def addNewCell(self, codeText):
    #     if codeText == '':
    #         return
    #     self.app.commands.execute('notebook:insert-cell-below')
    #     self.app.commands.execute('notebook:replace-selection', {'text': codeText})
