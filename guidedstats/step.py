from abc import abstractmethod
import json
import copy
import traitlets as tl
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.api as sm
from .utils import checkPRange, getUniqueValues
from .metrics import MetricWrapper
from .assumptions import AssumptionWrapper
from .transformations import TransformationWrapper
from .viz import VIZ
from .model import ModelWrapper
from .utils import QUANTITATIVE_DTYPES


class Config(tl.HasTraits):
    dataset = tl.Unicode("").tag(sync=True)
    metric = tl.Unicode("").tag(sync=True)
    transformation = tl.Unicode("").tag(sync=True)
    variableName = tl.Unicode("").tag(sync=True)
    variableCandidates = tl.List([]).tag(sync=True)
    variableResults = tl.List([]).tag(sync=True)
    assumptionName = tl.Unicode("").tag(sync=True)
    modelName = tl.Unicode("").tag(sync=True)
    modelCandidates = tl.List([]).tag(sync=True)
    modelResults = tl.List([]).tag(sync=True)


class Step(tl.HasTraits):
    stepId = tl.Int().tag(sync=True)
    stepName = tl.Unicode().tag(sync=True)
    stepType = tl.Unicode().tag(sync=True)
    done = tl.Bool(False).tag(sync=True)
    isProceeding = tl.Bool(False).tag(sync=True)
    toExecute = tl.Bool(False).tag(sync=True)
    isShown = tl.Bool(False).tag(sync=True)
    stepExplanation = tl.Unicode().tag(sync=True)
    config = tl.Dict({}).tag(sync=True)
    previousConfig = tl.Dict({}).tag(sync=True)
    groupConfig = tl.Dict({}).tag(sync=True)
    """
    base class
    """

    def __init__(self, stepId: int = None, stepName="step", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, **kwargs):

        # state variables of Step
        if stepId is not None:
            self.stepId = stepId
        self.stepName = stepName
        self.stepType = self.__class__.__name__
        self.done = False
        self.isProceeding = False
        self.toExecute = False
        self.isShown = False
        self.stepExplanation = stepExplanation

        # back-end state
        self.inputs = {}
        self.outputs = {}
        self.outputNames = kwargs.get("outputNames", None)
        self.inputNames = kwargs.get("inputNames", None)

        self.registered_functions = []

        self._workflow = None

        self.previousSteps = previousSteps

    @property
    def workflow(self):
        return self._workflow

    @workflow.setter
    def workflow(self, workflow):
        self._workflow = workflow

    # utils function
    def changeConfig(self, key, value):
        tmp = self.config
        tmp[key] = value
        tmp = json.dumps(tmp)
        tmp = json.loads(tmp)
        self.config = tmp
        if self.workflow is not None:
            self.workflow.updateWorkflowInfo(None)

    def compareConfig(self, old_config, new_config):
        differentKeys = []
        for key in new_config.keys():
            if key in old_config.keys():
                if new_config[key] != old_config[key]:
                    differentKeys.append(key)
            else:
                differentKeys.append(key)
        return differentKeys

    @abstractmethod
    def onObserveConfig(self, change):
        pass

    @abstractmethod
    def onObserveToExecute(self, change):
        pass

    def moveToNextStep(self):
        self.done = True
        self.workflow.moveToNextStep(self)

    @abstractmethod
    def forward(self):
        """
        execute the current step and move forward
        """
        pass

    @abstractmethod
    # register the functions used in rerunning the step
    def register(self, function):
        pass

    @abstractmethod
    # clear all inputs from UI
    def clear(self):
        pass


