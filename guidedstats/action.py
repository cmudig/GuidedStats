TEMPLATES = {
    "remove_outliers":
    """df = {workflowVariableName}.export("dataset")
df = df[(df["{col}"] > {lower_threshold}) & (df["{col}"] < {upper_threshold})]
{workflowVariableName}._import("dataset", df)""",

    "transform_outliers":
    """# There are numerous ways to transform outliers. Here, we use log transformation as an example.
import numpy as np
df = {workflowVariableName}.export("dataset")
#check if the column has non-positive values
if {workflowVariableName}.export("dataset")["{col}"].min() <= 0:
    raise ValueError("The column contains non-positive values, log transformation cannot be applied.")

df["{col}"] = np.log(df["{col}"])
{workflowVariableName}._import("dataset", df)""",

    "investigate_outliers":
    """import matplotlib.pyplot as plt

df = {workflowVariableName}.export("dataset")

# Calculate descriptive statistics
statistics = df["{col}"].describe()
print(statistics)

# Create a histogram
plt.hist(df["{col}"], bins=20, color='skyblue', edgecolor='black')
plt.xlabel("Values")
plt.ylabel("Frequency")
plt.title("Histogram")
plt.show()""",

    "perform_VIF":
"""# Here we drop highly correlated variables and compute VIF again
import pandas as pd
df = {workflowVariableName}.export("dataset")

X = df[{columns}]

# Compute correlation matrix
corr_matrix = df.corr()

highest_correlation = 0
highly_correlated_vars = ()
# Find variables with highest correlation among all combination
highly_correlated_vars = set()
for i in range(corr_matrix.shape[0]):
    for j in range(i+1, corr_matrix.shape[1]):
        f abs(corr_matrix.iloc[i, j]) > highest_correlation:
            highly_correlated_vars = (df.columns[i], df.columns[j])
            highest_correlation = abs(corr_matrix.iloc[i, j])

# Drop highly correlated variables
X = X.drop(highly_correlated_vars, axis=1)

# Compute VIF again
from statsmodels.stats.outliers_influence import variance_inflation_factor
VIFs = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
for i in range(len(VIFs)):
    print(f"VIF for {X.columns[i]}: {VIFs[i]}")
""",

    "use_mann_whitney":
"""from scipy.stats import mannwhitneyu
groups = {groups}
group1 = df[df["{separator}"] == groups[0]]["{col}"]
group2 = df[df["{separator}"] == groups[1]]["{col}"]
stat, p = mannwhitneyu(group1, group2)
print('Statistics=%.3f, p=%.3f' % (stat, p))
# If the p-value is less than 0.05, we reject the null hypothesis that the two groups have the same means. Otherwise, we fail to reject the null hypothesis.
""",

    "print_group_size":
"""The sample sizes of each group are {N1} and {N2}. For the t-test to be robust to violations of normality, the sample size should be large enough and at least 30."""
}

ACTIONS = {
    "remove_outliers": {
        "type": "code",
        "template": TEMPLATES["remove_outliers"],
    },
    "transform_outliers": {
        "type": "code",
        "template": TEMPLATES["transform_outliers"],
    },
    "investigate_outliers": {
        "type": "code",
        "template": TEMPLATES["investigate_outliers"],
    },
    "perform_VIF": {
        "type": "code",
        "template": TEMPLATES["perform_VIF"],
    },
    "set_equal_variance": {
        "type": "UI",
        "search_key": "equal_var",
    },
    "use_mann_whitney":{
        "type": "code",
        "template": TEMPLATES["use_mann_whitney"],
    },
    "print_group_size": {
        "type": "message",
        "template": TEMPLATES["print_group_size"],
    }
}

