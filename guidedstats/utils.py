import pandas as pd

QUANTITATIVE_DTYPES = ['float32', 'float64', 'int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64']


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
    values = [int(value) for value in values]
    values.sort()
    return values