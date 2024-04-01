from abc import abstractmethod
import json
import copy
import re
import textwrap
import traitlets as tl
import numpy as np
import pandas as pd
import statsmodels.api as sm
from .utils import CATEGORICAL_DTYPES, checkPRange, getUniqueValues
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
    def export(self):
        """
        export the current step to code
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
        return self.metric.compute(X, Y=referenceXs)

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
                    result["score"] = outputs["stats"]
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
        
    def export(self):
        code = f"""# Step {self.stepId + 1}: {self.stepName}\n"""
        code += textwrap.dedent(f"""import pandas as pd\n""")
        return code

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

    def export(self):
            step_no = self.stepId + 1
            columns = ["'" + variable["name"] +
                       "'" for variable in self.config["variableResults"]]
            columns = ",".join(columns)
            code = textwrap.dedent(f"""\n# Step {step_no}: {self.stepName}\n{self.outputNames[0]} = {self.workflow.datasetName}[[{columns}]]\n""")
            
            if self._variableType == "independent variables":
                code += f"""exog = {self.outputNames[0]}\n"""
                
            return code

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
                candidateColumns = [
                    {"name": col} for col in dataset.columns if dataset[col].dtype in CATEGORICAL_DTYPES]
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
                groups = [newConfig["groupResults"][i]["name"]
                          for i in range(len(newConfig["groupResults"]))]
                for i in range(len(self.outputNames)):
                    group = newConfig["groupResults"][i]["name"]
                    self.outputs[self.outputNames[i]
                                 ] = self.inputs["Y1"][self.inputs["dataset"][selectedColumns[0]] == group]
                    self.outputs["groups"] = groups
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
        self.assumption = None
        # get inputNames
        self.previousSteps = kwargs.get("inputNames", None)
        self.transformedDataset = None

        if assumptionName is not None:
            self.assumption = AssumptionWrapper()
            self.assumption.setAssumption(assumptionName)
            self.changeConfig("assumptionName", assumptionName)

    def clear(self):
        self.config.pop("assumptionResults", None)
        self.config.pop("viz", None)

    def export(self):
        import inspect
        code = f"\n# Step {self.stepId + 1}: {self.stepName}\n"
        metric_code = inspect.getsource(
            self.assumption._assumption["metric_func"])
        code += metric_code

        sig = inspect.signature(self.assumption._assumption["metric_func"])

        # Get a list of the function's parameters
        params = sig.parameters.values()

        # Filter the list to include only parameters that do not have a default value
        non_optional_params = [
            param.name for param in params if param.default is param.empty and param.name not in ["args", "kwargs"]]

        # Call the function in the exported paragraph

        # it should be loop through columns of"
        code += f"for col in {self.inputNames[0]}.columns:"

        arguments = []
        # Match the inputNames with the non-optional parameters
        for i, param in enumerate(non_optional_params):
            if i == 0:
                arguments.append(f"{param} = {self.inputNames[i]}" + "[[col]]")
            else:
                arguments.append(f"{param} = {self.inputNames[i]}")

        code += f"""\n    outputs = {
            self.assumption._assumption['metric_func'].__name__}({",".join(arguments)})"""
        code += f"\n    print('{self.assumption._assumption['prompt']}'.format(**outputs))\n"

        return code

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if self.config.get("assumptionResults", None) is not None:

                # update self.inputs andd dataframe
                if self.transformedDataset is not None:
                    self.workflow.current_dataframe = self.transformedDataset
                    self.outputs["dataset"] = self.transformedDataset

                if self.outputNames is not None:
                    for i, outputName in enumerate(self.outputNames):
                        ipt = list(self.inputs.values())[i]
                        if self.transformedDataset is not None:
                            self.outputs[outputName] = self.transformedDataset[ipt.columns]
                        else:
                            self.outputs[outputName] = ipt
                else:
                    self.outputs = self.getPreviousOutputs()

                self.moveToNextStep()
            else:
                self.toExecute = False

    @tl.observe("config")
    def onObserveConfig(self, change):
        if "variableResults" in change["new"] and "transformationName" in change["new"]:
            transformationName = change["new"]["transformationName"]
            self._transformation = TransformationWrapper()
            self._transformation.setTransformation(transformationName)
            self._transformationName = transformationName

            columns = [option["name"]
                       for option in self.config["variableResults"]]

            dataset = self.workflow.current_dataframe

            (transformedDataset, msg) = self._transformation.transform(
                dataset, columns)
            if transformedDataset is not None:
                self.transformedDataset = transformedDataset
                inputs = copy.deepcopy(self.inputs)
                for key in inputs.keys():
                    inputs[key] = self.transformedDataset[inputs[key].columns]
                self.checkAssumption(
                    inputs, previousInputs=self.inputs, groups=self.inputs.get("groups", None))
            if msg is not None:
                self.workflow.message = msg

    def checkAssumption(self, inputs: dict, **kwargs):
        # 2. check assumption
        assumptionResults, vizs = self.assumption.checkAssumption(
            *tuple(inputs.values()), **kwargs)
        # 3. set config
        self.changeConfig("assumptionResults", assumptionResults)
        self.changeConfig("viz", vizs)

    def forward(self, **inputs):

        # 1. get outputs from previous step, and assign it as the current input
        self.inputs = inputs

        if self.assumption is not None:
            if self.workflow is not None and self.workflow.currentStep is not None:
                self.checkAssumption(
                    self.inputs, groups=self.inputs.get("groups", None))


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

    def export(self):
        code = textwrap.dedent(f"""\n# Step {self.stepId + 1}: {self.stepName}\n
import numpy as np
trainSize = {self.config["trainSize"]}

indices = np.arange(len(X))
np.random.shuffle(indices)
train_indices = indices[:int(len(indices)*float(trainSize))]
test_indices = indices[int(
    len(indices)*(float(trainSize))):]

XTrain = X.iloc[train_indices]
XTest = X.iloc[test_indices]
yTrain = Y.iloc[train_indices]
yTest = Y.iloc[test_indices]\n""")
        return code

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
        self.config.pop("modelParameters", None)

    def export(self):
        import inspect
        code = textwrap.dedent(f"""\n# Step {self.stepId + 1}: {self.stepName}
from guidedstats.model import Results\n""")
        arguments = []

        sig = inspect.signature(self.modelWrapper._model)

        # Get a list of the function's parameters
        params = sig.parameters.values()

        # Filter the list to include only parameters that do not have a default value
        non_optional_params = [
            param.name for param in params if param.default is param.empty and param.name not in ["args", "kwargs"]]

        for i, param in enumerate(non_optional_params):
            if i == 0:
                arguments.append(f"{param} = {self.inputNames[i]}")

        if self.config.get("modelParameters", None) is not None:
            for parameter in self.config["modelParameters"]:
                arguments.append(f"{parameter['name']} = {parameter['value']}")

        code += inspect.getsource(self.modelWrapper._model)
        # remove results.setStat("x2xx", yy4y) from the code
        code = re.sub(
            r"results.setStat\(\"[a-zA-Z0-9]*\", [a-zA-Z0-9]*\)", "", code)

        code += f"""model,results = {self.modelWrapper._model.__name__}({",".join(arguments)})\n"""
        return code

    @tl.observe("config")
    def onObserveConfig(self, change):
        if "modelName" in change["new"] and change["new"].get("modelName", None) != change["old"].get("modelName", None):
            self.config.pop("modelParameters", None)
            modelName = change["new"]["modelName"]
            self.modelWrapper.setModel(modelName)

    @tl.observe("toExecute")
    def onObserveToExecute(self, change):
        if change["old"] == False and change["new"] == True:
            if self.config.get("modelName", None) is not None:
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

        self.columns = None

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

    def export(self):
        import inspect
        code = textwrap.dedent(f"""\n# Step {self.stepId + 1}: {self.stepName}\n
params = results.getStat("params")
p_values = results.getStat("pvalues")
columns = {self.columns}
print("Model Parameters")
for i, col in enumerate(columns):
    print(col, "coefficient:", round(params[i], 4), "pvalue:", round(p_values[i], 6))""")
        # if model can predict
        model = self.inputs["model"]
        if model._canPredict:
            code += textwrap.dedent('''
Y_hat_train = model.predict(XTrain)
Y_hat_train = Y_hat_train.to_numpy().reshape((-1))
Y_true_train = yTrain.to_numpy().reshape((-1))''')
            
            if len(self.inputs["yTest"]) > 0:
                code += textwrap.dedent('''
Y_hat_test = model.predict(XTest)
Y_hat_test = Y_hat_test.to_numpy().reshape((-1))
Y_true_test = yTest.to_numpy().reshape((-1))''')

            for metric in self.metricWrappers:
                code += inspect.getsource(metric._metric)
                code += f"""\nprint("Training Set {metric._metricName}")"""
                code += f"""\noutputs = {metric._metric.__name__}(Y_true_train, Y_hat_train, XTrain)"""
                code += f"""\nprint('{metric._metricName}', round(outputs["stats"], 4))\n"""
                
                if len(self.inputs["yTest"]) > 0:
                    code += inspect.getsource(metric._metric)
                    code += f"""\nprint("Test Set {metric._metricName}")"""
                    code += f"""\noutputs = {metric._metric.__name__}(Y_true_test, Y_hat_test, XTest)"""
                    code += f"""\nprint('{metric._metricName}', round(outputs["stats"], 4))\n"""
        return code

    def update_model_parameters(self, model, results, columns):
        params = results.getStat("params")
        p_values = results.getStat("pvalues")
        rows = []
        for i, col in enumerate(columns):
            if p_values is not None:
                rows.append({"name": col, "value": round(
                    params[i], 4), "pvalue": round(p_values[i], 6)})
            else:
                rows.append({"name": col, "value": round(params[i], 4)})
        self.changeConfig("modelParameters", rows)

    def evaluate_model(self, model, XTrain, XTest, yTrain, yTest):
        modelResults = []
        if model._canPredict:
            Y_hat_train = model.predict(XTrain)
            Y_hat_train = Y_hat_train.to_numpy().reshape((-1))
            Y_true_train = yTrain.to_numpy().reshape((-1))

            for metric in self.metricWrappers:
                outputs = metric.compute(Y_true_train, Y_hat_train, XTrain)
                modelResults.append(
                    {"name": metric._metricName, "score": round(outputs["stats"], 4), "group": "Train"})

            if len(yTest) > 0:
                Y_hat_test = model.predict(XTest)
                Y_hat_test = Y_hat_test.to_numpy().reshape((-1))
                Y_true_test = yTest.to_numpy().reshape((-1))

                for metric in self.metricWrappers:
                    outputs = metric.compute(Y_true_test, Y_hat_test, XTest)
                    modelResults.append(
                        {"name": metric._metricName, "score": round(outputs["stats"], 4), "group": "Test"})

        self.changeConfig("modelResults", modelResults)

    def generate_residual_viz(self, model, XTrain, XTest, yTrain, yTest):
        vizStats = []
        if model._canPredict:
            Y_hat_test = model.predict(XTest).to_numpy().reshape((-1))
            Y_true_test = yTest.to_numpy().reshape((-1))
            vizStats.extend(VIZ['residual'](
                Y_hat_test, Y_true_test, group="Test"))

            Y_hat_train = model.predict(XTrain).to_numpy().reshape((-1))
            Y_true_train = yTrain.to_numpy().reshape((-1))
            vizStats.extend(VIZ['residual'](
                Y_hat_train, Y_true_train, group="Train"))

            viz = {
                "vizType": "scatter",
                "xLabel": "Predicted {}".format(yTest.columns[0]),
                "yLabel": "Residuals",
                "vizStats": vizStats,
            }
            vizs = [viz]
            self.changeConfig("viz", vizs)

    def generate_ttest_viz(self, Y1, Y2, results):
        vizStats = VIZ['ttest'](Y1, Y2, groups=self.inputs.get("groups", None))
        stat = results.getStat("params")[0]
        p = results.getStat("pvalues")[0]
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

    def forward(self, **inputs):
        self.inputs = inputs
        model = self.inputs["model"]
        results = self.inputs["results"]

        if self.visType == "residual":
            XTest = self.inputs["XTest"]
            XTrain = self.inputs["XTrain"]
            yTest = self.inputs["yTest"]
            yTrain = self.inputs["yTrain"]

            self.columns = ["const"] + list(XTrain.columns)
            self.update_model_parameters(model, results, columns=self.columns)
            self.evaluate_model(model, XTrain, XTest, yTrain, yTest)
            self.generate_residual_viz(model, XTrain, XTest, yTrain, yTest)
        elif self.visType == "ttest":
            Y1 = self.inputs["Y1"]
            Y2 = self.inputs["Y2"]

            self.columns = ["T Statistic"]
            self.update_model_parameters(model, results, columns=self.columns)
            self.generate_ttest_viz(Y1, Y2, results)

        self.done = True
