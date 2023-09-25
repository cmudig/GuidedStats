from abc import abstractmethod
import inspect
import sys
import copy
import random
from typing import Any, Callable
import traitlets as tl
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn import linear_model
import statsmodels.api as sm
from statsmodels.tools.eval_measures import mse
from .metrics import MetricWrapper
from .assumptions import AssumptionWrapper



quantitative_dtypes = ['float32', 'float64', 'int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64']


transformations = {
    "log": lambda x:np.log(x+1) 
}

class Config(tl.HasTraits):
    dataset = tl.Unicode("").tag(sync=True);
    metric = tl.Unicode("").tag(sync=True);
    transformation = tl.Unicode("").tag(sync=True);
    variableName = tl.Unicode("").tag(sync=True);
    variableCandidates = tl.List([]).tag(sync=True);
    variableResults = tl.List([]).tag(sync=True);
    assumptionName = tl.Unicode("").tag(sync=True);
    modelName = tl.Unicode("").tag(sync=True);
    modelCandidates = tl.List([]).tag(sync=True);
    modelResults = tl.List([]).tag(sync=True);
    
class Step(tl.HasTraits):
    stepId = tl.Int().tag(sync=True)
    stepName = tl.Unicode().tag(sync=True)
    stepType = tl.Unicode().tag(sync=True)
    done = tl.Bool(False).tag(sync=True)
    isShown = tl.Bool(False).tag(sync=True)
    # configInstance = tl.Instance(Config)
    config = tl.Dict({}).tag(sync=True)
    # stepInfo = tl.Dict({})
    """
    base class
    """
    def __init__(self,stepId:int= None,stepName="step",succeedLastStepOutput=False,previousSteps:list=None,**kwargs):
                
        # state variables of Step
        if stepId is not None:
            self.stepId = stepId
        self.stepName = stepName
        self.stepType = self.__class__.__name__
        self.done = False
        self.isShown = False
        
        #back-end state
        self.inputs = {}
        self.outputs = {}
        
        self.registered_functions = []
                
        self._workflow = None
        
        if previousSteps is None:
            self._previousSteps = []
        else:
            self._previousSteps = previousSteps
        
        self.succeedLastStepOutput = succeedLastStepOutput
    
    @property
    def previousSteps(self):
        return self._previousSteps
            
    @previousSteps.setter
    def previousSteps(self,previousSteps:list):
        if not isinstance(previousSteps,list):
            raise TypeError("previousSteps should be a list of Step")
        self._previousSteps = previousSteps
        
    @property
    def workflow(self):
        return self._workflow
    
    @workflow.setter
    def workflow(self,workflow):
        self._workflow = workflow
    
    #utils function
    def changeConfig(self,key,value):
        tmp = copy.deepcopy(self.config)
        tmp[key] = value
        with open("test.txt","a+") as file:
            file.write("on changing config: "+ str(self.config))
            file.write("\n")
        self.config = tmp
        
    @abstractmethod
    def onObserveConfig(self,change):
        pass      
    
    def moveToNextStep(self):
        self.workflow.moveToNextStep(self)
   
    @abstractmethod
    def forward(self):
        """
        execute the current step and move forward
        """
        pass
    
    @abstractmethod
    # register the functions used in rerunning the step
    def register(self,function):
        pass
    
    @abstractmethod
    # clear all inputs from UI
    def clearUIinputs(self):
        pass
        
    
    # def updateStepInfo(self,change):
    #     self.stepInfo = {"stepId":self.stepId,"stepName":self.stepName,"stepType":self.stepType,"done":self.done,"isShown":self.isShown,"config":self.config}

