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


def TTest(X1, X2, alpha=0.05, alternative="two-sided", equal_var=True):
    usevar = "unequal" if equal_var is False else "pooled"
    tstats, pvalue, df = ttest_ind(X1, X2, alternative=alternative, usevar = usevar)
    results = Results()
    results.setStat("tstat", float(tstats))
    results.setStat("pvalue", float(pvalue))
    results.setStat("df", float(df))
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
    def __init__(self):
        self.stats = {}   
        
    def setStat(self,statName:str,statValue):
        self.stats[statName] = statValue
    
    def getStat(self,statName:str):
        if statName in self.stats:
            return self.stats[statName]
        else:
            return None
    
class ModelWrapper(object):
    def __init__(self):
        self._model = None
        self._results = None
        self._modelName = None
        self.fittedModel = None
        self.stats = None
        self._canPredict = False
        self.num_exog = None

    def setModel(self, modelName: str):
        if modelName in models.keys():
            self._model = models[modelName]["func"]
            self._canPredict = models[modelName]["canPredict"]
            self._modelName = modelName

        else:
            raise KeyError("The model does not exist")

    def predict(self, X: pd.DataFrame, **kwargs):
        if self._canPredict:
            return self.fittedModel.predict(X, **kwargs)
        else:
            raise TypeError("The model does not support prediction")

    def compare(self, modelwrapper):
        from IPython.display import display, HTML

        if self._results is None or modelwrapper._results is None:
            raise TypeError("Both models must be fitted first")

        def format_output(value):
            if isinstance(value, float):
                return f'{value:.4f}'
            return value

        # Function to format the output with significance stars
        def significance_stars(pvalue):
            if pvalue < 0.001:
                return '***'
            elif pvalue < 0.01:
                return '**'
            elif pvalue < 0.05:
                return '*'
            elif pvalue < 0.1:
                return '.'
            return ''

        # Initialize the comparison dict
        comparison_dict = {
            'Metric': [],
            'Model 1': [],
            'Model 2': []
        }

        result1 = self._results
        result2 = modelwrapper._results

        # General metrics
        metrics = [
            ('R-squared', result1.rsquared, result2.rsquared),
            ('Adjusted R-squared', result1.rsquared_adj, result2.rsquared_adj),
            ('F-statistic', result1.fvalue, result2.fvalue),
            ('Prob (F-statistic)', result1.f_pvalue, result2.f_pvalue),
            ('Log-Likelihood', result1.llf, result2.llf),
            ('AIC', result1.aic, result2.aic),
            ('BIC', result1.bic, result2.bic)
        ]

        for metric, value1, value2 in metrics:
            comparison_dict['Metric'].append(metric)
            comparison_dict['Model 1'].append(
                f"{value1:.4f}" if isinstance(value1, float) else value1)
            comparison_dict['Model 2'].append(
                f"{value2:.4f}" if isinstance(value2, float) else value2)

        # Coefficient comparisons
        all_params = set(result1.params.index) | set(result2.params.index)
        for param in all_params:
            comparison_dict['Metric'].append(f'Coefficient ({param})')
            # Model 1 coefficients, p-values, and significance
            if param in result1.params:
                stars = significance_stars(result1.pvalues[param])
                comparison_dict['Model 1'].append(
                    f"{result1.params[param]:.4f}{stars}")
            else:
                comparison_dict['Model 1'].append('')

            # Model 2 coefficients, p-values, and significance
            if param in result2.params:
                stars = significance_stars(result2.pvalues[param])
                comparison_dict['Model 2'].append(
                    f"{result2.params[param]:.4f}{stars}")
            else:
                comparison_dict['Model 2'].append('')

        # Creating a DataFrame for comparison
        comparison_df = pd.DataFrame(comparison_dict)

        # Styling the DataFrame to resemble a social science regression table
        styled_df = (comparison_df.style
                     .format({('Model 1', 'Model 2'): "{:.4f}"})
                     .applymap(lambda v: 'font-weight: bold;' if '***' in v else None)
                     .set_table_styles([
                         {'selector': 'th', 'props': [
                            ('font-size', '12pt'), ('text-align', 'center'), ('border-style', 'solid'), ('border-width', '1px')]},
                         {'selector': 'td', 'props': [
                             ('text-align', 'right'), ('border-style', 'solid'), ('border-width', '1px')]}
                     ])
                     .hide(axis='index')
                     .set_caption("Model Comparison")
                     .set_properties(subset=['Metric'], **{'text-align': 'left', 'font-weight': 'bold'})
                     .set_properties(subset=['Model 1', 'Model 2'], **{'text-align': 'right'}))

        # Displaying the styled comparison table
        display(HTML(styled_df.to_html()))

    def fit(self, X: pd.DataFrame, Y: pd.Series | pd.DataFrame = None, **kwargs):
        if Y is None:
            outputs = self._model(X, Y, **kwargs)

            self.num_exog = X.shape[1]

            if len(outputs) == 2:
                (self.fittedModel, self._results) = outputs
                
                if hasattr(self._results, "rsquared"):
                    self.stats = {
                        "r_squared": self._results.rsquared,
                        "adj_r_squared": self._results.rsquared_adj,
                        "f_statistic": self._results.fvalue,
                        "f_pvalue": self._results.f_pvalue,
                        "log_likelihood": self._results.llf,
                        "aic": self._results.aic,
                        "bic": self._results.bic,
                    }

            else:
                (self._results,) = outputs                          
            return self, self._results
        else:
            if isinstance(Y, pd.Series) or isinstance(Y, pd.DataFrame):
                outputs = self._model(X, Y, **kwargs)

                if len(outputs) == 2:
                    (self.fittedModel, self._results) = outputs
                    
                    if hasattr(self._results, "rsquared"):                   
                        self.stats = {
                            "r_squared": self._results.rsquared,
                            "adj_r_squared": self._results.rsquared_adj,
                            "f_statistic": self._results.fvalue,
                            "f_pvalue": self._results.f_pvalue,
                            "log_likelihood": self._results.llf,
                            "aic": self._results.aic,
                            "bic": self._results.bic,
                        }
                else:
                    (self._results,) = outputs
                    group_stats1 = (X.mean().get(key=0), X.std().get(key=0), X.shape[0])
                    group_stats2 = (Y.mean().get(key=0), Y.std().get(key=0), Y.shape[0])
                    self._results.setStat("group_stats1", group_stats1)
                    self._results.setStat("group_stats2", group_stats2)
                return self, self._results
            else:
                raise TypeError("Y should be a pandas Series or DataFrame")
