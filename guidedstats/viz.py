import pandas as pd
import random


def boxplotVizStats(X: pd.Series, *args, **kwargs):
    import numpy as np
    if isinstance(X, pd.DataFrame):
        X = X.iloc[:, 0]
    max_outlier = kwargs.get("max_outlier", 50)
    previousX = kwargs.get("previousX", None)
    if previousX is not None:
        q1 = np.quantile(previousX, 0.25)
        median = np.median(previousX)
        q3 = np.quantile(previousX, 0.75)
        iqr = q3 - q1
    else:
        q1 = np.quantile(X, 0.25)
        median = np.median(X)
        q3 = np.quantile(X, 0.75)
        iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    upper_outliers = sorted([float(x)
                            for x in X if float(x) > upper_bound], reverse=True)
    lower_outliers = sorted(
        [float(x) for x in X if float(x) < lower_bound], reverse=False)

    outliers = []
    for i in range(min(len(upper_outliers), max_outlier)):
        outliers.append(upper_outliers[i])
    for i in range(min(len(lower_outliers), max_outlier)):
        outliers.append(lower_outliers[i])

    stats = {
        "name": X.name,
        "lower": lower_bound,
        "q1": q1,
        "median": median,
        "q3": q3,
        "upper": upper_bound,
        "outliers": outliers
    }

    return stats


def multiBoxplotVizStats(*args, **kwargs):
    groups = kwargs.get("groups", None)
    stats = []
    Xs = list(args)
    for i, X in enumerate(Xs):
        if isinstance(X, pd.DataFrame):
            X = X.iloc[:, 0]
        if isinstance(X, pd.Series):
            X.name = groups[i] if groups is not None and isinstance(
                groups, list) else "group" + str(i+1)
            stats.append(boxplotVizStats(X, **kwargs))
    return stats


def residVizStats(Y_hat, Y_true, **kwargs):
    max_point = kwargs.get("max_point", 100)
    group = kwargs.get("group", "group")
    resid = Y_hat - Y_true
    vizStats = []
    for i in range(len(Y_hat)):
        vizStats.append({"x": Y_hat[i], "y": resid[i], "group": group})
    sample = random.sample(vizStats, min(max_point, len(vizStats)))
    return sample


def heapmapVizStats(X, df: pd.DataFrame, **kwargs):
    max_point = kwargs.get("max_point", 150)

    # generate a heatmap of correlation matrix
    matrix = df.corr(numeric_only=True)
    stats = []
    for i, var1 in enumerate(matrix.index):
        for j in range(len(matrix.columns)):
            stats.append(
                {"variable1": var1, "variable2": matrix.columns[j], "value": matrix.iloc[i, j]})
    return stats


def densityVizStats(X, **kwargs):
    import numpy as np
    max_point = kwargs.get("max_point", 150)

    stats = []
    X = np.array(X).reshape(-1).tolist()
    # randomly sample min(max_point,len(X)) points
    sample_num = min(max_point, len(X))
    sample_index = np.random.choice(len(X), sample_num, replace=False)
    for i in sample_index:
        stats.append({"value": X[i]})
    del X
    return stats


def tTestVizStats(Y1, Y2, **kwargs):
    import numpy as np
    max_point = kwargs.get("max_point", 150)
    group_label = kwargs.get("groups", ["group1", "group2"])

    stats = []
    Y1 = np.array(Y1).reshape(-1).tolist()
    Y2 = np.array(Y2).reshape(-1).tolist()
    # randomly sample min(max_point,len(X)) points
    sample_num = min(max_point, len(Y1))
    sample_index = np.random.choice(len(Y1), sample_num, replace=False)
    for i in sample_index:
        stats.append({"group": group_label[0], "value": Y1[i]})
    sample_num = min(max_point, len(Y2))
    sample_index = np.random.choice(len(Y2), sample_num, replace=False)
    for i in sample_index:
        stats.append({"group": group_label[1], "value": Y2[i]})
    del Y1, Y2
    return stats


def linearVizStats(X, Y, **kwargs):
    import numpy as np
    X = np.array(X).reshape(-1).tolist()
    Y = np.array(Y).reshape(-1).tolist()
    assert len(X) == len(Y)
    max_point = kwargs.get("max_point", 150)
    sample_num = min(max_point, len(X))
    sample_index = np.random.choice(len(X), sample_num, replace=False)
    stats = []
    for i in sample_index:
        stats.append({"x": X[i], "y": Y[i]})
    del X, Y
    return stats

VIZ = {
    "boxplot": boxplotVizStats,
    "multiBoxplot": multiBoxplotVizStats,
    "density": densityVizStats,
    "heatmap": heapmapVizStats,
    "residual": residVizStats,
    "ttest": tTestVizStats,
    "regression": linearVizStats
}