class GuidedStep(Step):
    """
        GuidedStep suggests potentially insightful column(s) based on selected metrics
    """
    def __init__(self, stepId: int = None, stepName="step", succeedLastStepOutput=False, previousSteps: list = None, compare: bool = False, metricName:str=None):
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self._compare = compare
        
        self.succeedLastStepOutput = succeedLastStepOutput
        if metricName is not None:
            self.metric = MetricWrapper()
            self.metric.setMetric(metricName)
            
            self.changeConfig("metric",metricName)
    
    #Utils function
    def computeMetric(self,dataframe:pd.DataFrame,column:str,*referenceColumns:str):
        X = dataframe[column]
        referenceXs = [dataframe[col] for col in referenceColumns]
        return self.metric.compute(X,*referenceXs)
        
    def compare(self,dataframe:pd.DataFrame,columns:list,k:int=1,*referenceColumns:str):
        """
            Return the top-k highest column(s) based on the metric
        """
        print(dataframe,columns,k,referenceColumns)
        results = []
        for column in columns:
            if column not in referenceColumns: #referenceColumns is the dependent variable
                if dataframe[column].dtype in quantitative_dtypes:
                #the constraint should be relaxed for other types of variables
                    result = {"name":column}
                    outputs = self.computeMetric(dataframe,column,*referenceColumns)
                    result["score"] = outputs["statistics"]
                    if "pvalue" in outputs:
                        pvalue = outputs["pvalue"]
                        result["pvalue"] = pvalue
                    #TBC, here only consider correlation
                    results.append(result)
        descendingColumns = sorted(results,key=lambda x:abs(x["score"]),reverse=True)
        return descendingColumns[0:min(len(descendingColumns),k)]

#Define Step that get the outputs of the previous step
class SucccessorStep(Step):
    def __init__(self, stepId: int = None, stepName="step", succeedLastStepOutput=True, previousSteps: list = None):
        succeedLastStepOutput = True
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self.succeedLastStepOutput = succeedLastStepOutput
    
    def getPreviousOutputs(self):
        currentStepIdx = self.workflow.stepList.index(self)
        return self.workflow.stepList[currentStepIdx-1].outputs

class DataTransformationStep(SucccessorStep):
    def __init__(self, stepId: int = None, stepName="Data Transformation",  succeedLastStepOutput=True, previousSteps: list = None):
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self._transformation = None
        self._transformationName = None
        self.selfDefinedTransformations = {}
        self.succeedLastStepOutput = succeedLastStepOutput
        
    def clearUIinputs(self):
        self.config.pop("variableCandidates",None)
        self.config.pop("transformationName",None)
        self.config.pop("variableResults",None)
        
    @tl.observe("config")
    def setTransformation(self,change):
        """
        Args:
            transformationName (str):  the name of transformation
            transformation (Callable): a column-wise transformation applied 
        """
        #TBC, should check the output type
        hasTransformationName = "transformationName" in change["new"] and change["new"]["transformationName"] is not None
        hasVariableResults = "variableResults" in change["new"] and change["new"]["variableResults"] is not None
        if hasTransformationName and hasVariableResults:
            transformationName = change["new"]["transformationName"]
            self._transformation = transformations[transformationName]
            self._transformationName = transformationName
        
            variableResults = self.config["variableResults"]
            col = variableResults[0]["name"]
            self.inputs["dataset"][col] = self._transformation(self.inputs["dataset"][col])
            
            outputs = self.getPreviousOutputs()
            
            outputs[list(outputs.keys())[0]] = self.inputs["dataset"]
            
            self.outputs = outputs
            
            self.done = True
            
    def forward(self):
        #check whether setTransformation has been called previously

        outputs = self.getPreviousOutputs()
        self.inputs["dataset"] = outputs[list(outputs.keys())[0]]
        
        variableCandidates = [{"name": col} for col in self.inputs["dataset"].columns]
        self.changeConfig("variableCandidates",variableCandidates)
    
        