class GuidedStep(Step):
    """
        GuidedStep suggests potentially insightful column(s) based on selected metrics
    """

    def __init__(self, stepId: int = None, stepName="step", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwargs)
        self._compare = compare

        self.succeedPreviousStepOutput = succeedPreviousStepOutput
        if metricName is not None:
            self.metric = MetricWrapper()
            self.metric.setMetric(metricName)

            self.changeConfig("metric", metricName)

    # Utils function
    def computeMetric(self, dataframe: pd.DataFrame, column: str, *referenceColumns: str):
        X = dataframe[column]
        referenceXs = [dataframe[col] for col in referenceColumns]
        return self.metric.compute(X, *referenceXs)

    def compare(self, dataframe: pd.DataFrame, columns: list, k: int = 1, *referenceColumns: str):
        """
            Return the top-k highest column(s) based on the metric
        """
        results = []
        for column in columns:
            if column not in referenceColumns:  # referenceColumns is the dependent variable
                if dataframe[column].dtype in QUANTITATIVE_DTYPES:
                    # the constraint should be relaxed for other types of variables
                    result = {"name": column}
                    outputs = self.computeMetric(
                        dataframe, column, *referenceColumns)
                    result["score"] = outputs["statistics"]
                    if "pvalue" in outputs:
                        pvalue = outputs["pvalue"]
                        result["pvalue"] = pvalue
                    # TBC, here only consider correlation
                    results.append(result)
        descendingColumns = sorted(
            results, key=lambda x: abs(x["score"]), reverse=True)
        return descendingColumns[0:min(len(descendingColumns), k)]

# Define Step that get the outputs of the previous step


class SucccessorStep(Step):
    def __init__(self, stepId: int = None, stepName="step", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwargs)
        self.succeedPreviousStepOutput = succeedPreviousStepOutput

    def getPreviousOutputs(self):
        return self.workflow.stepList[self.stepId - 1].outputs


class DataTransformationStep(SucccessorStep):
    def __init__(self, stepId: int = None, stepName="Data Transformation", stepExplanation="", succeedPreviousStepOutput=True, previousSteps: list = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwargs)
        self._transformation = None
        self._transformationName = None
        self.transformationParameters = []
        self.selfDefinedTransformations = {}
        self.succeedPreviousStepOutput = succeedPreviousStepOutput

    def clear(self):
        self.config.pop("variableCandidates", None)
        self.config.pop("transformationName", None)
        self.config.pop("variableResults", None)
        self.outputs = {}
        self.done = False

    @tl.observe("config")
    def setTransformation(self, change):
        """
        Args:
            transformationName (str):  the name of transformation
            transformation (Callable): a column-wise transformation applied 
        """
        differences = self.compareConfig(change["old"], change["new"])
        if "transformationName" in differences and change["new"]["transformationName"] is not None:
            transformationName = change["new"]["transformationName"]
            self._transformation = TransformationWrapper()
            self._transformation.setTransformation(transformationName)
            self._transformationName = transformationName

    @tl.observe("done")
    def onObservingDone(self, change):
        hasAll = True
        hasTransformation = self._transformation is not None
        hasVariableResults = "variableResults" in self.config and len(
            self.config["variableResults"]) != 0
        hasAll = hasAll and hasTransformation and hasVariableResults

        otherParameters = {}
        if hasAll:
            columns = [option["name"]
                       for option in self.config["variableResults"]]

            outputName = self.outputNames[0]
            otherParameters["outputName"] = outputName
            inputDataset = copy.deepcopy(self.inputs["dataset"])
            transformedDataset = self._transformation.transform(
                inputDataset, columns, **otherParameters)
            outputs = copy.deepcopy(self.getPreviousOutputs())
            for key in transformedDataset.keys():
                outputs[key] = transformedDataset[key]
            self.outputs = outputs

            # update current dataframe
            if self.workflow is not None:
                dataset = copy.deepcopy(self.inputs["dataset"])
                for key in transformedDataset.keys():
                    dataset[key] = transformedDataset[key]
                self.workflow.current_dataframe = dataset
            del inputDataset, dataset, transformedDataset

            self.done = True

            self.moveToNextStep()

    def forward(self, **inputs):
        # check whether setTransformation has been called previously

        outputs = self.getPreviousOutputs()

        if self.outputNames is None:
            self.outputNames = [list(outputs.keys())[0]]

        # get dataset from previous steps
        # format: [string, string]
        keys = list(self.workflow.outputsStorage.keys())
        keys.sort(reverse=True)
        found = False
        currentIdx = 0
        dataset = None

        while not found:
            currentObservingOutputs = self.workflow.outputsStorage[keys[currentIdx]]
            if "dataset" in currentObservingOutputs:
                found = True
                dataset = currentObservingOutputs["dataset"]
            currentIdx += 1

        self.inputs["dataset"] = dataset

        self.inputs[list(outputs.keys())[0]] = outputs[list(outputs.keys())[0]]

        variableCandidates = [{"name": col}
                              for col in self.inputs[list(outputs.keys())[0]].columns]
        self.changeConfig("variableCandidates", variableCandidates)


