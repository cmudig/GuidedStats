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


def exportReport(results: Results):
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

    # Check if all necessary attributes are not None
    reportAvailable = all([v is not None for v in [df_resid, df_model, fvalue, f_pvalue, r_squared, columns, params, conf_int, pvalues, se]])
    if not reportAvailable:
        raise ValueError(
            "The fitted model does not have all the necessary attributes for reports")

    # APA report string
    apa_report = f"The regression analysis revealed that the model explained {r_squared:.2f} of the variance (F({df_model:.0f}, {df_resid:.0f}) = {fvalue:.3f}, p = {f_pvalue:.3f}). "

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
        elif p < 0.01:
            p_text = f"p = {p:.2f}"
        elif p < 0.05:
            p_text = f"p < .05"
        else:
            p_text = f"p = {p:.2f}"
        apa_report += f"The coefficient for {column} was significant (B = {B:.3f}, SE = {SE:.3f}, 95% CI [{CI_lower:.3f}, {CI_upper:.3f}], {p_text}). "

    return apa_report


def exportTTestReport(results: Results):
    # Extract t-test results
    t_statistic = results.getStat("tstat")
    p_value = results.getStat("pvalue")
    df = results.getStat("df")
    (mean1, std1, n1) = results.getStat("group_stats1")
    (mean2, std2, n2) = results.getStat("group_stats2")

    # APA format report
    if p_value < 0.001:
        p_text = "p < .001"
    elif p_value < 0.01:
        p_text = f"p = {p_value:.2f}"
    elif p_value < 0.05:
        p_text = "p < .05"
    else:
        p_text = f"p = {p_value:.2f}"

    apa_report = (f"A two independent sample t-test was conducted to compare the difference of means between . The results indicated that the difference between the groups "
                  f"was statistically significant (t({df}) = {t_statistic:.3f}, {p_text}). The mean (SD) for group 1 is {mean1:.2f} ({std1:.2f}) and for group 2 is {mean2:.2f} ({std2:.2f}).")

    return apa_report
