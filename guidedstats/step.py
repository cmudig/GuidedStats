
from abc import abstractmethod
import inspect
import sys
import copy
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
    def __init__(self,stepId:int= None,stepName="step",previousSteps:list=None,**kwargs):
                
        # state variables of Step
        if stepId is not None:
            self.stepId = stepId
        self.stepName = stepName
        self.stepType = self.__class__.__name__
        self.done = False
        self.isShown = False
        
        #initialize stepInfo
        # self.stepInfo = {"stepId":self.stepId,"stepName":self.stepName,"stepType":self.stepType,"done":self.done,"isShown":self.isShown,"config":self.config}
        # self.observe(self.updateStepInfo,names=["stepId","stepName","stepType","done","isShown","config","config_items"])
        #back-end state
        self.inputs = {}
        self.outputs = {}
        
        self._workflow = None
        
        if previousSteps is None:
            self._previousSteps = []
        else:
            self._previousSteps = previousSteps
        self.previousStepsConfigs = []
    
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
    
    @abstractmethod
    def showBeginning(self):
        pass
   
    @abstractmethod
    def forward(self):
        """
        execute the current step and move forward
        """
        self.showBeginning()
        pass
    
    # def updateStepInfo(self,change):
    #     self.stepInfo = {"stepId":self.stepId,"stepName":self.stepName,"stepType":self.stepType,"done":self.done,"isShown":self.isShown,"config":self.config}

class GuidedStep(Step):
    """
        GuidedStep suggests potentially insightful column(s) based on selected metrics
    """
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None, compare: bool = False, metricName:str=None):
        super().__init__(stepId, stepName, previousSteps)
        self._compare = compare
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

class DataTransformationStep(Step):
    def __init__(self, stepId: int = None, stepName="Data Transformation", previousSteps: list = None):
        super().__init__(stepId, stepName, previousSteps)
        self._transformation = None
        self._transformationName = None
        self.selfDefinedTransformations = {}
        
    def showBeginning(self):
        print("Good! Now we will do the data transformation!")
    
    def addTransformation(self,transformationName:str,transformation:Callable):
        """
        Args:
            transformationName (str):  the name of transformation
            transformation (Callable): a column-wise transformation applied 
        """
        #TBC, should check the output type
        self.selfDefinedTransformations[transformationName] = transformation         
       
    def setTransformation(self,transformationName:str):
        temp = {**transformations,**self.selfDefinedTransformations}
        if transformationName in temp.keys():
            self._transformation = temp[transformationName]
            self._transformationName = transformationName
            self.changeConfig("transformation",transformationName)
        else:
            raise KeyError("The transformation does not exist")
    
    def forward(self,dataset:pd.DataFrame):
        #check whether setTransformation has been called previously
        if self._transformation is None:
            raise ValueError("Transformation should be set previously")
        
        newDataset = self._transformation(dataset)
        
        self.done = True
        return {"dataset":newDataset}
        
class LoadDatasetStep(Step):
    
    def __init__(self, stepId: int = None, stepName="Load Dataset", previousSteps: list = None):
        super().__init__(stepId, stepName, previousSteps)
        self._dataset = None
        self._datasetName = None
        
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
    
    def showBeginning(self):
        print("Loading the dataset")
        
    def forward(self):
        self.showBeginning()
        self.outputs = {"__dataset":self.dataset}
        self.done = True
        self.workflow.moveToNextStep()
    
