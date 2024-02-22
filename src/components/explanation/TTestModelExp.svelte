<script lang="ts">
    import Katex from 'svelte-katex';
</script>

<ul class="list-disc list-inside">
    <li>
        <strong>Two-tailed(sided) Alternative Hypothesis</strong>
        <Katex>\mu_1 = \mu_2</Katex>: indicates the possibility of a difference
        in either direction.
    </li>
    <li>
        <strong>One-tailed Alternative Hypothesis</strong>
        <Katex>{`\\mu_1 > \\mu_2`}</Katex> or <Katex>{`\\mu_1 < \\mu_2`}</Katex
        >: suggests a difference in a specific direction.
    </li>
    <li>
        <strong>Alpha Level</strong>: When H0 is true, a Type 1 Error occurs if H0 is rejected.
    </li>
</ul>
