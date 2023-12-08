import statsmodels.api as sm
from statsmodels.stats.weightstats import ttest_ind
import pandas as pd


def naiveLR(X, Y=None):
    X_wconstant = sm.add_constant(X)
    model = sm.OLS(Y, X_wconstant)
    results = model.fit()
    return (model, results)


def RidgeLR(X, Y=None, alpha=1.0):
    X_wconstant = sm.add_constant(X)
    model = sm.OLS(Y, X_wconstant)
    results = model.fit_regularized(
        method='elastic_net', alpha=float(alpha), L1_wt=0.0)
    return (model, results)


def LassoLR(X, Y=None, alpha=1.0):
    X_wconstant = sm.add_constant(X)
    model = sm.OLS(Y, X_wconstant)
    results = model.fit_regularized(
        method='elastic_net', alpha=float(alpha), L1_wt=1.0)
    return (model, results)


def TTest(X1, X2, alpha=0.05, alternative="two-sided"):
    tstats, pvalue, _ = ttest_ind(X1, X2, alternative=alternative)
    results = Results(float(tstats), float(pvalue))
    return (results,)


models = {
    "Simple Linear Regression": {
        "func": naiveLR,
        "canPredict": True, },
    "Ridge Regression": {
        "func": RidgeLR,
        "canPredict": True, },
    "Lasso Regression": {
        "func": LassoLR,
        "canPredict": True, },
    "T Test": {
        "func": TTest,
        "canPredict": False, },
}


class Results(object):
    def __init__(self, tstats, pvalue):
        self.params = [tstats]
        self.pvalues = [pvalue]


class ModelWrapper(object):
    def __init__(self):
        self._model = None
        self._results = None
        self._modelName = None
        self.fittedModel = None
        self._canPredict = False

    def setModel(self, modelName: str):
        if modelName in models.keys():
            self._model = models[modelName]["func"]
            self._canPredict = models[modelName]["canPredict"]
            self._modelName = modelName

        else:
            raise KeyError("The model does not exist")

    def fit(self, X: pd.DataFrame, Y: pd.Series | pd.DataFrame = None, **kwargs):
        if Y is None:
            outputs = self._model(X, **kwargs)
            if len(outputs) == 2:
                (self.fittedModel, self._results) = outputs
            else:
                (self._results,) = outputs
            return self, self._results
        else:
            if isinstance(Y, pd.Series) or isinstance(Y, pd.DataFrame):
                outputs = self._model(X, Y, **kwargs)
                if len(outputs) == 2:
                    (self.fittedModel, self._results) = outputs
                else:
                    (self._results,) = outputs
                return self, self._results
            else:
                raise TypeError("Y should be a pandas Series or DataFrame")