class LoadDatasetStep(Step):

    def __init__(self, stepId: int = None, stepName="Load Dataset", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, **kwarg):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwarg)
        self._dataset = None
        self._datasetName = None
        self.succeedPreviousStepOutput = succeedPreviousStepOutput

    @property
    def dataset(self):
        return self._dataset

    @dataset.setter
    def dataset(self, dataset: pd.DataFrame):
        self._dataset = dataset

    @property
    def datasetName(self):
        return self._datasetName

    @datasetName.setter
    def datasetName(self, datasetName: str):
        self._datasetName = datasetName
        self.changeConfig("dataset", datasetName)

    def forward(self):

        self.dataset = self.workflow.dataset
        self.datasetName = self.workflow.datasetName

        self.outputs = {"dataset": self.dataset}

        # update current dataframe
        if self.workflow is not None:
            self.workflow.current_dataframe = self.dataset

        self.done = True
        self.moveToNextStep()


class VariableSelectionStep(GuidedStep):

    def __init__(self, variableType: str, variableNum=1, candidateNum=4, stepId: int = None, stepName="Select Variable(s)", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None, **kwargs):
        if variableType == "independent variables":
            previousSteps = ["dataset", "referenceDataset"]
        elif variableType == "dependent variable":
            previousSteps = ["dataset"]
        elif variableType == "group variable":
            previousSteps = ["dataset", "Y1"]
        else:
            previousSteps = ["dataset"]
        self.requireVarCategory = kwargs.get("requireVarCategory", False)
        super().__init__(stepId, stepName, stepExplanation, succeedPreviousStepOutput,
                         previousSteps, compare, metricName, **kwargs)
        # TBC, we should allow undecided number of variables
        self._variableType = variableType
        self.variableNum = variableNum
        self.candidateNum = candidateNum

        self.succeedPreviousStepOutput = succeedPreviousStepOutput

        self.changeConfig("variableName", variableType)
        self.changeConfig("variableNum", variableNum)

        self.changeConfig("requireVarCategory", self.requireVarCategory)

        self.groupCandidates = None

    def clear(self):
        # clear all after forward
        self.config.pop("variableCandidates", None)
        self.config.pop("variableResults", None)
        self.config.pop("groupCandidates", None)
        self.config.pop("groupResults", None)
        self.inputs = {}
        self.outputs = {}
        self.done = False

    def findVariableCandidates(self, dataset: pd.DataFrame, referenceDataset: pd.DataFrame = None) -> pd.DataFrame:
        if self._compare:
            if referenceDataset is not None:
                self.changeConfig("referenceVariables",
                                  list(referenceDataset.columns))
                candidateColumns = self.compare(
                    dataset, dataset.columns, self.candidateNum, *referenceDataset.columns)

            else:
                candidateColumns = self.compare(
                    dataset, dataset.columns, self.candidateNum)
        else:
            if self.requireVarCategory:
                candidateColumns = [{"name": col} for col in dataset.columns]
            else:
                candidateColumns = [{"name": col}
                                    for col in dataset.columns if dataset[col].dtype in QUANTITATIVE_DTYPES]

        self.changeConfig("variableCandidates", candidateColumns)

    @tl.observe("config")
    def onObserveConfig(self, change):
        newConfig = change["new"]
        hasGroupResults = "groupResults" in newConfig and len(
            newConfig["groupResults"]) == 2
        hasVariableResults = "variableResults" in newConfig and len(
            newConfig["variableResults"]) != 0
        if self.requireVarCategory:
            if hasGroupResults and hasVariableResults:  # 2. after selecting groupby options
                selectedColumns = [result["name"]
                                   for result in newConfig["variableResults"]]
                self.outputs = {}
                for i in range(len(self.outputNames)):
                    group = newConfig["groupResults"][i]["name"]
                    self.outputs[self.outputNames[i]
                                 ] = self.inputs["Y1"][self.inputs["dataset"][selectedColumns[0]] == group]
            else:
                if hasVariableResults:  # 1. display groupby options
                    selectedColumns = [result["name"]
                                       for result in newConfig["variableResults"]]
                    values = getUniqueValues(
                        self.inputs["dataset"], selectedColumns[0])
                    options = [{"name": value} for value in values]
                    self.groupCandidates = options
                    self.changeConfig("groupCandidates", self.groupCandidates)
                    self.workflow.updateWorkflowInfo(None)
        else:
            if hasVariableResults:
                selectedColumns = [result["name"]
                                   for result in newConfig["variableResults"]]
                subset = self.inputs["dataset"][selectedColumns]
                if self._variableType == "independent variables":
                    self.outputs = {
                        self.outputNames[0]: subset, "referenceDataset": self.inputs["referenceDataset"], "exog": subset}
                elif self._variableType == "dependent variable":
                    self.outputs = {
                        self.outputNames[0]: subset, "referenceDataset": subset}
                else:
                    self.outputs = {self.outputNames[0]: subset}

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if len(self.outputs) != 0:
                self.moveToNextStep()
            else:
                self.toExecute = False

    def forward(self, **inputs) -> pd.DataFrame:
        self.inputs = inputs
        dataset = self.inputs.get("dataset", None)
        referenceDataset = self.inputs.get("referenceDataset", None)
        self.findVariableCandidates(dataset, referenceDataset)


