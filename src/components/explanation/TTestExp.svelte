<script lang="ts">
    import Katex from 'svelte-katex';
</script>

<ul class="list-disc list-inside">
    <li>
        <strong>Null Hypothesis</strong>
        <Katex>H_0</Katex>: postulates that the parameter takes a specific
        value, typically representing no effect or no difference. edge of the
        box.
    </li>
    <li>
        <strong>Alternative Hypothesis</strong>
        <Katex>H_a</Katex>: states that the parameter falls in some alternative
        range of values. of the box.
    </li>
</ul>
<br />
<p>
    To test for a difference between two population means, <Katex>\mu_1</Katex> and
    <Katex>\mu_2</Katex>, we can perform a statistical test with the null
    hypothesis:
</p>
<Katex displayMode>{'H_0: \\mu_1 = \\mu_2'}</Katex>
<p>
    This translates to testing whether the difference between the means is zero:
</p>
<Katex displayMode>{'H_0: \\mu_2 - \\mu_1 = 0'}</Katex>
<p>implying no effect. The alternative hypothesis may be set up as:</p>
<ul class="list-disc list-inside">
    <li>
        Two-sided, indicating the possibility of a difference in either
        direction.
    </li>
    <li>One-sided, suggesting a difference in a specific direction.</li>
</ul>
<p>The test statistic is calculated as:</p>
<Katex displayMode
    >{'t = \\frac{\\text{Estimate of parameter} - \\text{Null hypothesis value of parameter}}{\\text{Standard error of estimate}}'}</Katex
>

<p>
    When treating <Katex>\mu_2 - \mu_1</Katex> as the parameter of interest, we estimate
    it using the sample means, <Katex>{`\\bar{y}_2 - \\bar{y}_1`}</Katex>:
</p>
<Katex displayMode>{'t = \\frac{(\\bar{y}_2 - \\bar{y}_1) - 0}{se}'}</Katex>
<p>where</p>
<Katex displayMode
    >{'se = \\sqrt{\\frac{s^2_1}{n_1} + \\frac{s^2_2}{n_2}}'}</Katex
>
