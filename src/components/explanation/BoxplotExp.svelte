<script lang="ts">
    import Katex from 'svelte-katex';
</script>

<h7 class="text-blue-700">Box Plot Interpretation</h7>
<p>This box plot provides a visual summary of the variable(s)</p>
<ul class="list-disc list-inside">
    <li>
        <strong>First Quartile (Q1)</strong>: Also known as the lower quartile,
        it is the value below which 25% of the data falls. It marks the lower
        edge of the box.
    </li>
    <li>
        <strong>Third Quartile (Q3)</strong>: Known as the upper quartile, it is
        the value below which 75% of the data falls. It defines the upper edge
        of the box.
    </li>
    <li>
        <strong>Interquartile Range (IQR)</strong>: The distance between Q1 and
        Q3, representing the middle 50% of the data.
    </li>
    <li>
        <strong>Median</strong>: The horizontal line inside the box shows the
        median value.
    </li>
    <li>
        <strong>Whiskers</strong>: Extend to 1.5 * IQR from the quartiles,
        showing the range of typical data points.
    </li>
    <li>
        <strong>Outliers</strong>: Represented by dots, indicating values beyond
        the whiskers.
    </li>
</ul>
<br />
<p class="italic">
    One of the least squares assumptions is that large outliers are unlikely: <Katex
        >X_i</Katex
    > and <Katex>Y_i</Katex> have nonzero finite fourth moments. Even if it seems
    like extreme observations have been recorded correctly, it is advisable to exclude
    them before estimating a model since OLS suffers from sensitivity to outliers.
</p>
