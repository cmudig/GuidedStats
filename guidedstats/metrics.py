"""
This file contains selectable metrics for ranking
"""
from typing import Callable, Iterable
import numpy as np
import pandas as pd
import scipy
import scipy.stats as spstats
from sklearn.metrics import r2_score
from statsmodels.stats.outliers_influence import variance_inflation_factor

from .utils import QUANTITATIVE_DTYPES

"""
A Metric should allow user to define their own metrics,
some built-in functions are provided

format of a metric function:
    def metric(x,y=None,*args) -> tuple[float,float] | float:
        return (statistics,pvalue(optional))
"""

def pearson(x,y,*args):
    stats,pvalue = spstats.pearsonr(x,y.to_numpy().reshape((-1)))
    #TBC, should compare by absolute value but display by the real value
    return (abs(stats),pvalue)

def skewness(x,y:Iterable=None,*args):
    stats, pvalue = spstats.skew(x)
    return (stats[0],pvalue)

def kurtosis(x,y:Iterable=None,*args):
    stats = spstats.kurtosis(x)
    return (stats,)

def outlier(x,y:Iterable=None,*args):
    x = x.to_numpy().reshape((-1))
    Q1 = np.percentile(x, 25)
    Q3 = np.percentile(x, 75)
    IQR = Q3 - Q1

    # Define the outlier thresholds
    lower_threshold = Q1 - 1.5 * IQR
    upper_threshold = Q3 + 1.5 * IQR
    
    count = 0
    for item in x:
        if item < lower_threshold or item > upper_threshold:
            count += 1
    return (count,)

def levene(Y1:Iterable,Y2:Iterable,*args):
    #Perform Levene test for testing equal variances.
    Y1 = np.array(Y1).reshape(-1).tolist()
    Y2 = np.array(Y2).reshape(-1).tolist()
    stats,p = scipy.stats.levene(Y1,Y2)
    stats,p = round(stats,6),round(p,6)
    
    if p < 0.05:
        phrase = "does reject"
    else:
        phrase = "does not reject"
    return (stats,p,phrase)

def sharpiro(x,y:Iterable=None,*args):
    stats,p = spstats.shapiro(x)
    stats,p = round(stats,6),round(p,6)
    
    if p < 0.05:
        phrase = "does reject"
    else:
        phrase = "does not reject"
    return (stats,p,phrase)

def mse(y_true,y_pred,*args):
    return (np.mean((np.array(y_true)-np.array(y_pred))**2),)
    
    
def r2(y_true,y_pred,*args):
    stats = r2_score(y_true,y_pred)
    return (stats,)
    
def VIF(exog:pd.DataFrame,design_matrix:pd.DataFrame,*args):
    #find the index of exog in design_matrix
    other_exogs = []
    for i in range(design_matrix.shape[1]):
        if design_matrix.columns[i] != exog.columns[0] and design_matrix.iloc[:,i].dtype in QUANTITATIVE_DTYPES:
            other_exogs.append(design_matrix.iloc[:,i])
    #concatenate other exogs with exog
    design_matrix = pd.concat(other_exogs,axis=1)
    design_matrix = pd.concat([exog,design_matrix],axis=1)
    vif = variance_inflation_factor(design_matrix.values,0)
    vif = round(vif,6)
    if vif > 10:
        phrase = "serious"
    elif vif > 4:
        phrase = "moderate"
    elif vif > 1:
        phrase = "minor"
    else:
        phrase = "no"
    return (vif,phrase)

METRICS = {
    "pearson": pearson,
    "skewness": skewness,
    "kurtosis": kurtosis,
    "outlier": outlier,
    "levene": levene,
    "sharpiro": sharpiro,
    "mse": mse,
    "r2":r2,
    "VIF":VIF,
}
#TBC, currently we only support metrics for quantitative variables

class MetricWrapper(object):
    def __init__(self):
        self._metric = None
        self._metricName = None
        self.selfDefinedMetrics = {}
        
    def addMetric(self,metricName:str,metric:Callable):
        """
        Args:
            metricName (str): the name of the metric
            metric (Callable): a function taking at least one columns and return the metric score and p-value(optional), the higher the better
        """
        #TBC the higher the better or the lower the better should let users choose
        if isinstance(metric,Callable):
            raise TypeError("metric is not a function")
        if metric.__code__.co_argcount < 1:
            raise TypeError("metric should take at least one column")
        #TBC, should check the output type
        self.selfDefinedMetrics[metricName] = metric
        
    def setMetric(self,metricName:str):
        temp = {**METRICS,**self.selfDefinedMetrics}
        if metricName in temp.keys():
            self._metric = temp[metricName]
            self._metricName = metricName
        else:
            raise KeyError("The metric does not exist")
        
    def compute(self,X:Iterable,*referenceXs:Iterable) -> tuple[float,float] | float:
        outputs = self._metric(X,*referenceXs)
        if len(outputs) == 2:
            return {"statistics":outputs[0],"pvalue":outputs[1]}
        elif len(outputs) == 1:
            return {"statistics":outputs[0]}
        else:
            raise ValueError("The metric function should return a statistic and pvalue(optional)")
        

if __name__ == "__main__":
    #unit test for all functions below
    #TBC
    def test_sharpiro():
        x = np.array([1, 2, 3, 4, 5])
        result = sharpiro(x)
        print(result)
    test_sharpiro()
    def test_vif():
        X = pd.DataFrame({"x1":[1,2,3,4,5],"x2":[8,3,4,5,6],"x3":[3,10,5,9,7]})
        result = VIF(X[["x1"]],X)
        print(result)
    test_vif()