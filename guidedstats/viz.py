from typing import Iterable
import pandas as pd
import numpy as np
import random


def boxplotVizStats(X: pd.Series, *args, **kwargs):
    if isinstance(X, pd.DataFrame):
        X = X.iloc[:, 0]
    max_outlier = kwargs.get("max_outlier", 10)

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
    stats = []
    Xs = list(args)
    for i, X in enumerate(Xs):
        if isinstance(X, pd.DataFrame):
            X = X.iloc[:, 0]
        X.name = "group" + str(i+1)
        stats.append(boxplotVizStats(X, **kwargs))
    return stats


def residVizStats(Y_hat: Iterable, Y_true: Iterable, **kwargs):
    max_point = kwargs.get("max_point", 100)
    group = kwargs.get("group","group")
    resid = Y_hat - Y_true
    vizStats = []
    for i in range(len(Y_hat)):
        vizStats.append({"x": Y_hat[i], "y": resid[i], "group": group})
    sample = random.sample(vizStats, min(max_point, len(vizStats)))
    return sample


def densityVizStats(Y1: Iterable, Y2: Iterable, **kwargs):
    max_point = kwargs.get("max_point", 100)
    group_label = kwargs.get("group_label", ["group1", "group2"])

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


def multicollinearityVizStats(X: Iterable, df: pd.DataFrame, **kwargs):
    max_point = kwargs.get("max_point", 150)

    # generate a heatmap of correlation matrix
    matrix = df.corr(numeric_only=True)
    stats = []
    for i, var1 in enumerate(matrix.index):
        for j in range(len(matrix.columns)):
            stats.append(
                {"variable1": var1, "variable2": matrix.columns[j], "value": matrix.iloc[i, j]})
    return stats


def normalityVizStats(X: Iterable, **kwargs):
    max_point = kwargs.get("max_point", 150)
    # generate normally distributed data with mean = mean(X) and std = std(X)
    mean = np.mean(X)
    std = np.std(X)
    Y = np.random.normal(mean, std, len(X))
    stats = densityVizStats(X, Y, max_point=max_point, group_label=[
                            "current data column", "normally distributed data"])
    return stats


def tTestVizStats(Y1: Iterable, Y2: Iterable, **kwargs):
    max_point = kwargs.get("max_point", 150)
    stats = densityVizStats(Y1, Y2, max_point=max_point, **kwargs)
    return stats


VIZ = {
    "residual": residVizStats,
    "ttest": tTestVizStats
}
