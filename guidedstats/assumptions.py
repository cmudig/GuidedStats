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
    },
    "levene": {
        "display": "Levene Test",
        "isSingleColumn": True,
        "vis_type": "multiBoxplot",
        "metric_func": METRICS["levene"],
        "prompt": "The p-value of Levene Test is {pvalue}, which {rejectIndicator} the null hypothesis that the variances are equal",
    },
    "normality": {
        "display": "Normality Test",
        "isSingleColumn": True,
        "vis_type": "density",
        "metric_func": METRICS["sharpiro"],
        "prompt": "The p-value of Shapiro-Wilk Test is {pvalue}, which {rejectIndicator} the null hypothesis that the data is normally distributed",
    },
    "multicollinearity": {
        "display": "Multicollinearity Test",
        "isSingleColumn": True,
        "vis_type": "heatmap",
        "metric_func": METRICS["VIF"],
        # A VIF of 1 means that there is no correlation among the jth predictor and the remaining predictor variables, and hence the variance of bj is not inflated at all. The general rule of thumb is that VIFs exceeding 4 warrant further investigation, while VIFs exceeding 10 are signs of serious multicollinearity requiring correction.
        "prompt": "The VIF of the predictor is {stats}. {annotation}",
    }
}


class AssumptionWrapper(object):
    def __init__(self):
        self._assumption = None
        self._assumptionName = None
        self.selfDefinedAssumptions = {}

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
                    prompt = self._assumption["prompt"].format(**outputs)
                    assumptionResults.append(
                        {**outputs, "name": str(col), "prompt": prompt})

        vizs = [{"vizType": self._assumption["vis_type"],
                 "vizStats": vizStat} for vizStat in vizStats]

        return assumptionResults, vizs


if __name__ == "__main__":
    a = AssumptionWrapper()
    a.setAssumption("outlier")
    a.checkAssumptipon(pd.DataFrame(
        {"test": [1, 2, 3, 34, 4, 4, 5, -20], "test2": [2, 3, 4, 5, 6, 310, -2, 2]}))