class LoadDatasetStep(Step):
    
    def __init__(self, stepId: int = None, stepName="Load Dataset", succeedLastStepOutput=False, previousSteps: list = None):
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self._dataset = None
        self._datasetName = None
        self.succeedLastStepOutput = succeedLastStepOutput
        
    @property
    def dataset(self):
        return self._dataset

    @dataset.setter
    def dataset(self,dataset:pd.DataFrame):
        self._dataset = dataset
        
    @property
    def datasetName(self):
        return self._datasetName
    
    @datasetName.setter
    def datasetName(self,datasetName:str):
        self._datasetName = datasetName
        self.changeConfig("dataset",datasetName)
     
    def forward(self):
        
        self.dataset = self.workflow.dataset
        self.datasetName = self.workflow.datasetName
        
        self.outputs = {"dataset":self.dataset}
        self.done = True
        self.moveToNextStep()
    
class VariableSelectionStep(GuidedStep):
    
    def __init__(self, variableType:str, variableNum=1, candidateNum=4, stepId: int = None, stepName="Select Variable(s)",  succeedLastStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None):
        if variableType == "independent":
            previousSteps = ["dataset","referenceDataset"]
        elif variableType == "dependent":
            previousSteps = ["dataset"]
        print(previousSteps)
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps, compare, metricName)
        #TBC, we should allow undecided number of variables
        self._variableType = variableType
        self.variableNum = variableNum
        self.candidateNum = candidateNum
        
        self.succeedLastStepOutput = succeedLastStepOutput

        self.changeConfig("variableName",variableType)
        
    def clearUIinputs(self):
        self.config.pop("variableCandidates",None)
        self.config.pop("variableResults",None)
        
    def findVariableCandidates(self,dataset:pd.DataFrame,referenceDataset:pd.DataFrame=None) -> pd.DataFrame:
        print("findVariableCandidates")
        if self._compare:
            if referenceDataset is not None:
                self.changeConfig("referenceVariables",list(referenceDataset.columns))
                candidateColumns = self.compare(dataset,dataset.columns,self.candidateNum,*referenceDataset.columns)

            else:
                candidateColumns = self.compare(dataset,dataset.columns,self.candidateNum)
            print(candidateColumns)
        else:
            candidateColumns = [{"name":col} for col in dataset.columns]
        self.changeConfig("variableCandidates",candidateColumns)
        # self.workflow.onProceeding = False
    
    @tl.observe("config")
    def onObserveConfig(self,change):
        if "variableResults" in change["new"] and len(change["new"]["variableResults"]) != 0:
            # self.workflow.onProceeding = True
            selectedColumns = [result["name"] for result in change["new"]["variableResults"]]
            subset = self.inputs["dataset"][selectedColumns]
            if len(subset.columns) > 1:
                self.outputs = {"X":subset, "referenceDataset":self.inputs["referenceDataset"]}
            else:
                self.outputs = {"Y":subset, "referenceDataset":subset}
            print("last stage of variable selection")
            print(self.outputs)
            with open("./test.txt","a+") as file:
                file.write("on observing variable selection step's config: "+ str(self.config))
                file.write("\n")
            self.done = True
            print(self.done)
            
            self.moveToNextStep()
            
    def forward(self,dataset:pd.DataFrame,referenceDataset:pd.DataFrame=None) -> pd.DataFrame:
        #TBC, independent variables should correlate with dependent variable
        #TBC, the type of selected variable should be checked before any further steps
        #TBC, should do shallow copy to reduce memory usage
        print("move to VariableSelectionStep")
        self.inputs = {"dataset":dataset,"referenceDataset":referenceDataset}
        self.findVariableCandidates(dataset,referenceDataset)        
        
