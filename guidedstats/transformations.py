import numpy as np

def log_transform(data,columns,**kwargs):
    data = np.log(data[columns] + 1)
    outputName = kwargs.get("outputName",None)
    return {outputName: data}

TRANSFORMATIONS = {
    "log": 
        {
            "displayName": "Logarithmic Transform",
            "func": log_transform,
            "requireVarCat": False,
            "requireGroupVariable": False,
        }
}

class TransformationWrapper:
    def __init__(self):
        self.name = None
        self.displayName = None
        self.requireVarCat = False
        self.transformation = None

    def setTransformation(self, transformationName):
        if transformationName in TRANSFORMATIONS.keys():            
            item = TRANSFORMATIONS[transformationName]
            self.name = transformationName
            self.displayName = item["displayName"]
            self.requireVarCat = item["requireVarCat"]
            self.requireGroupVariable = item["requireGroupVariable"]
            self.transformation = item["func"]
        else:
            raise ValueError("Transformation {} not found".format(transformationName))
    
    def transform(self,data,columns,**kwargs):
        if self.transformation is not None:
            data = self.transformation(data,columns,**kwargs)
            return data
        else:
            raise ValueError("Transformation not set")