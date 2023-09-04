from typing import Iterable
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from .metrics import metrics

def outlier(X:Iterable):
    
    # create a figure and axis
    fig, ax = plt.subplots()
    # create a boxplot
    ax.boxplot(X, vert=False, flierprops=dict(markerfacecolor='g', marker='D'))

    ax.set_title('Boxplot with Outliers')

    plt.show()
    
assumptions = {
    "outlier": {
        "display": "Outliers Checking",
        "isSingleColumn": True,
        "vis_func": outlier,
        "metric_func": [metrics["outlier"]],
        "prompt": "There are {0} outliers fall outside of the 'interquartile range' (IQR) in variable.",
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
        
    def checkAssumptipon(self,X:pd.DataFrame,*referenceXs:pd.DataFrame):
        print("******"+self._assumption["display"]+"******")
        
        #TBC
        assumptionResults = []
        if self._assumption["isSingleColumn"]:
            for col in X.columns:
                print("Result of {}".format(col))      
                if self._assumption["vis_func"] is not None:
                    self._assumption["vis_func"](X[col])
                if self._assumption["metric_func"] is not None:
                    metrics = []
                    for metric_func in self._assumption["metric_func"]:
                        outputs = metric_func(X[col])
                        metric = outputs[0]
                        metrics.append(metric)
                    
                prompt = self._assumption["prompt"].format(*metrics)
                assumptionResults.append({"name":str(col),"prompt":prompt})
          
                
        return assumptionResults

if __name__ == "__main__":
    a = AssumptionWrapper()
    a.setAssumption("outlier")
    a.checkAssumptipon(pd.DataFrame({"test":[1,2,3,34,4,4,5,-20],"test2":[2,3,4,5,6,310,-2,2]}))