from typing import Iterable
import pandas as pd
import numpy as np
import random


def outlierVizStats(X:pd.Series,max_outlier=10,*args):
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

def residVizStats(Y_hat:Iterable,Y_true:Iterable,max_point=150,*args):
    resid = Y_hat - Y_true
    vizStats = []
    for i in range(len(Y_hat)):
        vizStats.append({"x": Y_hat[i], "y": resid[i] })
    sample = random.sample(vizStats, min(max_point,len(vizStats)))   
    return sample

def densityVizStats(Y1:Iterable,Y2:Iterable,max_point=100,*args):
    stats = []
    Y1 = np.array(Y1).reshape(-1).tolist()
    Y2 = np.array(Y2).reshape(-1).tolist()
    #randomly sample min(max_point,len(X)) points
    sample_num = min(max_point,len(Y1))
    sample_index = np.random.choice(len(Y1),sample_num,replace=False)
    for i in sample_index:
        stats.append({"group":"group 1","value":Y1[i]})
    sample_num = min(max_point,len(Y2))
    sample_index = np.random.choice(len(Y2),sample_num,replace=False)
    for i in sample_index:
        stats.append({"group":"group 2","value":Y2[i]})
    del Y1,Y2
    return stats

def tTestVizStats(X:Iterable,indicator:Iterable,max_point=150,*args):
    stats = densityVizStats(X,indicator,max_point,*args)
    return stats    

VIZ = {
    "residual": residVizStats,
    "ttest": tTestVizStats
}