class AssumptionCheckingStep(SucccessorStep):

    def __init__(self, stepId: int = None, stepName="Check Assumption", stepExplanation="", succeedPreviousStepOutput=True, previousSteps: list = None, assumptionName: str = None, isRelaxed: bool = True, **kwargs):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwargs)
        self.isRelaxed = isRelaxed
        self.succeedPreviousStepOutput = succeedPreviousStepOutput
        # TBC, if relaxed is True, then even the assumption does not meet the proess will continue
        self.assumption = None
        # get inputNames
        self.previousSteps = kwargs.get("inputNames", None)

        if assumptionName is not None:
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(assumptionName)

    def clear(self):
        self.config.pop("assumptionResults", None)
        self.config.pop("viz", None)

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if self.config.get("assumptionResults", None) is not None:
                if self.outputNames is not None:
                    self.outputs = {}
                    for i, outputName in enumerate(self.outputNames):
                        self.outputs[outputName] = list(
                            self.inputs.values())[i]
                else:
                    self.outputs = self.getPreviousOutputs()
                self.moveToNextStep()
            else:
                self.toExecute = False

    @tl.observe("config")
    def onObserveConfig(self, change):
        if "assumptionName" in self.config and self.config["assumptionName"] is not None:
            assumption_dict = {
                "Outliers Checking": "outlier",
                "Levene Test": "levene",
                "Normality Test": "normality",
                "Multicollinearity Test": "multicollinearity"
            }
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(
                assumption_dict[self.config["assumptionName"]])

        if self.workflow is not None and self.workflow.currentStep is not None and self.workflow.currentStep == self:
            self.checkAssumption(self.inputs)

    def checkAssumption(self, inputs: dict):
        # 2. check assumption
        assumptionResults, vizs = self.assumption.checkAssumption(
            *tuple(inputs.values()))
        # 3. set config
        self.changeConfig("assumptionResults", assumptionResults)
        self.changeConfig("viz", vizs)

    def forward(self, **inputs):

        # 1. get outputs from previous step, and assign it as the current input
        self.inputs = inputs

        if self.assumption is not None:
            if self.workflow is not None and self.workflow.currentStep is not None:
                self.checkAssumption(self.inputs)


