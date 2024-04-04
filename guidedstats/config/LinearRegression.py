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
     "stepExplanation": "Check for outliers in the independent variables. \
        One of the least squares assumptions is that large outliers are unlikely. \
       Outliers can significantly affect the regression model.\
      Even if it seems like extreme observations have been recorded correctly, it is advisable to exclude \
    them or perform data transformation on them before estimating.\
       Here, we use interquartile range(IQR), the range between 25th and 75th percentiles of the data, to detect outliers.\
                    Any value that is less than 25th percentile - 1.5 * IQR or greater than 75th perecentile + 1.5 * IQR is considered an outlier.\
      ",
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
    "suggestions": ["Select variables that are theoretically relevant to the dependent variable.",\
      "Select variables with high correlation with the dependent variable.",\
      "Create interaction terms(eg. x1*x2) between variables. This suggests that the effect of one variable depends on the value of another variable.",\
        "Consider transforming variables, for example using log transformation, to improve the model's fit."],
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
        One of the least squares assumptions is that large outliers are unlikely. \
       Outliers can significantly affect the regression model.\
      Even if it seems like extreme observations have been recorded correctly, it is advisable to exclude \
    them or perform data transformation on them before estimating.\
       Here, we use interquartile range(IQR), the range between 25th and 75th percentiles of the data, to detect outliers.\
                    Any value that is less than 25th percentile - 1.5 * IQR or greater than 75th perecentile + 1.5 * IQR is considered an outlier.\
    ",
     "stepConfig":
     {"stepName": "Check Outliers",
      "assumptionName": "outlier",
      "isRelaxed": True,
      "inputNames": ["X", "exog", "Y"],
      "outputNames": ["X", "exog", "Y"],
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 5,
     "stepType": "AssumptionCheckingStep",
     "stepExplanation": "Check for multicollinearity among independent variables.",
     "stepConfig":
     {"stepName": "Check Multicollinearity",
      "assumptionName": "multicollinearity",
      "isRelaxed": True,
      "inputNames": ["X", "exog"],
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
     "stepExplanation": "Use independent and dependent variables to train the model and predict the outcome.",
     "stepConfig":
     {"stepName": "Train model",
      "inputNames": ["XTrain", "yTrain"],
      "modelCandidates": [{"name": "Simple Linear Regression", "isDefault": True},
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
      "evaluationMetricNames": ["mse", "r2", "adjusted_r2"],
      }},
]
