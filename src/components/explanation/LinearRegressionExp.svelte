<script lang="ts">
    import Katex from 'svelte-katex';
    let equation =
        'Y_i = \\beta_0 + \\beta_1 X_{1i} + \\beta_2 X_{2i} + \\beta_3 X_{3i} + \\cdots + \\beta_k X_{ki} + u_i';
</script>

<p>The linear regression model is:</p>
<Katex displayMode>{equation}</Katex>
<p>where:</p>
<ul class="list-disc list-inside">
    <li>
        The index <Katex>i</Katex> runs over the observations, <Katex
            >i = 1, \cdots, n</Katex
        >;
    </li>
    <li>
        <Katex>Y_i</Katex> is the dependent variable, the regressand, or simply the
        left-hand variable;
    </li>
    <li>
        <Katex>{`X_{1i}, X_{2i}, X_{3i}, \\cdots, X_{ki}`}</Katex> are the independent
        variables, the regressors, or simply the right-hand variables;
    </li>
    <li>
        <Katex>\beta_0, \beta_1, \beta_2, \beta_3, \ldots, \beta_k</Katex> are the
        coefficients of the regression line;
    </li>
    <li><Katex>u_i</Katex> is the error term.</li>
</ul>
