from stargazer.stargazer import Stargazer
import altair as alt
import textwrap
from .model import ModelWrapper, Results


def exportTable(fittedModels: list, format="html"):
    stargazer = Stargazer(fittedModels)
    if format == "html":
        table = stargazer.render_html()
    elif format == "latex":
        table = stargazer.render_latex()
    return table


def exportBoxplot(viz):
    vizStats = viz["vizStats"]
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
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
points = base.transform_flatten(['outliers']).mark_point().encode(
    x=alt.X('outliers:Q', axis=alt.Axis(title=None))
)
chart = alt.layer(rule, bar, median_tick, points)
chart''')
    return code


def exportScatterplot(viz):
    vizStats = viz["vizStats"]
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
chart = alt.Chart(data).mark_point().encode(
    x=alt.X('x', axis=alt.Axis(labels=False)),
    y='y'
)
chart''')
    return code


def exportDensityPlot(viz):
    vizStats = viz["vizStats"]
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
chart = alt.Chart(data).transform_density(
    'value',
    groupby=['group'],
    extent=[minimum, maximum],
    as_=['value', 'density']
).mark_area(
    opacity=0.3,
    interpolate='step'
).encode(
    alt.X('value:Q'),
    alt.Y('density:Q', stack='zero'),
    alt.Color('group:N')
)
chart''')


def exportTTestPlot(viz):
    vizStats = viz["vizStats"]
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
chart = alt.Chart(data).mark_boxplot().encode(
    x=alt.X('group:N'),
    y='value'
)
chart''')
    return code


def exportHeatMapPlot(viz):
    vizStats = viz["vizStats"]
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
chart = alt.Chart(data).mark_rect().encode(
    x=alt.X('variable1:N'),
    y='variable2',
    color='value'
)
chart''')
    return code


def exportReport(fittedModel):
    # Extract model results

    # make sure fittedModel has all these attributes
    reportAvailable = hasattr(fittedModel, 'df_resid') and hasattr(fittedModel, 'df_model') and hasattr(fittedModel, 'fvalue') and hasattr(fittedModel, 'f_pvalue') and hasattr(
        fittedModel, 'rsquared') and hasattr(fittedModel, 'params') and hasattr(fittedModel, 'conf_int') and hasattr(fittedModel, 'pvalues') and hasattr(fittedModel, 'bse')

    if not reportAvailable:
        raise ValueError(
            "The fitted model does not have all the necessary attributes for reports")
    else:
        df_resid = fittedModel.df_resid
        df_model = fittedModel.df_model
        fvalue = fittedModel.fvalue
        f_pvalue = fittedModel.f_pvalue
        r_squared = fittedModel.rsquared
        params = fittedModel.params
        conf_int = fittedModel.conf_int()
        pvalues = fittedModel.pvalues
        se = fittedModel.bse

        # APA report string
        apa_report = f"The regression analysis revealed that the model explained {r_squared:.2f} of the variance (F({df_model:.0f}, {df_resid:.0f}) = {fvalue:.3f}, p = {f_pvalue:.3f}). "

        # Adding parameter estimates
        for i, param in enumerate(params.index):
            if 'Intercept' in param:  # Typically not reported in APA
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
            apa_report += f"The coefficient for {param} was significant (B = {B:.3f}, SE = {SE:.3f}, 95% CI [{CI_lower:.3f}, {CI_upper:.3f}], {p_text}). "

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

    apa_report = (f"A two independent sample t-test was conducted to compare the groups. The results indicated that the difference between the groups "
                 f"was statistically significant (t({df}) = {t_statistic:.3f}, {p_text}). The mean (SD) for group 1 was {mean1:.2f} ({std1:.2f}) and for group 2 was {mean2:.2f} ({std2:.2f}).")

    return apa_report