class TrainTestSplitStep(Step):
    """
        temporary class, maybe changed to 
    """

    def __init__(self, stepId: int = None, stepName="Train Test Split", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation,
                         succeedPreviousStepOutput, previousSteps, **kwargs)
        self.succeedPreviousStepOutput = succeedPreviousStepOutput
        self.previousSteps = kwargs.get("inputNames", None)

    def clear(self):
        self.config.pop("trainSize", None)

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if self.config.get("trainSize", None) is not None:
                trainSize = self.config["trainSize"]

                X = self.inputs["X"]
                Y = self.inputs["Y"]
                indices = np.arange(len(X))
                np.random.shuffle(indices)
                train_indices = indices[:int(len(indices)*float(trainSize))]
                test_indices = indices[int(
                    len(indices)*(float(trainSize))):]

                XTrain = X.iloc[train_indices]
                XTest = X.iloc[test_indices]
                yTrain = Y.iloc[train_indices]
                yTest = Y.iloc[test_indices]

                self.outputs = {"XTrain": XTrain, "XTest": XTest,
                                "yTrain": yTrain, "yTest": yTest}

                self.moveToNextStep()
            else:
                self.toExecute = False

    def forward(self, X: pd.DataFrame, Y: pd.DataFrame):
        self.inputs = {"X": X, "Y": Y}


class ModelStep(GuidedStep):

    def __init__(self, stepId: int = None, stepName="Train Model", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None, modelCandidates: list = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation, succeedPreviousStepOutput,
                         previousSteps, compare, metricName, **kwargs)
        # TBC, should allow more types of models and hyperparameter search
        self.modelWrapper = ModelWrapper()
        self.succeedPreviousStepOutput = succeedPreviousStepOutput

        self.previousSteps = kwargs.get("inputNames", None)

        if modelCandidates is not None:
            self.changeConfig("modelCandidates", modelCandidates)

    def clear(self):
        self.config.pop("modelName", None)

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if self.config.get("modelName", None) is not None:
                self.modelWrapper.setModel(self.config["modelName"])
                if self.config.get("modelParameters", None) is not None:
                    args = {}
                    for parameter in self.config["modelParameters"]:
                        args[parameter["name"]] = parameter["value"]
                    model, results = self.modelWrapper.fit(
                        *tuple(self.inputs.values()), **args)
                else:
                    model, results = self.modelWrapper.fit(
                        *tuple(self.inputs.values()))

                # update current model and results
                if self.workflow is not None:
                    self.workflow.current_model = model

                # TBC, the model should be wrapped
                self.outputs = {"model": model, "results": results}
                self.moveToNextStep()
            else:
                self.toExecute = False

    def forward(self, **inputs):
        self.inputs = inputs


