_regressionConfig = [
    {"id": 0,
     "stepType": "LoadDatasetStep",  # for workflow
     "stepExplanation": "Load the dataset that will be used for the regression analysis. \
       This is the first step in the workflow and is essential for \
         initializing the dataset for subsequent steps.",
     "stepConfig":  # for step itself
     {
         "stepName": "Load Dataset",
     }
     },
    {"id": 1,
     "stepType": "VariableSelectionStep",
     "stepExplanation": "Select the dependent variable (also known as the target variable) from the dataset. \
       This variable is what the model will try to predict based on the independent variables.",
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
     "stepExplanation": "Check for outliers in the dependent variable. \
       Outliers can significantly affect the regression model, and this step helps to identify and handle them appropriately.\
    One of the least squares assumptions is that large outliers are unlikely. \
      Even if it seems like extreme observations have been recorded correctly, it is advisable to exclude \
    them before estimating a model since OLS suffers from sensitivity to outliers.",
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
     "stepExplanation": "Select the independent variables (also known as the predictors or features) \
       that will be used to predict the dependent variable. \
         This step involves choosing the relevant variables based on certain criteria.",
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
     "stepExplanation": "Check for outliers in the independent variables. \
       Outliers can significantly affect the regression model, and this step helps to identify and handle them appropriately.\
      One of the least squares assumptions is that large outliers are unlikely. \
      Even if it seems like extreme observations have been recorded correctly, it is advisable to exclude \
    them before estimating a model since OLS suffers from sensitivity to outliers.",
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
     "stepExplanation": "Check for multicollinearity among the independent variables. \
       Multicollinearity occurs when two or more independent variables are highly correlated, \
         which can affect the stability and interpretation of the regression model.",
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
     "stepExplanation": "Split the dataset into training and testing sets. \
       The training set is used to train the regression model, \
         while the testing set is used to evaluate its generalizability performance.",
     "stepConfig":
     {"stepName": "Do train test split",
      "inputNames": ["X", "Y"],
      }
     },
    {"id": 7,
     "stepType": "ModelStep",
     "stepExplanation": "Train the regression model using the selected independent variables and the dependent variable.",
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
     "stepExplanation": "Evaluate the performance of the trained regression model using the testing set. \
       This step involves calculating evaluation metrics like Mean Squared Error (MSE) and R-squared (R2) to assess the model's accuracy and goodness of fit.",
     "stepConfig":
     {"stepName": "Evaluate the model",
      "inputNames": ["model", "results", "XTest", "yTest", "XTrain", "yTrain"],
      "visType": "residual",
      "evaluationMetricNames": ["mse", "r2"],
      }},
]
