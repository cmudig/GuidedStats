from stargazer.stargazer import Stargazer
import altair as alt
import textwrap


def exportTable(fittedModels:list):
    stargazer = Stargazer(fittedModels)
    html_str = stargazer.render_html()
    return html_str

def exportBoxplot(vizStats):
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

def exportScatterplot(vizStats):
    code = textwrap.dedent(f'''import altair as alt
data = pd.DataFrame({vizStats})
chart = alt.Chart(data).mark_point().encode(
    x=alt.X('x', axis=alt.Axis(labels=False)),
    y='y'
)
chart''')
    return code

def exportReport(fittedModel):
    # Extract model results
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