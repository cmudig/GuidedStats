import numpy as np

def log_transform(data,columns,**kwargs):
    data = np.log(data[columns] + 1)
    outputName = kwargs.get("outputName",None)
    return {outputName: data}

def group_split(data,columns,**kwargs):
    groupVariable = kwargs.get("groupVariable",None)
    group = kwargs.get("group",None)
    outputName = kwargs.get("outputName",None)
    if groupVariable is not None and group is not None:
        outputs = {}
        import re
        pattern = re.compile(r"([A-Z]+)([0-9]+)")
        match = pattern.match(outputName)
        letter = match.group(1)
        number = int(match.group(2))
        
        for grp in group:
            outputs["{}{}".format(str(letter),str(number))] = data[data[groupVariable] == grp][columns] 
            number += 1
        return outputs
    else:
        raise ValueError("group_split requires groupVariable and group")

TRANSFORMATIONS = {
    "log": 
        {
            "displayName": "Logarithmic Transform",
            "func": log_transform,
            "requireVarCat": False,
            "requireGroupVariable": False,
        },
    "group_split":
        {
            "displayName": "Split by Group and Select",
            "func": group_split,
            "requireVarCat": True,
            "requireGroupVariable": True,
        },  
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