class AssumptionCheckingStep(SucccessorStep):

    def __init__(self, stepId: int = None, stepName="Check Assumption", succeedLastStepOutput=True, previousSteps: list = None, assumptionName:str = None, isRelaxed:bool = True):
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self.isRelaxed = isRelaxed
        self.succeedLastStepOutput = succeedLastStepOutput
        # TBC, if relaxed is True, then even the assumption does not meet the proess will continue 
        
        self.assumption = None
        
        self.observe(self.onObserveConfig,names=["config"])
        if assumptionName is not None:
            self.changeConfig("assumptionName",assumptionName)

    def clearUIinputs(self):
        self.config.pop("assumptionResults",None)
        self.config.pop("viz",None)
        
    @tl.observe("done")
    def onObserveDone(self,change):
        if change["old"] == False and change["new"] == True:
            with open("./test.txt","a+") as file:
                file.write("assumption done, config: "+ str(self.config))
                file.write("\n")
                file.write("workflow: "+ str(self.workflow))
                file.write("\n")
            
            #if approved, pass the same outputs to the next step
            self.outputs = self.getPreviousOutputs()
            
            self.moveToNextStep()

    @tl.observe("config")
    def onObserveConfig(self, change):
        if "assumptionName" in self.config and self.config["assumptionName"] is not None:
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(self.config["assumptionName"])
        
        if self.workflow is not None and self.workflow.currentStep is not None and self.workflow.currentStep == self:
            self.checkAssumption(self.inputs["X"],*self.inputs["referenceXs"])
    
    def checkAssumption(self,X:pd.DataFrame,*referenceXs:pd.DataFrame):
        #2. check assumption
        if "referenceXs" in self.inputs:
            assumptionResults,viz = self.assumption.checkAssumption(self.inputs["X"],*self.inputs["referenceXs"])
        else:
            assumptionResults,viz = self.assumption.checkAssumption(self.inputs["X"])
        #3. set config
        self.changeConfig("assumptionResults",assumptionResults)
        self.changeConfig("viz", viz)
        with open("./test.txt","a+") as file:
            file.write("on observing assumption checking step's config: "+ str(self.config))
            file.write("\n")
    
    def forward(self):
        #1. get outputs from previous step, and assign it as the current input
        outputs = self.getPreviousOutputs()
        outputValues = list(outputs.values())
        self.inputs["X"] = outputValues[0]
        if len(outputs.items()) > 1:
            self.inputs["referenceXs"] = outputValues[1]
        
        if self.assumption is not None:
            if self.workflow is not None and self.workflow.currentStep is not None and self.workflow.currentStep == self:
                self.checkAssumption(self.inputs["X"],*self.inputs["referenceXs"])
            
class TrainTestSplitStep(Step):
    """
        temporary class, maybe changed to 
    """
    
    def __init__(self, stepId: int = None, stepName="Train Test Split",  succeedLastStepOutput=False, previousSteps: list = None):
        previousSteps = ["X","Y"]
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps)
        self.succeedLastStepOutput = succeedLastStepOutput
    
    def clearUIinputs(self):
        self.config.pop("trainSize",None)
        
    @tl.observe("config")
    def onObserveConfig(self,change):
        if "trainSize" in change["new"]:
            print("check")
            trainSize = change["new"]["trainSize"]
            #TBC trainSize should be checked
            valSize = (1-trainSize)/2
            
            X = self.inputs["X"]
            Y = self.inputs["Y"]
            indices = np.arange(len(X))
            np.random.shuffle(indices)
            train_indices = indices[:int(len(indices)*float(trainSize))]
            validation_indices = indices[int(len(indices)*float(trainSize)):int(len(indices)*(float(trainSize)+float(valSize)))]
            test_indices = indices[int(len(indices)*(float(trainSize)+float(valSize))):]
                
            XTrain = X.iloc[train_indices]
            XVal = X.iloc[validation_indices]
            XTest = X.iloc[test_indices]
            yTrain = Y.iloc[train_indices]
            yVal = Y.iloc[validation_indices]
            yTest = Y.iloc[test_indices]
            
            self.outputs = {"XTrain":XTrain, "XVal":XVal, "XTest":XTest, "yTrain":yTrain, "yVal":yVal, "yTest":yTest}
            self.done = True
            
            self.moveToNextStep()
        
    def forward(self,X:pd.DataFrame,Y:pd.DataFrame):
        self.inputs = {"X":X,"Y":Y}

