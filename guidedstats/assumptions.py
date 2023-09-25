from typing import Iterable
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from .metrics import metrics

def outlier(X:Iterable,max_outlier=10):
    
    q1 = np.quantile(X,0.25)
    median = np.median(X)
    q3 = np.quantile(X,0.75)
    iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    upper_outliers = sorted([x for x in X if x > upper_bound])
    lower_outliers = sorted([x for x in X if x < lower_bound],reverse=True)
    
    outliers = []
    for i in range(1,min(len(upper_outliers),11)):
        outliers.append(upper_outliers[-i])
    for i in range(1,min(len(lower_outliers),11)):
        outliers.append(lower_outliers[-i])
    # outliers.extend(np.argsort(upper_outliers)[-min(len(upper_outliers),10):])
    # outliers.extend(np.argsort(lower_outliers)[:min(len(lower_outliers),10)])
    
    stats = {
        "lower": lower_bound,
        "q1": q1,
        "median": median,
        "q3": q3,
        "upper": upper_bound,
        "outliers": outliers
    }
    
    return stats
    
assumptions = {
    "outlier": {
        "display": "Outliers Checking",
        "isSingleColumn": True,
        "vis_type": "boxplot",
        "vis_func": outlier,
        "metric_func": [metrics["outlier"]],
        "prompt": 'There are {0} outliers fall outside of the "interquartile range" (IQR)',
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
        temp = {**assumptions,**self.selfDefinedAssumptions}
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
                print("Result of {}".format(col))      
                if self._assumption["vis_func"] is not None:
                    stats = self._assumption["vis_func"](X[col])
                    stats = {"name":str(col),**stats}
                    vizStats.append(stats)
                    
                if self._assumption["metric_func"] is not None:
                    metrics = []
                    for metric_func in self._assumption["metric_func"]:
                        outputs = metric_func(X[col])
                        metric = outputs[0]
                        metrics.append(metric)
                    
                prompt = self._assumption["prompt"].format(*metrics)
                assumptionResults.append({"name":str(col),"prompt":prompt})
        
        viz = {"vizType":"boxplot","vizStats":vizStats}
          
        return assumptionResults, viz

if __name__ == "__main__":
    a = AssumptionWrapper()
    a.setAssumption("outlier")
    a.checkAssumptipon(pd.DataFrame({"test":[1,2,3,34,4,4,5,-20],"test2":[2,3,4,5,6,310,-2,2]}))