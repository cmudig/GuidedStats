from typing import Iterable
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats
import pandas as pd
from .metrics import METRICS
from . import viz as viz
    
ASSUMPTIONS = {
    "outlier": {
        "display": "Outliers Checking",
        "isSingleColumn": True,
        "vis_type": "boxplot",
        "vis_func": viz.outlierVizStats,
        "metric_func": [METRICS["outlier"]],
        "fillNum":[[0]], #fillNum is used to indicate which number in the output of metric_func should be filled in the prompt
        "prompt": 'There are {0} outliers fall outside of the "interquartile range" (IQR)',
    },
    "levene": {
        "display": "Levene Test",
        "isSingleColumn": True,
        "vis_type": "density",
        "vis_func": viz.densityVizStats,
        "metric_func": [METRICS["levene"]],
        "fillNum":[[1,2]],
        "prompt": "The p-value of Levene Test is {0}, which {1} the null hypothesis that the variances are equal",
    },
    "normality": {
        "display": "Normality Test",
        "isSingleColumn": True,
        "vis_type": "density",
        "vis_func": viz.normalityVizStats,
        "metric_func": [METRICS["sharpiro"]],
        "fillNum":[[1,2]],
        "prompt": "The p-value of Shapiro-Wilk Test is {0}, which {1} the null hypothesis that the data is normally distributed",
    },
    "multicollinearity": {
        "display": "Multicollinearity Test",
        "isSingleColumn": True,
        "vis_type": "heatmap",
        "vis_func": viz.multicollinearityVizStats,
        "metric_func": [METRICS["VIF"]],
        "fillNum":[[0,1]],
        # A VIF of 1 means that there is no correlation among the jth predictor and the remaining predictor variables, and hence the variance of bj is not inflated at all. The general rule of thumb is that VIFs exceeding 4 warrant further investigation, while VIFs exceeding 10 are signs of serious multicollinearity requiring correction.
        "prompt": "The VIF of the predictor is {0}, which indicates {1} multicollinearity",
        
    }
}

class AssumptionWrapper(object):
    def __init__(self):
        self._assumption = None
        self._assumptionName = None
        self.selfDefinedAssumptions = {}
        
    def addAssumption(self,assumptionName:str,assumption:dict):
        """
        Args:
            assumptionName (str): the name of the assumption
            assumption (dict): assumption should take the form of  {
                "display": str,
                "isSingleColumn": bool,
                "vis_func": function | None,
                "metric_func": list[function] | None,
                "prompt": str,
            }       
        """
        #TBC, should check the assumption type
        self.selfDefinedAssumptions[assumptionName] = assumption
        
    def setAssumption(self,assumptionName:str):
        temp = {**ASSUMPTIONS,**self.selfDefinedAssumptions}
        if assumptionName in temp.keys():
            self._assumption = temp[assumptionName]
            self._assumptionName = assumptionName
        else:
            raise KeyError("The assumption does not exist")
        
    def checkAssumption(self,X:pd.DataFrame,*referenceXs:pd.DataFrame):
        print("******"+self._assumption["display"]+"******")
        
        #TBC
        assumptionResults = []
        vizStats = []
        if self._assumption["isSingleColumn"]:
            for col in X.columns:  
                if self._assumption["vis_func"] is not None:
                    stats = self._assumption["vis_func"](X[col],*referenceXs)
                    vizStats.append(stats)
                    
                if self._assumption["metric_func"] is not None:
                    metrics = []
                    for i,metric_func in enumerate(self._assumption["metric_func"]):
                        outputs = metric_func(X[[col]],*referenceXs)
                        metrics += [outputs[num] for num in self._assumption["fillNum"][i]]
                    
                prompt = self._assumption["prompt"].format(*metrics)
                assumptionResults.append({"name":str(col),"prompt":prompt})
        
        
        vizs = [{"vizType":self._assumption["vis_type"],"vizStats":vizStat} for vizStat in vizStats]
          
        return assumptionResults, vizs

if __name__ == "__main__":
    a = AssumptionWrapper()
    a.setAssumption("outlier")
    a.checkAssumptipon(pd.DataFrame({"test":[1,2,3,34,4,4,5,-20],"test2":[2,3,4,5,6,310,-2,2]}))