from stargazer.stargazer import Stargazer
import altair as alt
import textwrap
from .model import Results


def exportTable(fittedModels: list, format="html"):
    stargazer = Stargazer(fittedModels)
    if format == "html":
        table = stargazer.render_html()
    elif format == "latex":
        table = stargazer.render_latex()
    return table


def exportBoxplot(vizStats):
    import pandas as pd
    
    data = pd.DataFrame([vizStats])
    data = data.explode('outliers')

    base = alt.Chart(data).encode(
        y=alt.Y('name:N', title=None)
    )
    rule = base.mark_rule().encode(
        x=alt.X('lower:Q', axis=alt.Axis(title=None)),
        x2='upper:Q'
    )
    bar = base.mark_bar(size=14).encode(
        x=alt.X('q1:Q', axis=alt.Axis(title=None)),
        x2='q3:Q',
        color=alt.Color('name:N', legend=None)
    )
    median_tick = base.mark_tick(color='white', size=14).encode(
        x=alt.X('median:Q', axis=alt.Axis(title=None)),
    )
    points = base.mark_point(size=100).encode(
    x='outliers:Q',
    color=alt.Color('name:N', legend=None),
    tooltip=['outliers:Q']).interactive()
    chart = alt.layer(rule, bar, median_tick, points)
    return chart


def exportScatterplot(vizStats):
    data = vizStats
    chart = alt.Chart(data).mark_point().encode(
        x=alt.X('x', axis=alt.Axis(labels=False)),
        y='y'
    )
    return chart


def exportDensityPlot(vizStats):
    data = vizStats
    chart = alt.Chart(data).transform_density(
        'value',
        groupby=['group'],
        as_=['value', 'density']
    ).mark_area(
        opacity=0.3,
        interpolate='step'
    ).encode(
        alt.X('value:Q'),
        alt.Y('density:Q', stack='zero'),
        alt.Color('group:N')
    )
    return chart


def exportTTestPlot(vizStats):
    data = vizStats
    chart = alt.Chart(data).mark_boxplot().encode(
        x=alt.X('group:N'),
        y='value'
    )
    return chart

def exportHeatMapPlot(vizStats):
    data = vizStats
    chart = alt.Chart(data).mark_rect().encode(
        x=alt.X('variable1:N'),
        y='variable2',
        color='value'
    )
    return chart

vizTypeToSpec = {
    "boxplot": exportBoxplot,
    "multiBoxplot": exportBoxplot,
    "scatter": exportScatterplot,
    "density": exportDensityPlot,
    "tTest": exportTTestPlot,
    "heatmap": exportHeatMapPlot
}


