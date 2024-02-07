_regressionConfig = [
    {"id": 0,
     "stepType": "LoadDatasetStep",  # for workflow
     "stepConfig":  # for step itself
     {
         "stepName": "Load Dataset",
     }
     },
    {"id": 1,
     "stepType": "VariableSelectionStep",
     "stepConfig":  # This is for the initialization of Steps
     {"stepName": "Select Dependent Variable",
      "outputNames": ["Y"],
      "variableType": "dependent variable",
      "variableNum": 1,
      "candidateNum": 4,
      "compare":  False,
      }},
    {"id": 2,
     "stepType": "AssumptionCheckingStep",
     "stepConfig":
     {"stepName": "Check Outliers",
      "inputNames": ["Y"],
      "outputNames": ["Y"],
      "assumptionName": "outlier",
      "isRelaxed": True,
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 3,
     "stepType": "VariableSelectionStep",
     "stepConfig":
     {"stepName": "Select Independent Variables",
      "outputNames": ["X"],
      "variableType": "independent variables",
      # TBC, should be able to select different number of variables
      "variableNum": 999999,
      "candidateNum": 15,
      "compare": True,
      "metricName": "pearson",
      }},
    {"id": 4,
     "stepType": "AssumptionCheckingStep",
     "stepConfig":
     {"stepName": "Check Outliers",
      "assumptionName": "outlier",
      "isRelaxed": True,
      "inputNames": ["X"],
      "outputNames": ["X"],
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 5,
     "stepType": "AssumptionCheckingStep",
     "stepConfig":
     {"stepName": "Check Multicollinearity",
      "assumptionName": "multicollinearity",
      "isRelaxed": True,
      "inputNames": ["X", "exog"],
      "outputNames": ["X"],
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 6,
     "stepType": "TrainTestSplitStep",
     "stepConfig":
     {"stepName": "Do train test split",
      "inputNames": ["X", "Y"],
      }
     },
    {"id": 7,
     "stepType": "ModelStep",
     "stepConfig":
     {"stepName": "Train model",
      "inputNames": ["XTrain", "yTrain"],
      "modelCandidates": [{"name": "Simple Linear Regression"},
                          {"name": "Ridge Regression",
                              "parameters": [{"name": "alpha"}]},
                          {"name": "Lasso Regression", "parameters": [{"name": "alpha"}]}],
      }},
    {"id": 8,
     "stepType": "EvaluationStep",
     "stepConfig":
     {"stepName": "Evaluate the model",
      "inputNames": ["model", "results", "XTest", "yTest", "XTrain", "yTrain"],
      "visType": "residual",
      "evaluationMetricNames": ["mse"],
      }},
]
