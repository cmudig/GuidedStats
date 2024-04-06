<script lang="ts">
    import _ from 'lodash';
    import type { AssumptionResult } from '../../interface/interfaces';
    import CollapseIcon from '../icons/CollapseIcon.svelte';
    import ExpandIcon from '../icons/ExpandIcon.svelte';

    export let assumptionResult: AssumptionResult;
    let active = false;
</script>

<button
    class="w-full my-2 hover:border-gray-300 text-white font-bold rounded"
    on:click={() => {
        active = !active;
    }}
>
    <div class="flex">
        <h7 class="text-blue-700">Statistical Concepts</h7>
        <div class="grow" />
        {#if active}
            <CollapseIcon width="1.2em" height="1.2em" />
        {:else}
            <ExpandIcon width="1.2em" height="1.3em" />
        {/if}
    </div>
</button>
{#if active}
    <h7 class="text-blue-700">Multicollinearity</h7>
    <p>
        Multicollinearity occurs when two or more independent variables are
        highly correlated. It can inflate the variance of the coefficient
        estimates, leading to less precise estimations.
    </p>
    <h7 class="text-blue-700">Variance Inflation Factor (VIF)</h7>
    <p>
        The Variance Inflation Factor (VIF) measures how much the variance of
        the estimated regression coefficient increases if your predictors are
        correlated. It is a common way to detect multicollinearity.
    </p>
    {#if !_.isUndefined(assumptionResult)}
        <h7 class="text-blue-700">Interpreting VIF</h7>
        <p>
            {#if assumptionResult?.stats > 10}
                The VIF of <span class="font-bold" style="color:#008AFE"
                    >{assumptionResult?.name}</span
                > exceeds 10. It is a sign of serious multicollinearity. It may inflate
                the variance of its coefficient estimate. You may want to consider
                changing the predictors in your model.
            {:else if assumptionResult?.stats > 4}
                A VIF of <span class="font-bold" style="color:#008AFE"
                    >{assumptionResult?.name}</span
                > above 4 raises concerns, but it may not be a big issue.
            {:else if _.isNaN(assumptionResult?.stats)}
                For the model with only one predictor {assumptionResult?.name},
                VIF is not a issue of concern.
            {:else}
                A VIF of <span class="font-bold" style="color:#008AFE"
                    >{assumptionResult?.name}</span
                > lower than 4. The multicollinearity is not a big issue.
            {/if}
        </p>
    {/if}
{/if}
