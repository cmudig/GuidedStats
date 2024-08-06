from typing import Iterable
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats
import pandas as pd
from .metrics import METRICS
from .viz import VIZ

ASSUMPTIONS = {
    "outlier": {
        "display": "Outliers Checking",
        "isSingleColumn": True,
        "vis_type": "boxplot",
        "metric_func": METRICS["outlier"],
        "prompt": '{stats} outlier(s) fall outside of the "interquartile range" (IQR)',
        "suggestions": [
            {
                "message": "Remove outliers from the dataset to improve the model's fit.",
                "action": "remove_outliers",
            },
            {
                "message": "Consider transforming outliers to reduce their impact on the model.",
                "action": "transform_outliers",
            },
            {
                "message": "The outliers may be valid data points, so consider investigating them further before removing them.",
                "action": "investigate_outliers",
            }
        ]
    },
    "levene": {
        "display": "Levene Test",
        "isSingleColumn": True,
        "vis_type": "multiBoxplot",
        "metric_func": METRICS["levene"],
        "prompt": "The p-value of Levene Test is {pvalue}, which {rejectIndicator} the null hypothesis that the variances are equal",
        "suggestions": [
            {
                "message": "If the assumption of homogeneity of variance is violated, select False for the equal_var parameter in the t-test. Otherwise, select True with caution.",
                "action": "set_equal_variance",
            }
        ]

    },
    "normality": {
        "display": "Normality Test",
        "isSingleColumn": True,
        "vis_type": "density",
        "metric_func": METRICS["sharpiro"],
        "prompt": "The p-value of Shapiro-Wilk Test is {pvalue}(n = {count}), which {rejectIndicator} the null hypothesis that the data is normally distributed",
        "suggestions": [
            {
                "message": "If the assumption of normality is heavily violated, consider using a non-parametric test like the Mann-Whitney U test.",
                "action": "use_mann_whitney",
            },
            {
                "message": "If the sample size is large enough, the t-test is robust to violations of normality.",
                "action": "print_group_size",
            }
        ]
    },
    "multicollinearity": {
        "display": "Multicollinearity Test",
        "isSingleColumn": True,
        "vis_type": "heatmap",
        "metric_func": METRICS["VIF"],
        # A VIF of 1 means that there is no correlation among the jth predictor and the remaining predictor variables, and hence the variance of bj is not inflated at all. The general rule of thumb is that VIFs exceeding 4 warrant further investigation, while VIFs exceeding 10 are signs of serious multicollinearity requiring correction.
        "prompt": "The VIF of the predictor is {stats}. {annotation}",
        "suggestions": [
            {
                "message": "Consider other combinations of variables that may be less correlated.",
                "action": "perform_VIF",
            },
        ]
    },
    "linearity": {
        "display": "Check Linearity",
        "isSingleColumn": True,
        "vis_type": "regression",
        "metric_func": None,
        "prompt": None,
        "suggestions": [
            {
                "message": "The linearity is not strictly required, as it is rare in practice.",
                "action": None
            },
            {
                "message": "Consider transforming variables to better represent the relationship between the independent and dependent variables.",
                "action": "transform_variables",
            }
        ]
    }

}


class AssumptionWrapper(object):
    def __init__(self):
        self._assumption = None
        self._assumptionName = None
        self.selfDefinedAssumptions = {}
        self.allExtraStats = []

    def addAssumption(self, assumptionName: str, assumption: dict):
        """
        Args:
            assumptionName (str): the name of the assumption
            assumption (dict): assumption should take the form of  {
                "display": str,
                "isSingleColumn": bool,
                "vis_type": str | None,
                "metric_func": list[function] | None,
                "prompt": str,
            }       
        """
        # TBC, should check the assumption type
        self.selfDefinedAssumptions[assumptionName] = assumption

    def setAssumption(self, assumptionName: str):
        temp = {**ASSUMPTIONS, **self.selfDefinedAssumptions}
        if assumptionName in temp.keys():
            self._assumption = temp[assumptionName]
            self._assumptionName = assumptionName
        else:
            raise KeyError("The assumption does not exist")

    def checkAssumption(self, X: pd.DataFrame, *referenceXs: pd.DataFrame, **kwargs):
        self.allExtraStats = []
        assumptionResults = []
        vizStats = []
        if self._assumption["isSingleColumn"]:
            for col in X.columns:
                previousInputs = kwargs.get("previousInputs", None)
                if previousInputs is not None:
                    previousX = list(previousInputs.values())[0][col]
                else:
                    previousX = None
                if self._assumption["vis_type"] is not None:
                    stats = VIZ[self._assumption["vis_type"]](
                        X[col], *referenceXs, previousX=previousX, **kwargs)
                    vizStats.append(stats)

                if self._assumption["metric_func"] is not None:
                    outputs = self._assumption["metric_func"](
                        X[[col]], *referenceXs, previousX=previousX, **kwargs)

                    extraStats = outputs.pop("extraStats", None)
                    if extraStats is not None:
                        self.allExtraStats.append(extraStats)

                    prompt = self._assumption["prompt"].format(**outputs)
                    assumptionResults.append(
                        {**outputs, "name": str(col), "prompt": prompt})
                else:
                    assumptionResults.append(
                        {"name": str(col), "prompt": None})

        vizs = [{"vizType": self._assumption["vis_type"],
                 "vizStats": vizStat} for vizStat in vizStats]

        return assumptionResults, vizs
