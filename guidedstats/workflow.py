
from abc import abstractmethod
from typing import Iterable
import pandas as pd
from .step import *
import traitlets as tl
import copy as copy
import json
import inspect

_regressionConfig = [{"id": 1,
                      "stepType": "VariableSelectionStep",
                      "stepConfig": # This is for the initialization of Steps
                      {"stepName": "Select Dependent Variable",
                       "variableType": "dependent variable",
                       "variableNum": 1,
                       "candidateNum": 4,
                       "compare":  False,
                       "previousStepsConfigs": [{"id": 0, "mapping":[{"output":"__dataset","input":"dataset"}]}]}},
                    {"id": 2,
                      "stepType": "AssumptionCheckingStep",
                      "stepConfig":
                      {"stepName": "Check Outliers",
                       "assumptionName": "outlier",
                       "isRelaxed": True,
                       "previousStepsConfigs": [{"id": 1, "mapping":[{"output":"dataset","input":"X"}]}]}
                      },
                     {"id": 3,
                      "stepType": "VariableSelectionStep",
                      "stepConfig":
                      {"stepName": "Select Independent Variables",
                       "variableType": "independent variables",
                       # TBC, should be able to select different number of variables
                       "variableNum": 3,
                       "candidateNum": 15,
                       "compare": True,
                       "metricName": "pearson",
                       "previousStepsConfigs": [{"id": 0, "mapping":[{"output":"__dataset","input":"dataset"}]}, {"id": 1, "mapping":[{"output":"dataset","input":"referenceDataset"}]}],
                       }},
                     {"id": 4,
                      "stepType": "AssumptionCheckingStep",
                      "stepConfig":
                      {"stepName": "Check Outliers",
                       "assumptionName": "outlier",
                       "isRelaxed": True,
                       "previousStepsConfigs": [{"id": 3, "mapping":[{"output":"dataset","input":"X"}]}]}
                      },
                     {"id": 5,
                      "stepType": "TrainTestSplitStep",
                      "stepConfig":
                      {"stepName": "Do train test split",
                       "previousStepsConfigs": [{"id": 2, "mapping":[{"output":"dataset","input":"Y"}]}, {"id": 4, "mapping":[{"output":"dataset","input":"X"}]}]}
                      },
                     {"id": 6,
                      "stepType": "ModelStep",
                      "stepConfig":
                      {"stepName": "Train model",
                       "previousStepsConfigs": [{"id": 5, "mapping":[{"output":"XTrain","input": "X"},{"output":"yTrain","input":"Y"}]}]}},
                     {"id": 7,
                      "stepType": "EvaluationStep",
                      "stepConfig":
                      {"stepName": "Evaluate the model",
                       "previousStepsConfigs": [{"id": 5, "mapping":[{"output":"XTest","input": "X"},{"output":"yTest","input":"Y"}]}, {"id": 6, "mapping":[{"output":"model","input":"model"},{"output":"results","input":"results"}]}]}},
                     ]

class Flow(tl.HasTraits):
    sourceStepId = tl.Int().tag(sync=True)
    targetStepId = tl.Int().tag(sync=True)
    
    def __init__(self, sourceStepId, targetStepId):
        self.sourceStepId = sourceStepId
        self.targetStepId = targetStepId

