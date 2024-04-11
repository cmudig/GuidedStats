
from collections import OrderedDict
from typing import Iterable
import pandas as pd
import traitlets as tl
import copy as copy
import json

from .step import *

from .config import _regressionConfig, _ttestConfig


class WorkFlow(tl.HasTraits):
    workflowName = tl.Unicode()
    currentStepId = tl.Int().tag(sync=True)
    message = tl.Unicode().tag(sync=True)
    report = tl.Unicode().tag(sync=True)
    _steps = tl.List(trait=tl.Instance(Step)).tag(sync=True)
    workflowInfo = tl.Dict({}).tag(sync=True)

    def __init__(self, dataset: pd.DataFrame, workflowName="workflow", datasetName="dataset"):

        self.workflowName = workflowName
        self.dataset = copy.deepcopy(dataset)
        self.datasetName = datasetName
        self.stepList = []

        # export related state variables
        self.current_dataframe = None
        self.current_model = None

        # step-related state variables
        self.loadStep = None
        self.currentStep = None

        # workflow-related state variables
        self.isObservingWorkflowInfo = False
        self.isUpdatingWorkflowInfo = False

        # initialize workflowInfo
        self.workflowInfo = {"workflowName": self.workflowName,
                             "currentStepId": self.currentStepId,
                             "message": "",
                             "report": "",
                             "steps": []}

        self.outputsStorage = {}

        self.observe(self.updateWorkflowInfo, names=[
                     "workflowName", "currentStepId","message","report"])

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
            step.unobserve(self.updateWorkflowInfo, names=["stepId", "stepName", "stepType", "stepExplanation", "suggestions",
                           "done", "isProceeding", "toExecute", "isShown", "config", "previousConfig", "groupConfig","message"])
        # Set the new steps
        self._steps = value
        # Observe new steps
        for step in self._steps:
            step.workflow = self
            step.observe(self.updateWorkflowInfo, names=["stepId", "stepName", "stepType", "stepExplanation", "suggestions",
                         "done", "isProceeding", "toExecute", "isShown", "config", "previousConfig", "groupConfig","message"])

    def loadData(self):
        """
            Mandatory Step for every workflow, load the dataset by initializing a LoadDatasetStep
        """
        loadStep = LoadDatasetStep(stepId=0)
        loadStep.workflow = self
        self.stepList.append(loadStep)
        loadStep.dataset = self.dataset
        loadStep.datasetName = self.datasetName
        
    def exportCode(self, step_no=None, export_viz_func = False, **kwargs):
        stp_no = step_no
        #export all steps
        if stp_no is None:    
            code = ""
            for step in self.steps:
                if step.done or step.isProceeding:
                    code += step.export(export_viz_func = export_viz_func, **kwargs)
            return code
        #export specific step
        if isinstance(stp_no, int):
            if self.steps.index(self.currentStep) + 1 < stp_no or stp_no <= 0:
                raise ValueError("Invalid step number")
            code = ""
            step = self.steps[stp_no-1]
            code += step.export(export_viz_func = export_viz_func, **kwargs)
            return code
        #export steps in a range
        if isinstance(stp_no, Iterable):
            if any([ self.steps.index(self.currentStep) + 1 < stp or stp <= 0 for stp in stp_no]):
                raise ValueError("Invalid step numbers")
            stp_no = sorted(list(set(stp_no)))
            code = ""
            for stp in stp_no:
                step = self.steps[stp-1]
                code += step.export(export_viz_func = export_viz_func, **kwargs)
            return code    
    
    def moveToNextStep(self, step: Step):
        # if done, store the current outputs and move to the next step
        self.outputsStorage[step.stepId] = step.outputs
        stepIdx = self.stepList.index(step)

        step.isProceeding = False
        step.toExecute = False

        # if the current step is farther than the next step
        if self.stepList.index(self.currentStep) > stepIdx+1:
            next_step = self.stepList[stepIdx+1]
            self.callStepForward(next_step)
            next_step.rerun()
            # reconstruct the steps after the current step
            # for i in range(stepIdx+1, len(self.stepList)):
            #     newStep = self.constructStep(self.configFile[i])
            #     self.stepList[i] = newStep
            #     self.outputsStorage[self.stepList[i].stepId] = {}
            # self.steps = self.stepList
        else:         
            self.currentStep = self.stepList[stepIdx+1]
            self.currentStep.isProceeding = True
            self.callStepForward(self.currentStep)

    def callStepForward(self, step: Step):
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
                # format: [string, string]
                found = False
                currentIdx = stepIdx - 1
                while not found and currentIdx >= 0:
                    currentObservingOutputs = self.outputsStorage[currentIdx]
                    if pconfig in currentObservingOutputs:
                        found = True
                        parameters[pconfig] = currentObservingOutputs[pconfig]
                    currentIdx -= 1

            step.forward(**parameters)

    def updateWorkflowInfo(self, change=None):
        stepInfos = []
        for step in self.steps:
            stepInfo = {"stepId": step.stepId, "stepName": step.stepName, "stepType": step.stepType, "stepExplanation": step.stepExplanation, "suggestions": step.suggestions, "done": step.done, "isProceeding": step.isProceeding,
                        "toExecute": step.toExecute, "isShown": step.isShown, "config": step.config, "previousConfig": step.previousConfig, "groupConfig": step.groupConfig, "message": step.message}
            stepInfos.append(stepInfo)

        info = {"workflowName": self.workflowName,
                "currentStepId": self.currentStepId,
                "message": self.message,
                "report": self.report,
                "steps": stepInfos}

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
            if self.message != workflowInfo["message"]:
                self.message = workflowInfo["message"]
                self.isObservingWorkflowInfo = False
                return
            if self.report != workflowInfo["report"]:
                self.report = workflowInfo["report"]
                self.isObservingWorkflowInfo = False
                return

            for idx, stepInfo in enumerate(workflowInfo["steps"]):
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
                if step.message != stepInfo["message"]:
                    step.message = stepInfo["message"]
                    break
        
    def importDataset(self, data: pd.DataFrame):
        self.dataset = data
        self.current_dataframe = data
        loadStep = self.steps[0]
        loadStep.forward()
        #set alert message to workflow
        self.message = "New data imported, GuidedStats will rerun the workflow from the beginning."

    def constructStep(self, stepInfo: dict):
        cls = globals()[stepInfo["stepType"]]
        parameters = {param: value for param, value in stepInfo["stepConfig"].items(
        ) if param != "previousStepsConfigs"}
        if stepInfo.get("stepExplanation") is not None:
            parameters["stepExplanation"] = stepInfo["stepExplanation"]
        if stepInfo.get("suggestions") is not None:
            parameters["suggestions"] = stepInfo["suggestions"]
        step = cls(**parameters)
        step.stepId = stepInfo["id"]
        return step

    def constructSteps(self):
        # construct all Steps
        for stepInfo in self.configFile:
            step = self.constructStep(stepInfo)
            self.stepList.append(step)

    def startGuiding(self):
        self.constructSteps()
        self.steps = self.stepList
        self.currentStep = self.stepList[0]

        self.updateWorkflowInfo(None)

        self.currentStep.isProceeding = True

        self.currentStep.forward()


if __name__ == "__main__":
    df = pd.read_csv("test.csv")
    workflow = WorkFlow(df, "Linear Regression")
    workflow.startGuiding()
