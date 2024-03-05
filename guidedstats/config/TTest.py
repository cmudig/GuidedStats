_ttestConfig = [
    {"id": 0,
     "stepType": "LoadDatasetStep",
     "stepExplanation":  "Load the dataset that will be used for t-test. \
       This is the first step in the workflow and is essential for \
         initializing the dataset for subsequent steps.",
     "stepConfig":
     {
         "stepName": "Load Dataset",
     }
     },
    {"id": 1,
     "stepType": "VariableSelectionStep",
     "stepExplanation": "Identify the independent variable for the t-test.\
         This variable is the focus of the analysis and the basis for comparison between groups.",
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
      "stepExplanation": "Examine the data for outliers that could potentially skew the results.\
          Outliers are extreme values that deviate from other observations in the dataset.\
              They may make the mean unsuitable as a summary measure.",
     "stepConfig":
     {"stepName": "Check Outliers",
      "inputNames": ["Y1"],
      "outputNames": ["Y1"],
      "assumptionName": "outlier",
      "isRelaxed": True,
      "succeedPreviousStepOutput": False,
      }
     },
    {"id": 3,
     "stepType": "VariableSelectionStep",
     "stepExplanation": "Select the group variable which categorizes data into groups for comparison. This step is about defining the groups that will be compared in the t-test.",
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
     "stepExplanation": "Assess the homogeneity of variances between the two groups using Levene's test. Equal variances across samples is called homogeneity of variance. Levene's test is used to test if samples have equal variances.",
     "stepConfig":
     {"stepName": "Check Homogeneity of Variance",
      "inputNames": ["Y1", "Y2"],
      "outputNames": ["Y1", "Y2"],
      "assumptionName": "levene",
      "isRelaxed": True,
      "succeedPreviousStepOutput": False,
      }
     },
    {
        "id": 5,
        "stepType": "AssumptionCheckingStep",
        "stepExplanation": "Two independent samples t-Test requires the two groups have normal distributions. \
            In practice, the method is robust to violations of the normal population assumption. \
                This is especially true when both n1 and n2 are at least about 30, by the Central Limit Theorem.\
                    The Shapiro-Wilk test tests whether a random sample comes from a normal distribution.",
        "stepConfig":
        {"stepName": "Check Normality of the First Group",
         "inputNames": ["Y1"],
         "outputNames": ["Y1"],
         "assumptionName": "normality",
         "isRelaxed": True,
         "succeedPreviousStepOutput": False,
         }
    },
    {
        "id": 6,
        "stepType": "AssumptionCheckingStep",
        "stepExplanation": "Two independent samples t-Test requires the two groups have normal distributions. \
            In practice, the method is robust to violations of the normal population assumption. \
                This is especially true when both n1 and n2 are at least about 30, by the Central Limit Theorem.\
                    The Shapiro-Wilk test tests whether a random sample comes from a normal distribution.",
        "stepConfig":
        {"stepName": "Check Normality of the Second Group",
         "inputNames": ["Y2"],
         "outputNames": ["Y2"],
         "assumptionName": "normality",
         "isRelaxed": True,
         "succeedPreviousStepOutput": False,
         }
    },
    {"id": 7,
     "stepType": "ModelStep",
     "stepExplanation": "Formulate the null and alternative hypotheses for the t-test and define the Type I Error (alpha).\
         This step is crucial as it frames the statistical test and sets the significance level at which the null hypothesis will be tested against the alternative.",
     "stepConfig":
     {"stepName": "State Hypothesis and Alpha Level",
      "inputNames": ["Y1", "Y2"],
      "modelCandidates": [{"name": "T Test",
                           "parameters": [{"name": "alpha", "displayName": "Alpha Level"},
                                          {"name": "alternative", "displayName": "Alternative Hypothesis", "options": [
                                              {"name": "two-sided"}, {"name": "smaller"}, {"name": "larger"}]},
                                          {"name": "equal_var", "displayName": "Equal Variance", "options": [
                                              {"name": "True"}, {"name": "False"}]}
                                          ]
                           }],
      }},
    {"id": 8,
     "stepType": "EvaluationStep",
     "stepExplanation": "Conduct the t-test to evaluate the statistical significance of the difference between the two groups.\
         This step will compare the observed test statistic to the critical value determined by the Alpha Level rate, leading to a decision on the null hypothesis.",
     "stepConfig":
     {"stepName": "Evaluate the model",
      "inputNames": ["model", "results", "Y1", "Y2"],
      "visType": "ttest",
      }},
]
