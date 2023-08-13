
from abc import abstractmethod
import sys
from typing import Any, Callable
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn import linear_model
import statsmodels.api as sm
from .metrics import MetricWrapper
from .assumptions import AssumptionWrapper



quantitative_dtypes = ['float32', 'float64', 'int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64']


transformations = {
    "log": lambda x:np.log(x+1) 
}



class Step(object):
    """
    base class
    """
    def __init__(self,stepId:int= None,stepName="step",previousSteps:list=None):
        self.stepName = stepName
        if previousSteps is None:
            self._previousSteps = []
        else:
            self._previousSteps = previousSteps
        self.previousStepsConfigs = []
        
        self.stepId = stepId
        
    @property
    def previousSteps(self):
        return self._previousSteps
            
    @previousSteps.setter
    def previousSteps(self,previousSteps:list):
        if not isinstance(previousSteps,list):
            raise TypeError("previousSteps should be a list of Step")
        self._previousSteps = previousSteps
        
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
    
    #Utils function
    def computeMetric(self,dataframe:pd.DataFrame,column:str,*referenceColumns:str):
        X = dataframe[column]
        referenceXs = [dataframe[col] for col in referenceColumns]
        return self.metric.compute(X,*referenceXs)
        
    def compare(self,dataframe:pd.DataFrame,columns:list,k:int=1,*referenceColumns:str):
        """
            Return the top-k highest column(s) based on the metric
        """
        scores = []
        for column in columns:
            score = float("-inf")
            if column not in referenceColumns:
                if dataframe[column].dtype in quantitative_dtypes:
                #the constraint should be relaxed for other types of variables
                    outputs = self.computeMetric(dataframe,column,*referenceColumns)
                    score = outputs["statistics"]
                    #TBC, here only consider correlation
            scores.append(score)
        descendingColumnIndices = np.argsort(scores)[::-1]
        descendingColumns = [columns[idx] for idx in descendingColumnIndices]
        return descendingColumns[0:min(len(columns),k)]

class DataTransformationStep(Step):
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None):
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
        else:
            raise KeyError("The transformation does not exist")
    
    def forward(self,dataset:pd.DataFrame):
        #check whether setTransformation has been called previously
        if self._transformation is None:
            raise ValueError("Transformation should be set previously")
        
        newDataset = self._transformation(dataset)
        
        return {"dataset":newDataset}
        
class LoadDatasetStep(Step):
    
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None):
        super().__init__(stepId, stepName, previousSteps)
        self._dataset = None
        
    @property
    def dataset(self):
        return self._dataset

    @dataset.setter
    def dataset(self,dataset:pd.DataFrame):
        self._dataset = dataset
    
    def showBeginning(self):
        print("Loading the dataset")
        
    def forward(self):
        self.showBeginning()
        return {"__dataset":self.dataset}
    
class VariableSelectionStep(GuidedStep):
    
    def __init__(self, variableType:str, variableNum=1, candidateNum=4, stepId: int = None, stepName="step", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        #TBC, we should allow undecided number of variables
        self._variableType = variableType
        self.variableNum = variableNum
        self.candidateNum = candidateNum
    
    def showBeginning(self):
        print("Great job! Now you need to select {}".format(self._variableType))

    def forward(self,dataset:pd.DataFrame,referenceDataset:pd.DataFrame=None) -> pd.DataFrame:
        #TBC, independent variables should correlate with dependent variable
        #TBC, the type of selected variable should be checked before any further step
        self.showBeginning()
        
        if self._compare:
            print("We find the following variable(s) have the highest {}".format(self.metric._metricName))
            candidateColumns = self.compare(dataset,dataset.columns,self.candidateNum,*referenceDataset.columns)
        else:
            print("Please select from below: ")
            candidateColumns = dataset.columns
            
        for idx, column in enumerate(candidateColumns):
            print("  {0}. {1}  ".format(idx+1,column))
        
        selectedVariableIdx = set()
        selectedIdx = None
        while selectedIdx != "STOP" and len(selectedVariableIdx) < self.variableNum:
            #the index is linked to candidateColumns
            selectedIdx = input("Input the number of column for {}, type STOP to stop   ".format(self._variableType))
            #TODO check whether idx is an integer and within the range
            try:
                idx = int(selectedIdx) - 1
                if idx >= 0 and idx < len(dataset.columns):
                    selectedVariableIdx.add(idx)
            except:
                continue
        
        selectedColumns = [candidateColumns[idx] for idx in list(selectedVariableIdx)]
        subset = dataset[selectedColumns]
        return {"dataset":subset}

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

    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None, assumptionName:str = None, isRelaxed:bool = True):
        super().__init__(stepId, stepName, previousSteps)
        self.isRelaxed = isRelaxed
        # TBC, if relaxed is True, then even the assumption does not meet the proess will continue 
        if assumptionName is not None:
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(assumptionName)
        
    def showBeginning(self):
        print("Done! Now we move to assumption checking stage!")
    
    def forward(self,X:pd.DataFrame,*referenceXs:pd.DataFrame):
        #1. show Intro
        self.showBeginning()
        #2. (optional) show visualization
        #3. (optional) show metric
        self.assumption.checkAssumptipon(X,*referenceXs)
        #4. get return from users
        doProceed = input("Should we proceed or not? Type y or n")
        if doProceed == "y" or doProceed == "Y":
            return {"dataset":X}
        else:
            sys.exit()
        #TBC, should check the logic here
        
