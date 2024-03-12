import numpy as np
import pandas as pd

def log_transform(data: pd.DataFrame,columns,**kwargs):
    for col in columns:
        if data[col].min() <= 0:
            return (None,"There's non-positive value in the column. Logarithmic transformation is not applicable to non-positive values.")
        data[col] = np.log(data[col])
    return (data,None)

#winsorization
def winsorize(data: pd.DataFrame, columns, **kwargs):
    for col in columns:
        lower = data[col].quantile(0.05)
        upper = data[col].quantile(0.95)
        data = data[(data[col] >= lower) & (data[col] <= upper)]
    return (data, None)

def deleteOutliers(data: pd.DataFrame, columns, **kwargs):
    for col in columns:   
        X = data[col]
        Q1 = np.percentile(X, 25)
        Q3 = np.percentile(X, 75)
        IQR = Q3 - Q1

        lower_threshold = Q1 - 1.5 * IQR
        upper_threshold = Q3 + 1.5 * IQR

        data = data[(data[col] >= lower_threshold) & (data[col] <= upper_threshold)]
        return (data, None)

TRANSFORMATIONS = {
    "Logarithmic Transform": 
        {
            "func": log_transform,
            "requireVarCat": False,
            "requireGroupVariable": False,
        },
    "Clip Extreme Values":
        {
            "func": winsorize,
            "requireVarCat": False,
            "requireGroupVariable": False,
        },
    "Delete Outliers":
        {
            "func": deleteOutliers,
            "requireVarCat": False,
            "requireGroupVariable": False,
        }   
}

class TransformationWrapper:
    def __init__(self):
        self.name = None
        self.requireVarCat = False
        self.transformation = None

    def setTransformation(self, transformationName):
        if transformationName in TRANSFORMATIONS.keys():            
            item = TRANSFORMATIONS[transformationName]
            self.name = transformationName
            self.requireVarCat = item["requireVarCat"]
            self.requireGroupVariable = item["requireGroupVariable"]
            self.transformation = item["func"]
        else:
            raise ValueError("Transformation {} not found".format(transformationName))
    
    def transform(self,data,columns,**kwargs):
        if self.transformation is not None:
            (data,message) = self.transformation(data,columns,**kwargs)
            return (data,message)
        else:
            raise ValueError("Transformation not set")