class WorkFlow(tl.HasTraits):
    workflowName = tl.Unicode().tag(sync=True)
    currentStepId = tl.Int().tag(sync=True)
    # onProceeding = tl.Bool().tag(sync=True)
    _steps = tl.List(trait=tl.Instance(Step)).tag(sync=True)
    _flows = tl.List(trait=tl.Instance(Flow)).tag(sync=True)
    workflowInfo = tl.Dict({}).tag(sync=True)
    
    def __init__(self, dataset: pd.DataFrame, workflowName="workflow", datasetName="dataset"):
        
        self.workflowName = workflowName
        self.dataset = dataset
        self.datasetName = datasetName
        self.stepList = []
        
        #step-related state variable
        self.loadStep = None
        self.currentStep = None
        
        self.observingWorkflowInfo = False
        self.updatingWorkflowInfo = False
        # self.onProceeding = False
        self.loadData()

        #initialize workflowInfo
        self.workflowInfo = {"workflowName":self.workflowName,
                             "currentStepId":self.currentStepId,
                            #  "onProceeding":self.onProceeding,
                             "steps":[],
                             "flows":[]}
        
        self.outputsStorage = {}
        
        # self.observe(self.updateWorkflowInfo,names=["workflowName","currentStepId","onProceeding"])
        self.observe(self.updateWorkflowInfo,names=["workflowName","currentStepId"])
    
    @property
    def steps(self):
        return self._steps

    @steps.setter
    def steps(self, value):
        # Unobserve old steps
        for step in self._steps:
            step.unobserve(self.updateWorkflowInfo,names=["stepId","stepName","stepType","done","isShown","config"])
        # Set the new steps
        self._steps = value
        # Observe new steps
        for step in self._steps:
            step.workflow = self
            step.observe(self.updateWorkflowInfo,names=["stepId","stepName","stepType","done","isShown","config"])
            
    def addStep(self, step):
        self._steps.append(step)
        step.observe(self.updateWorkflowInfo,names=["stepId","stepName","stepType","done","isShown","config"])
            
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

    def moveToNextStep(self):
        #if done, store the current outputs and move to the next step
        # if change["name"] == "done" and change["old"] == False and change["new"] == True:
        print("moveToNextStep")
        print(self.currentStep)
        print(self.currentStep.outputs)
        self.outputsStorage[self.currentStep.stepId] = self.currentStep.outputs
        currentIdx = self.stepList.index(self.currentStep)
        self.currentStep = self.stepList[currentIdx+1]
            
        parameters = {}
        for pconfig in self.currentStep.previousStepsConfigs:
            # format: [{"id": 0, "mapping":[{"output":"__dataset","input":"dataset"}]}]
            for mapping in pconfig["mapping"]:
                # format: {"output":"__dataset","input":"dataset"}
                print(self.outputsStorage)
                print(pconfig["id"])
                parameters[mapping["input"]] = self.outputsStorage[pconfig["id"]][mapping["output"]]
        
        with open("test.txt","a+") as f:
            f.write("moveToNextStep: " + str(self.currentStep))
            f.write(str(parameters))
        
        self.currentStep.forward(**parameters)    
             
    def updateWorkflowInfo(self, change):
        self.updateWorkflowInfo = True
        with open("test.txt","a+") as f:    
            f.write("called updateWorkflowInfo, self.observingWorkflowInfo: "+str(self.observingWorkflowInfo)+", owner: "+str(change["owner"]) +", change: "+str(change))
            f.write("\n")
            # f.write("check open channel: "+str(self.onProceeding))
            # f.write("\n")
        # if not self.observingWorkflowInfo:
        if change["old"] != change["new"]:
            with open("test.txt","a+") as f:    
                f.write("updateWorkflowInfo: " + str(change))
                f.write("\n")
                f.write(str(self.workflowInfo))
                f.write("\n")
                # f.write("last 10 commands: \n")
                # f.write(show_history())               
                # f.write("\n")
                current_frame = inspect.currentframe()
                frames = inspect.getouterframes(current_frame)
                functions = []
                for i, record in enumerate(frames[1:19]):  # Skip the current frame and get the next 5 frames
                    _, _, _, function, _, _ = record
                    functions.append(function)
                f.write("called by: "+str(",".join(functions)))
                f.write("\n")
                
            # info = copy.deepcopy(self.workflowInfo)
            # if change["name"] == "workflowName":
            #     info["workflowName"] = change["new"]
            #     self.workflowInfo = info
            # elif change["name"] == "currentStepId":
            #     info["currentStepId"] = change["new"]
            #     self.workflowInfo = info
            # elif change["name"] == "onProceeding":
            #     info["onProceeding"] = change["new"]
            #     self.workflowInfo = info
            # else:
                # stepInfos = []
                # for stepInfo in info["steps"]:
                #     if change["owner"].stepId == stepInfo["stepId"]:
                #         sinfo = copy.deepcopy(stepInfo)
                #         sinfo["name"] = change["new"]
                #         stepInfos.append(sinfo)
                #     else:
                #         stepInfos.append(stepInfo)
                stepInfos = []
                for step in self.steps:
                    stepInfo = {"stepId":step.stepId,"stepName":step.stepName,"stepType":step.stepType,"done":step.done,"isShown":step.isShown,"config":step.config}
                    stepInfos.append(stepInfo)
                flowInfos = []
                for flow in self.flows:
                    flowInfo = {"sourceStepId":flow.sourceStepId,"targetStepId":flow.targetStepId}
                    flowInfos.append(flowInfo)
                    
                f.write(str({"workflowName":self.workflowName,
                                "currentStepId":self.currentStepId,
                                # "onProceeding":self.onProceeding,
                                "steps":stepInfos,
                                "flows":flowInfos}))
                f.write("\n")
                self.workflowInfo = {"workflowName":self.workflowName,
                                "currentStepId":self.currentStepId,
                                # "onProceeding":self.onProceeding,
                                "steps":stepInfos,
                                "flows":flowInfos}
                
                               
            # stepInfos = []
            # for step in self.steps:
            #     stepInfo = {"stepId":step.stepId,"stepName":step.stepName,"stepType":step.stepType,"done":step.done,"isShown":step.isShown,"config":step.config}
            #     stepInfos.append(stepInfo)
                
            # flowInfos = []
            # for flow in self.flows:
            #     flowInfo = {"sourceStepId":flow.sourceStepId,"targetStepId":flow.targetStepId}
            #     flowInfos.append(flowInfo)
                
            # self.workflowInfo = {"workflowName":self.workflowName,
            #                     "currentStepId":self.currentStepId,
            #                     "onProceeding":self.onProceeding,
            #                     "steps":stepInfos,
            #                     "flows":flowInfos}
        self.updateWorkflowInfo = False
        
    @tl.observe("workflowInfo")
    def onObserveWorkflowInfo(self, change):
        self.observingWorkflowInfo = True
        # if not self.updatingWorkflowInfo:
        if change["old"] != change["new"]:
            with open("test.txt","a+") as f:
                f.write("onObserveWorkflowInfo: " + str(change))
                f.write("\n")
                current_frame = inspect.currentframe()
                frames = inspect.getouterframes(current_frame)
                functions = []
                for i, record in enumerate(frames[1:19]):  # Skip the current frame and get the next 5 frames
                    _, _, _, function, _, _ = record
                    functions.append(function)
                f.write("called by: "+str(",".join(functions)))
                f.write("\n")
            # print("check workflowInfo")
            # print(change)
            # if len(self.stepList) > 2:
            #     print(self.stepList[2].__dict__)
            # print("check workflowInfo")
            workflowInfo = change["new"]
            if self.workflowName != workflowInfo["workflowName"]:
                self.workflowName = workflowInfo["workflowName"]
                return
            if self.currentStepId != workflowInfo["currentStepId"]:
                self.currentStepId = workflowInfo["currentStepId"]
                return
            
            for idx,stepInfo in enumerate(workflowInfo["steps"]):
                step = self.steps[idx]
                if step.isShown != stepInfo["isShown"]:
                    step.isShown = stepInfo["isShown"]
                    break
                if step.done != stepInfo["done"]:
                    step.done = stepInfo["done"]
                    break
                configs = json.loads(json.dumps(stepInfo["config"]))
                if step.config != configs:
                    step.config = configs
                    break
                # step.onObserveConfig({"new":configs})
            # for idx,flowInfo in enumerate(workflowInfo["flows"]):
            #     flow = self.flows[idx]
            #     flow.sourceStepId = flowInfo["sourceStepId"]
            #     flow.targetStepId = flowInfo["targetStepId"]
        self.observingWorkflowInfo = False
                   
    def constructSteps(self):        
        # construct all Steps
        for config in _regressionConfig:
            cls = globals()[config["stepType"]]
            parameters = {param:value for param,value in config["stepConfig"].items() if param != "previousStepsConfigs"}
            step = cls(**parameters)
            step.stepId = config["id"]
            self.stepList.append(step)
                
                        
    def constructFlows(self):
        for config in _regressionConfig:
            currentStep = self.stepList[config["id"]]
            previousSteps = []
            for pconfig in config["stepConfig"]["previousStepsConfigs"]:
                previousSteps.append(self.stepList[pconfig["id"]])
            previousSteps = [self.stepList[pconfig["id"]] for pconfig in config["stepConfig"]["previousStepsConfigs"]]
            for previousStep in previousSteps:
                #update workflowInfo
                self.addFlow(previousStep,currentStep)
            currentStep.previousStepsConfigs = config["stepConfig"]["previousStepsConfigs"]
    
    @abstractmethod
    def startGuiding(self):
        pass

class RegressionFlow(WorkFlow):

    def __init__(self, dataset: pd.DataFrame, workflowName="Regression workflow",datasetName="dataset"):
        super().__init__(dataset, workflowName=workflowName, datasetName=datasetName)

    def startGuiding(self):
        #1. construct Steps
        self.constructSteps()
        # At this stage, all Steps are sorted in the order of their ids
        #2. construct all flows
        self.constructFlows()
        #3. sort Steps in topological order
        self.topologicalSort()   
        #4. start guiding
        print("Hey, welcome to GuidedStats. In the following parts, we will guide you to perform {}".format(self.workflowName))

        parameters = {}
        for pconfig in self.currentStep.previousStepsConfigs:
            # format: [{"id": 0, "mapping":[{"output":"__dataset","input":"dataset"}]}]
            for mapping in pconfig["mapping"]:
                # format: {"output":"__dataset","input":"dataset"}
                parameters[mapping["input"]] = self.outputsStorage[pconfig["id"]][mapping["output"]]
    
        self.currentStep.forward(**parameters)    

if __name__ == "__main__":
    df = pd.read_csv("test.csv")
    workflow = RegressionFlow(df,"regression")
    workflow.startGuiding()