class VariableSelectionStep(GuidedStep):
    
    def __init__(self, variableType:str, variableNum=1, candidateNum=4, stepId: int = None, stepName="Select Variable(s)", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        #TBC, we should allow undecided number of variables
        self._variableType = variableType
        self.variableNum = variableNum
        self.candidateNum = candidateNum

        self.changeConfig("variableName",variableType)
        
    def findVariableCandidates(self,dataset:pd.DataFrame,referenceDataset:pd.DataFrame=None) -> pd.DataFrame:
        print("findVariableCandidates")
        if self._compare:
            self.changeConfig("referenceVariables",list(referenceDataset.columns))
            candidateColumns = self.compare(dataset,dataset.columns,self.candidateNum,*referenceDataset.columns)
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
            self.outputs = {"dataset":subset}
            print("last stage of variable selection")
            print(self.outputs)
            with open("./test.txt","a+") as file:
                file.write("on observing variable selection step's config: "+ str(self.config))
                file.write("\n")
            self.done = True
            print(self.done)
            self.workflow.moveToNextStep()
            
    def forward(self,dataset:pd.DataFrame,referenceDataset:pd.DataFrame=None) -> pd.DataFrame:
        #TBC, independent variables should correlate with dependent variable
        #TBC, the type of selected variable should be checked before any further steps
        #TBC, should do shallow copy to reduce memory usage
        print("move to VariableSelectionStep")
        self.inputs = {"dataset":dataset,"referenceDataset":referenceDataset}
        self.findVariableCandidates(dataset,referenceDataset)
        

# class DataTransformationStep(Step):
#     """
#         DataTransformationStep applies function on column(s) and return a new one
    

#     Args:
#         Step (_type_): _description_
#     """
    
#     def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None):
#         super().__init__(stepId, stepName, previousSteps)
#         self.transformation = None
        
#     def showBeginning(self):
#         print("Well Done! Now  ")
        
#     def defineTransformation(self,transformation:Callable):
#         self.transformation = transformation
    
#     def setTransformation(self,name:str):
#         #TBC
#         self.transformation = transformations[name]
        
#     def forward(self,dataset:pd.DataFrame):
#         """

#         Returns:
#             _type_: _description_
#         """
        
        
        
class AssumptionCheckingStep(Step):

    def __init__(self, stepId: int = None, stepName="Check Assumption", previousSteps: list = None, assumptionName:str = None, isRelaxed:bool = True):
        super().__init__(stepId, stepName, previousSteps)
        self.isRelaxed = isRelaxed
        # TBC, if relaxed is True, then even the assumption does not meet the proess will continue 
        self.observe(self.onObserveConfig,names=["config"])
        if assumptionName is not None:
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(assumptionName)
            self.changeConfig("assumptionName",assumptionName)
        
    def showBeginning(self):
        print("Done! Now we move to assumption checking stage!")
    
    @tl.observe("config")    
    def onObserveConfig(self,change):
        print("check config")
        with open("./test.txt","a+") as file:
            file.write("on observing assumption checking step's config: "+ str(self.config))
            file.write("\n")
            current_frame = inspect.currentframe()
            frames = inspect.getouterframes(current_frame)
            functions = []
            for i, record in enumerate(frames[1:19]):  # Skip the current frame and get the next 5 frames
                _, _, _, function, _, _ = record
                functions.append(function)
            file.write("called by: "+str(",".join(functions)))
            file.write("\n")
        print(self.config)
    
    @tl.observe("done")
    def onObserveDone(self,change):
        if change["old"] == False and change["new"] == True:
            with open("./test.txt","a+") as file:
                file.write("assumption done, config: "+ str(self.config))
                file.write("\n")
                file.write("workflow: "+ str(self.workflow))
                file.write("\n")
            self.outputs = {"dataset":self.inputs["X"]}
            self.workflow.moveToNextStep() 

    
    def forward(self,X:pd.DataFrame,*referenceXs:pd.DataFrame):
        print("check forward")
        #1. show Intro 
        self.showBeginning()
        self.inputs = {"X":X,"referenceXs":referenceXs}
        #2. (optional) show visualization
        #3. (optional) show metric
        # self.workflow.onProceeding = False
        assumptionResults = self.assumption.checkAssumptipon(X,*referenceXs)
        self.changeConfig("assumptionResults",assumptionResults)
        with open("./test.txt","a+") as file:
            file.write("on observing assumption checking step's config: "+ str(self.config))
            file.write("\n")
        #4. get return from users
        #TBC, should check the logic here
        
class TrainTestSplitStep(Step):
    """
        temporary class, maybe changed to 
    """
    
    def __init__(self, stepId: int = None, stepName="Train Test Split", previousSteps: list = None):
        super().__init__(stepId, stepName, previousSteps)
    
    def showBeginning(self):
        print("Great! Now you need to perform the Train Test Split!")
    
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
            self.workflow.moveToNextStep()
        
    def forward(self,X:pd.DataFrame,Y:pd.DataFrame):
        self.inputs = {"X":X,"Y":Y}

class ModelStep(GuidedStep):
    
    def __init__(self, stepId: int = None, stepName="Train Model", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        #TBC, should allow more types of models and hyperparameter search
        self.model = None
    
    def showBeginning(self):
        print("Good! Now we move to the crucial step!")
    
    @tl.observe("config")
    def onObserveConfig(self,change): 
        if "modelName" in change["new"]:
            X_wconstant = sm.add_constant(self.inputs["X"])
            if change["new"]["modelName"] == "simple":
                self.model = sm.OLS(endog=self.inputs["Y"], exog=X_wconstant)
                results = self.model.fit()
            elif change["new"]["modelName"] == "ridge":
                self.model = sm.OLS(endog=self.inputs["Y"], exog=X_wconstant)
                results = self.model.fit_regularized(method='elastic_net', alpha=0.0, L1_wt=0.0)
            elif change["new"]["modelName"] == "lasso":
                self.model = sm.OLS(endog=self.inputs["Y"], exog=X_wconstant)
                results = self.model.fit_regularized(method='elastic_net', alpha=1.0, L1_wt=1.0)
            self.model = linear_model.LinearRegression()
            
            self.done = True
            
            #TBC, the model should be wrapped
            self.outputs = {"model":self.model,"results":results}
            self.done = True
            self.workflow.moveToNextStep()
        
    
    def forward(self,X:pd.DataFrame,Y:pd.DataFrame):
        self.inputs = {"X":X,"Y":Y}


class EvaluationStep(GuidedStep):
    def __init__(self, stepId: int = None, stepName="Evaluate Model", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        
    def forward(self,model,results,X:pd.DataFrame,Y:pd.DataFrame):
        # TBC, should wrap a model object
        #join test dataset for altair visualization
        self.inputs = {"model":model,"results":results,"X":X,"Y":Y}
        
        modelResults = []
        #TBC, should decide what to display
        modelResults.append({"name":"r_squared","score":results.rsquared_adj})
        
        self.changeConfig("modelResults",modelResults)        
        self.done = True
        #TBC, should apply the test dataset
        # X_wconstant = sm.add_constant(X)
        # Y_hat = model.predict(X_wconstant)
        # mse_score = mse(Y_hat,Y.to_numpy().reshape((-1)))
           
        
        # testDataset = pd.DataFrame({"Predicted":Y_hat,"True":Y.to_numpy().reshape((-1))})
        
        # # Scatter plot of Predicted vs True
        # plt.scatter(testDataset["Predicted"], testDataset["True"], label='Data', color='blue')

        # # Add a diagonal line
        # limits = [np.min([plt.xlim(), plt.ylim()]),  np.max([plt.xlim(), plt.ylim()])]  # limits for x and y axis
        # plt.plot(limits, limits, color='red', label='Baseline')  # Draw baseline

        # # Set labels and title
        # plt.xlabel("Predicted Values")
        # plt.ylabel("True Values")
        # plt.title("Predicted vs True Values")
        # plt.legend(loc='best')

        # # Display the plot
        # plt.show()

        # self.done = True
        # #TBC, should introduce metric here
        
        
        
        
        
        
        
        
        
        
        
    

        
        
        
                
            
        
        
        
        
        
        
    
