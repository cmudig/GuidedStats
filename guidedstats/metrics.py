"""
This file contains selectable metrics for ranking
"""
from typing import Callable, Iterable
import numpy as np
import scipy.stats as spstats
from sklearn.metrics import r2_score
from statsmodels.stats.outliers_influence import variance_inflation_factor

"""
A Metric should allow user to define their own metrics,
some built-in functions are provided
"""

def pearson(x,y):
    stats,pvalue = spstats.pearsonr(x,y.to_numpy().reshape((-1)))
    #TBC, should compare by absolute value but display by the real value
    return (abs(stats),pvalue)

def skewness(x):
    stats, pvalue = spstats.skew(x)
    return (stats[0],pvalue)

def kurtosis(x):
    stats = spstats.kurtosis(x)
    return (stats,)

def outlier(x):
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
    
    
def r2(y_true,y_pred):
    r2_score(y_true,y_pred)
    
def VIF(exog,*other_exogs):
    exogs = np.array([exog,*other_exogs])
    vif = variance_inflation_factor(exogs,0)
    return (vif)

metrics = {
    "pearson": pearson,
    "skewness": skewness,
    "kurtosis": kurtosis,
    "outlier": outlier,
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
        temp = {**metrics,**self.selfDefinedMetrics}
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
    #Test Example
    wrapper = MetricWrapper()
    wrapper.setMetric("pearson")
    print(wrapper.compute([1,2,3,4],[6,7,3,45]))