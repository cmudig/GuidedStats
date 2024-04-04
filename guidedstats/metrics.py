"""
This file contains selectable metrics for ranking
"""
from typing import Callable
import pandas as pd

from .utils import QUANTITATIVE_DTYPES

"""
A Metric should allow user to define their own metrics,
some built-in functions are provided

format of a metric function:
def metric(X: Iterable, Y: Iterable = None, *args, **kwargs):
    # X is the target column
    # Y is the reference column
    # *args and **kwargs are additional arguments
    # return a dictionary containing the metric score and p-value(optional)
    # for example:
    return {
        "stats": stats,
        "pvalue": pvalue,
        "rejectIndicator": rejectIndicator,
        "annotation": annotation
    }
"""

def pearson(X, Y, *args, **kwargs):
    import scipy.stats as spstats
    import numpy as np
    stats, pvalue = spstats.pearsonr(X, np.array(Y).reshape((-1)))
    return {
        "stats": stats,
        "pvalue": pvalue,
    }


def skewness(X, Y = None, *args, **kwargs):
    import scipy.stats as spstats
    stats, pvalue = spstats.skew(X)
    return {
        "stats": stats,
        "pvalue": pvalue,
    }


def kurtosis(X, Y = None, *args, **kwargs):
    import scipy.stats as spstats
    stats = spstats.kurtosis(X)
    return {
        "stats": stats,
    }


def outlier(X, Y = None, *args, **kwargs):
    import numpy as np
    X = X.to_numpy().reshape((-1))
    previousX = kwargs.get("previousX", None)
    if previousX is not None:
        previousX = previousX.to_numpy().reshape((-1))
        Q1 = np.percentile(previousX, 25)
        Q3 = np.percentile(previousX, 75)
        IQR = Q3 - Q1
    else:
        Q1 = np.percentile(X, 25)
        Q3 = np.percentile(X, 75)
        IQR = Q3 - Q1

    # Define the outlier thresholds
    lower_threshold = Q1 - 1.5 * IQR
    upper_threshold = Q3 + 1.5 * IQR

    count = 0
    for item in X:
        if item < lower_threshold or item > upper_threshold:
            count += 1
    return {
        "stats": count,
    }


def levene(Y1, Y2, *args, **kwargs):
    import numpy as np
    import scipy.stats as spstats
    # Perform Levene test for testing equal variances.
    Y1 = np.array(Y1).reshape(-1).tolist()
    Y2 = np.array(Y2).reshape(-1).tolist()
    stats, p = spstats.levene(Y1, Y2)
    stats, p = round(stats, 6), round(p, 6)

    if p < 0.05:
        phrase = "does reject"
    else:
        phrase = "does not reject"
    return {
        "stats": stats,
        "pvalue": p,
        "rejectIndicator": phrase
    }


def sharpiro(X, Y = None, *args, **kwargs):
    import scipy.stats as spstats
    stats, p = spstats.shapiro(X)
    stats, p = round(stats, 6), round(p, 6)

    if p < 0.05:
        phrase = "does reject"
    else:
        phrase = "does not reject"
    return {
        "stats": stats,
        "pvalue": p,
        "rejectIndicator": phrase
    }


def mse(y_true, y_pred, *args, **kwargs):
    import numpy as np
    stats = np.mean((np.array(y_true)-np.array(y_pred))**2)
    return {
        "stats": stats,
    }


def r2(y_true, y_pred, *args, **kwargs):
    from sklearn.metrics import r2_score
    stats = r2_score(y_true, y_pred)
    return {
        "stats": stats,
    }


def adjusted_r2(y_true, y_pred, *args, **kwargs):
    from sklearn.metrics import r2_score
    n = len(y_true)
    exogs = args[0]
    p = exogs.shape[1]
    r2 = r2_score(y_true, y_pred)
    stats = 1 - (1-r2)*(n-1)/(n-p-1)
    return {
        "stats": stats,
    }


def VIF(exog: pd.DataFrame, design_matrix: pd.DataFrame, *args, **kwargs):
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    QUANTITATIVE_DTYPES = ['float64', 'int64']
    # find the index of exog in design_matrix
    other_exogs = []
    for i in range(design_matrix.shape[1]):
        if design_matrix.columns[i] != exog.columns[0] and design_matrix.iloc[:, i].dtype in QUANTITATIVE_DTYPES:
            other_exogs.append(design_matrix.iloc[:, i])
    # concatenate other exogs with exog
    if len(other_exogs) != 0:
        design_matrix = pd.concat(other_exogs, axis=1)
        design_matrix = pd.concat([exog, design_matrix], axis=1)
        vif = variance_inflation_factor(design_matrix.values, 0)
        vif = round(vif, 6)
        return {
            "stats": vif,
            "annotation": ""
        }
    else:
        vif = None

    return {
        "stats": vif,
        "annotation": "for one predictor, there is no need to check multicollinearity"
    }


METRICS = {
    "pearson": pearson,
    "skewness": skewness,
    "kurtosis": kurtosis,
    "outlier": outlier,
    "levene": levene,
    "sharpiro": sharpiro,
    "mse": mse,
    "r2": r2,
    "adjusted_r2": adjusted_r2,
    "VIF": VIF,
}
# TBC, currently we only support metrics for quantitative variables


class MetricWrapper(object):
    def __init__(self):
        self._metric = None
        self._metricName = None
        self.selfDefinedMetrics = {}

    def addMetric(self, metricName: str, metric: Callable):
        """
        Args:
            metricName (str): the name of the metric
            metric (Callable): a function taking at least one columns and return the metric score and p-value(optional), the higher the better
        """
        # TBC the higher the better or the lower the better should let users choose
        if isinstance(metric, Callable):
            raise TypeError("metric is not a function")
        if metric.__code__.co_argcount < 1:
            raise TypeError("metric should take at least one column")
        # TBC, should check the output type
        self.selfDefinedMetrics[metricName] = metric

    def setMetric(self, metricName: str):
        temp = {**METRICS, **self.selfDefinedMetrics}
        if metricName in temp.keys():
            self._metric = temp[metricName]
            self._metricName = metricName
        else:
            raise KeyError("The metric does not exist")

    def compute(self, X, Y, *referenceXs):
        
        outputs = self._metric(X, Y, *referenceXs)
        
        return outputs


if __name__ == "__main__":
    # unit test for all functions below
    # TBC
    def test_sharpiro():
        import numpy as np
        x = np.array([1, 2, 3, 4, 5])
        result = sharpiro(x)
        print(result)
    test_sharpiro()

    def test_vif():
        X = pd.DataFrame({"x1": [1, 2, 3, 4, 5], "x2": [
                         8, 3, 4, 5, 6], "x3": [3, 10, 5, 9, 7]})
        result = VIF(X[["x1"]], X)
        print(result)
    test_vif()
