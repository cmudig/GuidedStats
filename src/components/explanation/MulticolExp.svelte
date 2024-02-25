<h7 class="text-blue-700">Multicollinearity</h7>
<p>
    Multicollinearity refers to the situation in multiple regression models
    where two or more independent variables are highly correlated, making it
    difficult to isolate the individual effect of each predictor on the
    dependent variable.
</p>
<ul class="list-disc list-inside">
    <li>
        <strong>Perfect Multicollinearity</strong>: This occurs when the
        correlation between two or more independent variables is exactly 1 or
        -1. It prevents the model from being estimated because it's impossible
        to distinguish the separate influence of perfectly correlated variables.
    </li>
    <li>
        <strong>Imperfect Multicollinearity</strong>: Describes a situation
        where the correlation between independent variables is strong. It makes
        the estimation of regression coefficients less precise and can lead to
        inflated standard errors.
    </li>
    <li>
        <strong>Impact on Coefficient Estimates</strong>: When independent
        variables are highly correlated, it can inflate the variance of the
        coefficient estimates, leading to less precise estimations.
    </li>
</ul>
<br />
<p class="italic">
    When facing multicollinearity, researchers must decide whether to include
    all relevant variables (accepting higher variance) or simplify the model
    (potentially introducing bias).
</p>
<h7 class="text-blue-700">Variance Inflation Factor (VIF)</h7>
<p>
    The Variance Inflation Factor (VIF) quantifies the extent of
    multicollinearity in an ordinary least squares regression analysis. It
    measures how much the variance of an estimated regression coefficient
    increases if your predictors are correlated.
</p>
<ul class="list-disc list-inside">
    <li>
        <strong>Calculation of VIF</strong>: For a given independent variable,
        VIF is calculated as
        <code class="bg-gray-200 text-sm p-1 rounded"
            >VIF = 1 / (1 - R<sub>j</sub><sup>2</sup>)</code
        >, where
        <code class="bg-gray-200 text-sm p-1 rounded"
            >R<sub>j</sub><sup>2</sup></code
        >
        is the coefficient of determination from regressing the <em>jth</em> variable
        against all other predictors.
    </li>
    <li>
        <strong>Interpreting VIF</strong>: VIFs exceeding 10 indicate that
        multicollinearity may be problematic.
    </li>
</ul>
