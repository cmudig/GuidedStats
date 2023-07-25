"""
Utility functions for calculating metadata from pandas dataframes
These are called from PythonExecutor.ts in the frontend
"""

import pandas as pd
from pandas.api.types import is_string_dtype, is_numeric_dtype, is_bool_dtype, is_categorical_dtype, is_datetime64_dtype
from .utils import convertDescribe

####### type checks #######
def isNumeric(colData: pd.Series):
    return is_numeric_dtype(colData)

def isTimestamp(colData: pd.Series):
    return is_datetime64_dtype(colData)

def isCategorical(colData: pd.Series):
    return is_categorical_dtype(colData) or is_string_dtype(colData)

def isBoolean(colData: pd.Series):
    return is_bool_dtype(colData)

######## Analysis functions #######
def getColumns(dfName: pd.DataFrame):
    typeDF = dfName.dtypes.reset_index().rename(columns={"index": "colName", 0: "type"})
    typeDF["isIndex"] = False
    if dfName.index.name:
        name = dfName.index.name
    else:
        name = ""
    indexDF = pd.DataFrame({"colName": [name], "type": [dfName.index.dtype]})
    indexDF["isIndex"] = True
    typeDF = pd.concat([indexDF, typeDF])
    return typeDF

def getShape(dfName: pd.DataFrame):
    return dfName.shape

def getColMeta(dfName: pd.DataFrame, colName: str, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    num_unique = colData.nunique()
    num_null = colData.isna().sum()

    return num_unique, num_null

def getValueCounts(dfName: pd.DataFrame, colName: str, n=10, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    vc = colData.value_counts().iloc[:n]
    return vc

def getQuantBinnedData(dfName: pd.DataFrame, colName: str, n=20, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    vc = colData.value_counts(bins=min(n, colData.nunique()), sort=False)
    return vc

def getTempBinnedData(dfName: pd.DataFrame, colName: str, n=200, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    vc = (colData.astype("int64")//1e9).value_counts(bins=min(n, colData.nunique()), sort=False)
    true_min = (colData.astype("int64")//1e9).min()
    return vc, true_min

def getTempInterval(dfName: pd.DataFrame, colName: str, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    timerange = colData.max() - colData.min()
    return {"months": 0, "days": timerange.days, "micros": 0}

def getStringMeta(dfName: pd.DataFrame, colName: str, isIndex=False):
    if isIndex:
        lengths = dfName.index.to_series().str.len()
    else:
        lengths = dfName[colName].str.len()

    return {
        "minLength": lengths.min(),
        "maxLength": lengths.max(),
        "meanLength": lengths.mean(),
    }

def getQuantMeta(dfName: pd.DataFrame, colName: str, isIndex=False):
    if isIndex:
        colData = dfName.index.to_series()
    else:
        colData = dfName[colName]
    
    describe = colData.describe()
    sd = describe.loc['std']
    mean = describe.loc['mean']
    q3 = describe.loc['75%']
    q1 = describe.loc['25%']

    # get num outliers > 3 std away from mean
    normalized = (colData - mean) / sd
    sd_num_outliers = sum( abs(normalized) > 3)

    # get iqr outliers that are 1.5 * iqr away from q1 or q3
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    iqr_num_outliers = sum((colData < lower) | (colData > upper))

    # get sortedness
    if colData.is_monotonic_increasing:
        sortedness = "ascending"
    elif colData.is_monotonic_decreasing:
        sortedness = "descending"
    else:
        sortedness = "noSort"
    
    n_zero = sum(colData == 0)
    n_negative = sum(colData < 0)
    n_positive = sum(colData > 0)

    # make serializable

    statistics = convertDescribe(describe)
    statistics["sd_outlier"] = sd_num_outliers
    statistics["iqr_outlier"] = iqr_num_outliers
    statistics["sortedness"] = sortedness
    statistics["n_zero"] = n_zero
    statistics["n_positive"] = n_positive
    statistics["n_negative"] = n_negative

    return statistics

def getTemporalMeta(dfName:pd.DataFrame, colName:str, isIndex=False):
    if isIndex:
        colData = dfName.index
    else:
        colData = dfName[colName]

    if colData.is_monotonic_increasing:
        result = "ascending"
    elif colData.is_monotonic_decreasing:
        result = "descending"
    else:
        result = "noSort"
    return {"sortedness": result}