class EvaluationStep(GuidedStep):
    def __init__(self, stepId: int = None, stepName="Evaluate Model", stepExplanation="", succeedPreviousStepOutput=False, previousSteps: list = None, compare: bool = False, metricName: str = None, **kwargs):
        super().__init__(stepId, stepName, stepExplanation, succeedPreviousStepOutput,
                         previousSteps, compare, metricName, **kwargs)
        self.succeedPreviousStepOutput = succeedPreviousStepOutput
        self.previousSteps = kwargs.get("inputNames", None)
        self.evaluationMetricNames = kwargs.get("evaluationMetricNames", None)
        self.visType = kwargs.get("visType", None)

        self.metricWrappers = []
        if self.evaluationMetricNames is not None:
            for metricName in self.evaluationMetricNames:
                metricWrapper = MetricWrapper()
                metricWrapper.setMetric(metricName)
                self.metricWrappers.append(metricWrapper)

    def clear(self):
        self.config.pop("modelParameters", None)
        self.config.pop("modelResults", None)
        self.config.pop("viz", None)

    def forward(self, **inputs):
        # TBC, should wrap a model object

        self.inputs = inputs

        # update model parameters
        if self.inputs["model"]._modelName in ("Simple Linear Regression", "Ridge Regression", "Lasso Regression"):
            if hasattr(self.inputs["results"], "params"):
                params = self.inputs["results"].params
            if hasattr(self.inputs["results"], "pvalues"):
                p_values = self.inputs["results"].pvalues
        elif self.inputs["model"]._modelName == "T Test":
            if self.inputs["results"].getStat("tstat"):
                params = [self.inputs["results"].getStat("tstat")]
            if self.inputs["results"].getStat("pvalue"):
                p_values = [self.inputs["results"].getStat("pvalue")]
        if len(params) != 0:
            rows = []
            if self.inputs["model"]._modelName in ("Simple Linear Regression", "Ridge Regression", "Lasso Regression"):
                columns = ["const"] + list(self.inputs["XTest"].columns)
                for i, col in enumerate(columns):
                    if hasattr(self.inputs["results"], "pvalues"):
                        rows.append({"name": col, "value": round(
                            params[i], 4), "pvalue": round(p_values[i], 6)})
                    else:
                        rows.append(
                            {"name": col, "value": round(params[i], 4)})
                self.changeConfig("modelParameters", rows)
            elif self.inputs["model"]._modelName == "T Test":
                columns = list(["T Statistic"])
                for i, col in enumerate(columns):
                    if hasattr(self.inputs["results"], "pvalues"):
                        rows.append({"name": col, "value": round(
                            params[i], 4), "pvalue": round(p_values[i], 6)})
                    else:
                        rows.append(
                            {"name": col, "value": round(params[i], 4)})
            self.changeConfig("modelParameters", rows)

        # TBC, apply the test dataset
        # viz
        if self.inputs["model"]._canPredict:
            if self.visType is not None and self.visType == "residual":
                modelResults = []
                
                X_wconstant = sm.add_constant(self.inputs["XTest"])
                Y_hat = self.inputs["results"].predict(X_wconstant)
                Y_hat = Y_hat.to_numpy().reshape((-1))
                Y_true = self.inputs["yTest"].to_numpy().reshape((-1))
                
                vizStats = VIZ[self.visType](Y_hat, Y_true, group="Test")
                
                if len(self.inputs["yTest"]) != 0:
                    for metric in self.metricWrappers:
                        outputs = metric.compute(Y_true, Y_hat)
                        modelResults.append(
                            {"name": metric._metricName, "score": round(outputs["statistics"], 4), "group": "Test"})

                X_wconstant = sm.add_constant(self.inputs["XTrain"])
                Y_hat = self.inputs["results"].predict(X_wconstant)
                Y_hat = Y_hat.to_numpy().reshape((-1))
                Y_true = self.inputs["yTrain"].to_numpy().reshape((-1))
                vizStats.extend(VIZ[self.visType](
                    Y_hat, Y_true, group="Train"))
                
                if len(self.inputs["yTrain"]) != 0:
                    for metric in self.metricWrappers:
                        outputs = metric.compute(Y_true, Y_hat)
                        modelResults.append(
                            {"name": metric._metricName, "score": round(outputs["statistics"], 4), "group": "Train"})
                        
                self.changeConfig("modelResults", modelResults)

                viz = {
                    "vizType": "scatter",
                    "xLabel": "Predicted {}".format(self.inputs["yTest"].columns[0]),
                    "yLabel": "Residuals",
                    "vizStats": vizStats,
                }
                vizs = [viz]
                self.changeConfig("viz", vizs)
        else:
            if self.visType is not None and self.visType == "ttest":
                vizStats = VIZ[self.visType](
                    self.inputs["Y1"], self.inputs["Y2"])

                stat = self.inputs["results"].getStat("tstat")
                # determine p's range
                p = self.inputs["results"].getStat("pvalue")
                sign = checkPRange(p)

                title = "T Test, t = {:.4f}, p {}".format(stat, sign)

                viz = {
                    "vizType": "ttest",
                    "xLabel": "group",
                    "yLabel": "values",
                    "title": title,
                    "vizStats": vizStats,
                }
                vizs = [viz]
                self.changeConfig("viz", vizs)

        self.done = True
