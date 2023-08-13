
from abc import abstractmethod
import pandas as pd
from .step import *

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
                       "previousStepsConfigs": [{"id": 5, "mapping":[{"output":"XTest","input": "X"},{"output":"yTest","input":"Y"}]}, {"id": 6, "mapping":[{"output":"model","input":"model"}]}]}},
                     ]


class WorkFlow(object):

    def __init__(self, dataset: pd.DataFrame, workflowName="workflow"):
        self.workflowName = workflowName
        self.dataset = dataset
        self.stepList = []
        
        #step-related state variable
        self.loadStep = None
        self.lastStep = None
        self.currentStep = None
        
        self.loadData()
        
        self.workflowInfo = {
            "workflowName": self.workflowName,
            "dataset": self.dataset,
            "currentStepNum": 1,
            "steps":[],
            "flows":[]
        }

    
    def loadData(self):
        """
            Mandatory Step for every workflow, load the dataset by initializing a LoadDatasetStep
        """
        loadStep = LoadDatasetStep(stepId=0)
        self.stepList.append(loadStep)
        self.lastStep = loadStep
        self.currentStep = loadStep
        loadStep.dataset = self.dataset        

    def addFlow(self, lastStep: Step, newStep: Step):
        # TBC, should check the coupling
        newStep.previousSteps.append(lastStep)
        currentStep.previousStepsConfigs = config["stepConfig"]["previousStepsConfigs"]
        self.workflowInfo["flows"].append({"sourceStepId":lastStep.stepId,"targetStepId":newStep.stepId})

    def deleteFlow(self, lastStep: Step, newStep: Step):
        # TBC, should check the coupling
        newStep.previousSteps.remove(lastStep)
        self.workflowInfo["flows"].remove({"sourceStepId":lastStep.stepId,"targetStepId":newStep.stepId})
        

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
        visit(self.lastStep)
        self.stepList = sortedSteps
        self.lastStep = self.stepList[-1]

    def constructSteps(self):        
        # construct all Steps
        for config in _regressionConfig:
            cls = globals()[config["stepType"]]
            parameters = {param:value for param,value in config["stepConfig"].items() if param != "previousStepsConfigs"}
            step = cls(**parameters)
            step.stepId = config["id"]
            self.stepList.append(step)
            self.lastStep = step
            
            
    def constructFlows(self):
        for config in _regressionConfig:
            currentStep = self.stepList[config["id"]]
            previousSteps = []
            for pconfig in config["stepConfig"]["previousStepsConfigs"]:
                previousSteps.append(self.stepList[pconfig["id"]])
            previousSteps = [self.stepList[pconfig["id"]] for pconfig in config["stepConfig"]["previousStepsConfigs"]]
            for previousStep in previousSteps:
                self.addFlow(previousStep,currentStep)
            currentStep.previousStepsConfigs = config["stepConfig"]["previousStepsConfigs"]
    
    @abstractmethod
    def startGuiding(self):
        pass

class RegressionFlow(WorkFlow):

    def __init__(self, dataset: pd.DataFrame, workflowName="Regression workflow"):
        super().__init__(dataset, workflowName)

    def startGuiding(self):
        #1. construct Steps
        self.constructSteps()
        # At this stage, all Steps are sorted in the order of their ids
        #2. construct all flows
        self.constructFlows()
        #3. sort Steps in topological order
        self.topologicalSort()   
        #4. start guiding
        outputsStorage = {}
        print("Hey, welcome to GuidedStats. In the following parts, we will guide you to perform {}".format(self.workflowName))
        for count,step in enumerate(self.stepList):
            #check its previousStepConfigs
            parameters = {}
            for pconfig in step.previousStepsConfigs:
                # [{"id": 0, "mapping":[{"output":"__dataset","input":"dataset"}]}]
                for mapping in pconfig["mapping"]:
                    # {"output":"__dataset","input":"dataset"}
                    parameters[mapping["input"]] = outputsStorage[pconfig["id"]][mapping["output"]]

            print("------------ Step {} ------------".format(count+1))
            outputs = step.forward(**parameters)
            outputsStorage[step.stepId] = outputs
            
        


if __name__ == "__main__":
    df = pd.read_csv("test.csv")
    workflow = RegressionFlow(df,"regression")
    workflow.startGuiding()
