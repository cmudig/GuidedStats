import pandas as pd

QUANTITATIVE_DTYPES = ['float64', 'int64']
CATEGORICAL_DTYPES = ['object','category']


def checkPRange(p):
    if p < 0.001:
        sign = "< 0.001"
    elif p < 0.01:
        sign = "< 0.01"
    elif p < 0.05:
        sign = "< 0.05"
    else:
        sign = "> 0.05"
    return sign

def getUniqueValues(data: pd.DataFrame, col: str):
    values = list(data[col].unique())
    values = [value for value in values]
    values.sort()
    return values