class TrainTestSplitStep(Step):
    """
        temporary class, maybe changed to 
    """
    
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None):
        super().__init__(stepId, stepName, previousSteps)
    
    def showBeginning(self):
        print("Great! Now you need to perform the Train Test Split!")
        
    def forward(self,X:pd.DataFrame,Y:pd.DataFrame):
        self.showBeginning()
        assert len(X) == len(Y)
        
        trainSize = input("Input the train size between 0 to 1, 0.8 is suggested   ")
        #TBC trainSize should be checked
        valSize = input("Input the validation size between 0 to {}   ".format(round(1 - float(trainSize),4)))
        
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
        
        return {"XTrain":XTrain, "XVal":XVal, "XTest":XTest, "yTrain":yTrain, "yVal":yVal, "yTest":yTest}

class ModelStep(GuidedStep):
    
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        #TBC, should allow more types of models and hyperparameter search
        self.model = None
    
    def showBeginning(self):
        print("Good! Now we move to the crucial step!")
        
    
    def forward(self,X:pd.DataFrame,Y:pd.DataFrame):
        X_wconstant = sm.add_constant(X)
        model = sm.OLS(Y, X_wconstant)
        results = model.fit()

        self.model = linear_model.LinearRegression()
        self.model.fit(X,Y)
        #TBC, the model should be wrapped
        return {"model":self.model}

class EvaluationStep(GuidedStep):
    def __init__(self, stepId: int = None, stepName="step", previousSteps: list = None, compare: bool = False, metricName: str = None):
        super().__init__(stepId, stepName, previousSteps, compare, metricName)
        
    def forward(self,model,X:pd.DataFrame,Y:pd.DataFrame):
        # TBC, should wrap a model object
        #join test dataset for altair visualization
        Y_hat = model.predict(X).reshape((-1))
        testDataset = pd.DataFrame({"Predicted":Y_hat,"True":Y.to_numpy().reshape((-1))})
        
        # Scatter plot of Predicted vs True
        plt.scatter(testDataset["Predicted"], testDataset["True"], label='Data', color='blue')

        # Add a diagonal line
        limits = [np.min([plt.xlim(), plt.ylim()]),  np.max([plt.xlim(), plt.ylim()])]  # limits for x and y axis
        plt.plot(limits, limits, color='red', label='Baseline')  # Draw baseline

        # Set labels and title
        plt.xlabel("Predicted Values")
        plt.ylabel("True Values")
        plt.title("Predicted vs True Values")
        plt.legend(loc='best')

        # Display the plot
        plt.show()
        
        # baseline = alt.Chart(testDataset).mark_line().encode(
        #         y = 'Predicted:Q',
        #         x = 'Predicted:Q'
        #     )
        # circles = alt.Chart(testDataset).mark_circle().encode(
        #         alt.X("Predicted:Q").title("Predicted Values"),
        #         alt.Y("True:Q").title("True Values")
        #     )
            
        # visualization = (baseline+circles).properties(width=400)
            
        # return {"visualization":visualization}
        return {}
        #TBC, should introduce metric here
        
        
        
        
        
        
        
        
        
        
        
    

        
        
        
                
            
        
        
        
        
        
        
    