def exportRegressionReport(results: Results, style="text"):
    # Extract model results

    df_resid = results.getStat("df_resid")
    df_model = results.getStat("df_model")
    fvalue = results.getStat("fvalue")
    f_pvalue = results.getStat("f_pvalue")
    r_squared = results.getStat("rsquared")
    columns = results.getStat("params").index
    params = results.getStat("params")
    conf_int = results.getStat("conf_int")
    pvalues = results.getStat("pvalues")
    se = results.getStat("bse")
    r_squared_percentage = r_squared * 100
    # Check if all necessary attributes are not None
    reportAvailable = all([v is not None for v in [df_resid, df_model, fvalue, f_pvalue, r_squared, columns, params, conf_int, pvalues, se]])
    if not reportAvailable:
        raise ValueError(
            "The fitted model does not have all the necessary attributes for reports")
    if style == "text":
        # APA report string
        apa_report = ""
        
        apa_report += f"""The regression analysis revealed that the model with independent variables {", ".join(columns)} explained {r_squared_percentage:.0}% of the variance in the dependent variable (R² = {r_squared:.2f})."""
        # Adding parameter estimates
        for i, column in enumerate(columns):
            if 'Intercept' in column:  # Typically not reported in APA
                continue
            B = params[i]
            CI_lower, CI_upper = conf_int.iloc[i]
            p = pvalues[i]
            SE = se[i]
            if p < 0.001:
                p_text = "p < .001"
                significance = f"This provides very strong evidence against the null hypothesis (which states that there is no effect for {column} on the dependent variable) and supports the alternative hypothesis (which states that there is an effect)."
            elif p < 0.05:
                p_text = f"p = {p:.3f}"
                significance = f"This provides evidence against the null hypothesis (which states that there is no effect for {column} on the dependent variable) and supports the alternative hypothesis."
            else:
                p_text = f"p = {p:.3f}"
                significance = f"This does not provide enough evidence to reject the null hypothesis (which states that there is no effect for {column} on the dependent variable), so we cannot conclude that there is an effect."

            apa_report += f"The coefficient for {column} indicates that, holding other variables constant, a one-unit increase in {column} is associated with a {B:.3f}-unit change in the dependent variable (B = {B:.3f}, {p_text}). {significance}\n"

        return apa_report
    
    if style == "html":
        apa_report = ""
        apa_report += f'<h7 class="text-blue-700">Regression Analysis</h7><p>The regression analysis revealed that the model with independent variables <span class="text-blue-700">{", ".join(columns)}</span> explained {r_squared_percentage:.0f}% of the variance in the dependent variable (R² = {r_squared:.2f}).</p>'
        apa_report += '<h7 class="text-blue-700">Individual Coefficients</h7>\n'

        for i, column in enumerate(columns):
            if 'const' in column:
                continue
            B = params[i]
            CI_lower, CI_upper = conf_int.iloc[i]
            p = pvalues[i]
            SE = se[i]
            if p < 0.001:
                p_text = "< .001"
                significance = f"""The p-value for the coefficient of {column} {p_text}, which provides very strong evidence against the null hypothesis that there is no effect for <span class="text-blue-700">{column}</span> on the dependent variable."""
            elif p < 0.05:
                p_text = f"< {p:.3f}"
                significance = f"""The p-value for the coefficient of {column} {p_text}, which provides evidence against the null hypothesis that there is no effect for <span class="text-blue-700">{column}</span> on the dependent variable."""
            else:
                p_text = f"= {p:.3f}"
                significance = f"""The p-value for the coefficient of {column} {p_text}, which does not provide enough evidence to reject the null hypothesis that there is no effect for <span class="text-blue-700">{column}</span> on the dependent variable."""

            apa_report += f'<p class="text-blue-700">{column}</p>The coefficient for <span class="text-blue-700">{column}</span> indicates that, holding other variables constant, a one-unit increase in {column} is associated with a {B:.3f}-unit change in the dependent variable (B = {B:.3f}, {p_text}). {significance}</p>'
        return apa_report
        
    
    return apa_report


def exportTTestReport(results: Results, style="text", groups = None):
    # Extract t-test results
    t_statistic = results.getStat("params")[0]
    p_value = results.getStat("pvalues")[0]
    df = results.getStat("df")
    (mean1, std1, n1) = results.getStat("group_stats1")
    (mean2, std2, n2) = results.getStat("group_stats2")
    variable_name = results.getStat("variable_name")
    variable = "the variable" if variable_name is None else variable_name
    

    # APA format report
    if p_value < 0.001:
        p_text = "p < .001"
    elif p_value < 0.01:
        p_text = f"p = {p_value:.2f}"
    elif p_value < 0.05:
        p_text = "p < .05"
    else:
        p_text = f"p = {p_value:.2f}"
        
    group = str(groups[0]) + " and " + str(groups[1]) if groups is not None and len(groups) > 1 else "the two groups"
        
    if style == "text":
        apa_report = (f"A two independent sample t-test was conducted to compare the difference of means between {group} of {variable}. The results indicated that the difference between the groups "
                      f"was statistically significant (t({df}) = {t_statistic:.3f}, {p_text}). The mean (SD) for group 1 is {mean1:.2f} ({std1:.2f}) and for group 2 is {mean2:.2f} ({std2:.2f}).")
        return apa_report
    elif style == "html":
        apa_report = (f'<h7 class="text-blue-700">Two Independent Sample T-Test</h7><p>A two independent sample t-test was conducted to compare the difference of means between {group} of {variable}. The results indicated that the difference between the groups was statistically significant (t({df}) = {t_statistic:.3f}, {p_text}). The mean (SD) for group 1 is {mean1:.2f} ({std1:.2f}) and for group 2 is {mean2:.2f} ({std2:.2f}).</p>')
        return apa_report