class ModelStep(GuidedStep):
    
    def __init__(self, stepId: int = None, stepName="Train Model", succeedLastStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None):
        previousSteps = ["XTrain","yTrain"]
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps, compare, metricName)
        #TBC, should allow more types of models and hyperparameter search
        self.model = None
        self.succeedLastStepOutput = succeedLastStepOutput
    
    def clearUIinputs(self):
        self.config.pop("modelName",None)
    
    @tl.observe("config")
    def onObserveConfig(self,change): 
        if "modelName" in change["new"]:
            X_wconstant = sm.add_constant(self.inputs["X"])
            if change["new"]["modelName"] == "simple":
                self.model = sm.OLS(self.inputs["Y"], X_wconstant)
                results = self.model.fit()
            elif change["new"]["modelName"] == "ridge":
                self.model = sm.OLS(self.inputs["Y"], X_wconstant)
                results = self.model.fit_regularized(method='elastic_net', alpha=0.0, L1_wt=0.0)
            elif change["new"]["modelName"] == "lasso":
                self.model = sm.OLS(self.inputs["Y"], X_wconstant)
                results = self.model.fit_regularized(method='elastic_net', alpha=1.0, L1_wt=1.0)
            
            self.done = True
            
            #TBC, the model should be wrapped
            self.outputs = {"model":self.model,"results":results}
            self.done = True
            
            self.moveToNextStep()
        
    
    def forward(self,XTrain:pd.DataFrame,yTrain:pd.DataFrame):
        self.inputs = {"X":XTrain,"Y":yTrain}


class EvaluationStep(GuidedStep):
    def __init__(self, stepId: int = None, stepName="Evaluate Model", succeedLastStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None):
        previousSteps = ["XTest","yTest","model","results"]
        super().__init__(stepId, stepName, succeedLastStepOutput, previousSteps, compare, metricName)
        self.succeedLastStepOutput = succeedLastStepOutput
    
    def clearUIinputs(self):
        self.config.pop("modelParameters",None)
        self.config.pop("modelResults",None)
        self.config.pop("viz",None)
    
    def forward(self,model,results,XTest:pd.DataFrame,yTest:pd.DataFrame):
        # TBC, should wrap a model object
        #join test dataset for altair visualization
        self.inputs = {"model":model,"results":results,"X":XTest,"Y":yTest}
        
        coefficients = results.params
        
        if hasattr(results,"pvalues"):
            p_values = results.pvalues

        rows = []
        
        columns = ["const"] + list(XTest.columns)
        for i,col in enumerate(columns):
            if hasattr(results,"pvalues"):
                rows.append({"name":col,"value":round(coefficients[i],4),"pvalue":round(p_values[i],6)})
            else:
                rows.append({"name":col,"value":round(coefficients[i],4)})
        self.changeConfig("modelParameters",rows)
        
        
        #TBC, should apply the test dataset
        X_wconstant = sm.add_constant(XTest)
        Y_hat = results.predict(X_wconstant)
        Y_hat = Y_hat.to_numpy().reshape((-1))
        Y_true = yTest.to_numpy().reshape((-1))
        resid = Y_hat - Y_true
        mse_score = mse(Y_hat,Y_true)
        
        #loop through all Y_hat and Y
        vizStats = []
        for i in range(len(Y_hat)):
            vizStats.append({"x": Y_hat[i], "y": resid[i] })
        
        #randomly sample 100 points from vizStats
        sample = random.sample(vizStats, 100)
        
        viz = {
            "vizType": "scatter",
            "xLabel": "Predicted {}".format(yTest.columns[0]),
            "yLabel": "Residuals",
            "vizStats": sample,
        }
        self.changeConfig("viz",viz)
        
        modelResults = []
        #TBC, should decide what to display
        modelResults.append({"name":"MSE","score":mse_score})
        
        self.changeConfig("modelResults",modelResults)        
        self.done = True
        
        
        
        
        
        
        
        
        
        
        
        
    

        
        
        
                
            
        
        
        
        
        
        
    
