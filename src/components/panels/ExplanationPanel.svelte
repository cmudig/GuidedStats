<script lang="ts">
    import _ from 'lodash';
    import type { Step } from '../../interface/interfaces';
    import { selectingStep } from '../../stores';
    import Explanation from '../explanation/Explanation.svelte';
    import MulticolExp from '../explanation/MulticolExp.svelte';

    export let steps: Array<Step> = undefined;
</script>

<div
    class="grow flex flex-col bg-white w-full mt-2 border-2 rounded-lg overflow-y-scroll"
    style="scrollbar-width: none"
>
<div class="grow-0 flex p-2">
    <span class="font-bold">Explanation</span>
    <div class="grow" />
</div>
    {#if !_.isUndefined(steps) && $selectingStep >= 0}
            {#if steps[$selectingStep].stepName == "Check Multicollinearity"}
                <Explanation>
                    <div slot="step">{steps[$selectingStep].stepExplanation}</div>
                    <MulticolExp slot="concept" />
                </Explanation>
            {:else}
                <Explanation>
                    <div slot="step">{steps[$selectingStep].stepExplanation}</div>
                </Explanation>
            {/if}
    {/if}
</div>
