
from collections import OrderedDict
from typing import Iterable
import pandas as pd
import traitlets as tl
import copy as copy
import json

from .step import *

from .config import _regressionConfig,_ttestConfig

class Flow(tl.HasTraits):
    sourceStepId = tl.Int().tag(sync=True)
    targetStepId = tl.Int().tag(sync=True)
    
    def __init__(self, sourceStepId, targetStepId):
        self.sourceStepId = sourceStepId
        self.targetStepId = targetStepId

class WorkFlow(tl.HasTraits):
    workflowName = tl.Unicode()
    currentStepId = tl.Int().tag(sync=True)
    # onProceeding = tl.Bool().tag(sync=True)
    _steps = tl.List(trait=tl.Instance(Step)).tag(sync=True)
    _flows = tl.List(trait=tl.Instance(Flow)).tag(sync=True)
    workflowInfo = tl.Dict({}).tag(sync=True)
    
    def __init__(self, dataset: pd.DataFrame, workflowName="workflow", datasetName="dataset"):
        
        self.workflowName = workflowName
        self.dataset = copy.deepcopy(dataset)
        self.datasetName = datasetName
        self.stepList = []
        
        #export related state variables
        self.current_dataframe = None
        self.current_model = None
        
        #step-related state variables
        self.loadStep = None
        self.currentStep = None
        
        
        #workflow-related state variables
        self.isObservingWorkflowInfo = False
        self.isUpdatingWorkflowInfo = False
        # self.onProceeding = False
        # self.loadData()

        #initialize workflowInfo
        self.workflowInfo = {"workflowName":self.workflowName,
                             "currentStepId":self.currentStepId,
                            #  "onProceeding":self.onProceeding,
                             "steps":[],
                             "flows":[]}
        
        self.outputsStorage = {}
        
        # self.observe(self.updateWorkflowInfo,names=["workflowName","currentStepId","onProceeding"])
        self.observe(self.updateWorkflowInfo,names=["workflowName","currentStepId"])
        
        self.visualizer = None
                
        if self.workflowName == "Linear Regression":
            self.configFile = _regressionConfig
        elif self.workflowName == "T Test":
            self.configFile = _ttestConfig
    
    @property
    def steps(self):
        return self._steps

    @steps.setter
    def steps(self, value):
        # Unobserve old steps
        for step in self._steps:
            step.unobserve(self.updateWorkflowInfo,names=["stepId","stepName","stepType","stepExplanation","done","isProceeding","toExecute","isShown","config","previousConfig","groupConfig"])
        # Set the new steps
        self._steps = value
        # Observe new steps
        for step in self._steps:
            step.workflow = self
            step.observe(self.updateWorkflowInfo,names=["stepId","stepName","stepType","stepExplanation","done","isProceeding","toExecute","isShown","config","previousConfig","groupConfig"])
            
    def addStep(self, stepName:str, stepPos):
        # find the step in stepList and insert the new step before it
        step_dict = {
            "Load Dataset":LoadDatasetStep,
            "Select Variable(s)":VariableSelectionStep,
            "Transform Data":DataTransformationStep,
            "Check Assumption":AssumptionCheckingStep,
            "Split Data":TrainTestSplitStep,
            "Add Model":ModelStep,
            "Evaluate Model":EvaluationStep
        }
        
        cls = step_dict[stepName]
        step = cls()
        if stepPos == -1: # add the last step
            self.stepList.append(step)
        else:
            afterStep = next(filter(lambda step: step.stepId == stepPos, self.stepList),None)
            if afterStep is not None:
                afterStepIdx = self.stepList.index(afterStep)
                self.stepList.insert(afterStepIdx, step)
        
        # set currentStep back to the inserted step
        self.currentStep = step
        #update step id
        for i,step in enumerate(self.stepList):
            step.stepId = i
        
        # update outputsStorage
        currentStepIdx = self.currentStep.stepId
        for i in range(len(self.stepList)):
            step = self.stepList[i]
            if i < currentStepIdx:
                if len(step.outputs) > 0:
                    self.outputsStorage[step.stepId] = step.outputs
            elif i == currentStepIdx:
                self.outputsStorage[step.stepId] = {}
            else:
                if len(step.outputs) > 0:
                    self.outputsStorage[step.stepId] = step.outputs
        
        # set subsequent steps done = True
        for i in range(currentStepIdx+1,len(self.stepList)):
            self.stepList[i].done = False
            self.stepList[i].clearUIinputs()
        # update steps
        self.steps = self.stepList
        # update workflowInfo
        self.updateWorkflowInfo(None)
        self.currentStep.isProceeding = True
        self.callStepForward()

            
    @property
    def flows(self):
        return self._flows
        
    @flows.setter
    def flows(self, value):
        # Unobserve old flows
        for flow in self._flows:
            flow.unobserve(self.updateWorkflowInfo)
        # Set the new flows
        self._flows = value
        # Observe new flows
        for flow in self._flows:
            flow.observe(self.updateWorkflowInfo)
    
    def deleteFlow(self, flow):
        self._flows.remove(flow)
        flow.unobserve(self.updateWorkflowInfo)
        
    def addFlow(self, lastStep: Step, newStep: Step):
        # TBC, should check the coupling
        newStep.previousSteps.append(lastStep)
        # update workflowInfo
        flow = Flow(sourceStepId=lastStep.stepId,targetStepId=newStep.stepId)
        self._flows.append(flow)
        flow.observe(self.updateWorkflowInfo)

    def deleteFlow(self, lastStep: Step, newStep: Step):
        # TBC, should check the coupling
        newStep.previousSteps.remove(lastStep)
        #update workflowInfo
        flow = next(filter(lambda flow: flow.sourceStepId == lastStep.stepId and flow.targetStepId == newStep.stepId, self._flows))
        self._flows.remove(flow)
        flow.unobserve(self.updateWorkflowInfo)
    
    def loadData(self):
        """
            Mandatory Step for every workflow, load the dataset by initializing a LoadDatasetStep
        """
        loadStep = LoadDatasetStep(stepId=0)
        loadStep.workflow = self
        self.stepList.append(loadStep)        
        loadStep.dataset = self.dataset
        loadStep.datasetName = self.datasetName        
 

    def topologicalSort(self):
        """
        Return steps in topologically sorted order. Subgraph of these 
        nodes must form a DAG.
        """
        sortedSteps = []  # Empty list that will contain the sorted nodes
        visitedSteps = set()
        foundDAGSteps = set()

        def visit(step: Step):
            if step in foundDAGSteps:
                return
            if step in visitedSteps:
                raise Exception("The steps are cyclic.")
            visitedSteps.add(step)
            for previousStep in step.previousSteps:
                visit(previousStep)
            foundDAGSteps.add(step)
            sortedSteps.append(step)
        visit(self.stepList[-1])
        self.stepList = sortedSteps
        
        # initialize steps attribute in workflowInfo
        self.steps = self.stepList
    
        self.currentStep = self.stepList[0]

    def moveToNextStep(self,step: Step):
        #if done, store the current outputs and move to the next step
        self.outputsStorage[step.stepId] = step.outputs
        stepIdx = self.stepList.index(step)
        
        step.isProceeding = False
        step.toExecute = False
        
        if self.stepList.index(self.currentStep) > stepIdx+1:
            # reconstruct the steps after the current step
            for i in range(stepIdx+1,len(self.stepList)):
                newStep = self.constructStep(self.configFile[i])
                self.stepList[i] = newStep
                self.outputsStorage[self.stepList[i].stepId] = {}
            self.steps = self.stepList

        self.currentStep = self.stepList[stepIdx+1]
        self.currentStep.isProceeding = True
        self.callStepForward(self.currentStep)

    def callStepForward(self,step: Step):
        if step.succeedPreviousStepOutput:
            # let step itself get its parameters from previous steps
            currentIdx = self.stepList.index(step)
            parameters = self.outputsStorage[self.stepList[currentIdx - 1].stepId]
            step.forward(**parameters)
        else:
            parameters = OrderedDict()
            
            stepIdx = self.stepList.index(step)
            
            # get parameters from previous steps
            for pconfig in step.previousSteps:
                #format: [string, string]
                found = False
                currentIdx = stepIdx - 1
                while not found and currentIdx >= 0:
                    currentObservingOutputs = self.outputsStorage[currentIdx]
                    if pconfig in currentObservingOutputs:             
                        found = True
                        parameters[pconfig] = currentObservingOutputs[pconfig]
                    currentIdx -= 1
            
            step.forward(**parameters)
             
    def updateWorkflowInfo(self, change = None):
        stepInfos = []
        for step in self.steps:
            stepInfo = {"stepId":step.stepId,"stepName":step.stepName,"stepType":step.stepType,"stepExplanation":step.stepExplanation,"done":step.done,"isProceeding":step.isProceeding,"toExecute":step.toExecute,"isShown":step.isShown,"config":step.config,"previousConfig":step.previousConfig,"groupConfig":step.groupConfig}
            stepInfos.append(stepInfo)
        flowInfos = []
        for flow in self.flows:
            flowInfo = {"sourceStepId":flow.sourceStepId,"targetStepId":flow.targetStepId}
            flowInfos.append(flowInfo)
        
        info = {"workflowName":self.workflowName,
                        "currentStepId":self.currentStepId,
                        "steps":stepInfos,
                        "flows":flowInfos}
        
        self.workflowInfo = info
        
    @tl.observe("workflowInfo")
    def onObserveWorkflowInfo(self, change):
        if change["old"] != change["new"]:
            workflowInfo = change["new"]
            if self.workflowName != workflowInfo["workflowName"]:
                self.workflowName = workflowInfo["workflowName"]
                self.isObservingWorkflowInfo = False
                return
            if self.currentStepId != workflowInfo["currentStepId"]:
                self.currentStepId = workflowInfo["currentStepId"]
                self.isObservingWorkflowInfo = False
                return
            
            for idx,stepInfo in enumerate(workflowInfo["steps"]):
                step = self.steps[idx]
                if step.isShown != stepInfo["isShown"]:
                    step.isShown = stepInfo["isShown"]
                    break
                if step.done != stepInfo["done"]:
                    step.done = stepInfo["done"]
                    break
                if step.toExecute != stepInfo["toExecute"]:
                    step.toExecute = stepInfo["toExecute"]
                    break
                configs = json.loads(json.dumps(stepInfo["config"]))
                if step.config != configs:
                    step.config = configs
                    break
    
    def constructStep(self, stepInfo: dict):
        cls = globals()[stepInfo["stepType"]]          
        parameters = {param:value for param,value in stepInfo["stepConfig"].items() if param != "previousStepsConfigs"}
        if stepInfo.get("stepExplanation") is not None:
            parameters["stepExplanation"] = stepInfo["stepExplanation"]
        step = cls(**parameters)
        step.stepId = stepInfo["id"]
        return step
    
    def constructSteps(self):        
        # construct all Steps
        for stepInfo in self.configFile:
            step = self.constructStep(stepInfo)
            self.stepList.append(step)                
                        
    def constructFlows(self):
        for config in self.configFile:
            currentStep = self.stepList[config["id"]]
            previousSteps = []
            for pconfig in config["stepConfig"]["previousStepsConfigs"]:
                previousSteps.append(self.stepList[pconfig["id"]])
            previousSteps = [self.stepList[pconfig["id"]] for pconfig in config["stepConfig"]["previousStepsConfigs"]]
            for previousStep in previousSteps:
                #update workflowInfo
                self.addFlow(previousStep,currentStep)
            currentStep.previousStepsConfigs = config["stepConfig"]["previousStepsConfigs"]
    
    def startGuiding(self):
        self.constructSteps()
        self.steps = self.stepList
        self.currentStep = self.stepList[0]
        
        self.updateWorkflowInfo(None)
        
        self.currentStep.isProceeding = True
        
        self.currentStep.forward()


if __name__ == "__main__":
    df = pd.read_csv("test.csv")
    workflow = WorkFlow(df,"Linear Regression")
    workflow.startGuiding()