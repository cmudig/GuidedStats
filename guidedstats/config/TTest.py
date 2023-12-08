_ttestConfig = [
    {"id": 0,
     "stepType": "LoadDatasetStep",
     "stepConfig":
     {
         "stepName": "Load Dataset",
     }
     },
    {"id": 1,
     "stepType": "VariableSelectionStep",
     "stepConfig":  # This is for the initialization of Steps
     {"stepName": "Select Independent Variable",
      "outputNames": ["Y1"],
      "variableType": "variable",
      "variableNum": 1,
      "candidateNum": 4,
      "compare":  False,
      }},
    {"id": 2,
     "stepType": "AssumptionCheckingStep",
     "stepConfig":
     {"stepName": "Check Outliers",
      "inputNames": ["Y1"],
      "assumptionName": "outlier",
      "isRelaxed": True,
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 3,
     "stepType": "VariableSelectionStep",
     "stepConfig":
     {"stepName": "Select Group Variable",
      "outputNames": ["Y1", "Y2"],
      "variableType": "group variable",
      "requireVarCategory": True,
      "variableNum": 1,
      "candidateNum": 4,
      "compare":  False,
      }},
    {"id": 4,
     "stepType": "AssumptionCheckingStep",
     "stepConfig":
     {"stepName": "Check Homogeneity of Variance",
      "inputNames": ["Y1", "Y2"],
      "assumptionName": "levene",
      "isRelaxed": True,
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 5,
     "stepType": "ModelStep",
     "stepConfig":
     {"stepName": "State Hypothesis and Type I Error",
      "inputNames": ["Y1", "Y2"],
      "modelCandidates": [{"name": "T Test",
                           "parameters": [{"name": "alpha", "displayName": "Type I Error Rate"},
                                          {"name": "alternative", "displayName": "Alternative Hypothesis", "options": [{"name": "two-sided"}, {"name": "smaller"}, {"name": "larger"}]}]
                           }],
      }},
    {"id": 6,
     "stepType": "EvaluationStep",
     "stepConfig":
     {"stepName": "Evaluate the model",
      "inputNames": ["model","results","Y1", "Y2"],
      "visType": "ttest",
      }},
]
