<script lang="ts">
    import _ from 'lodash';
    import type { Step, Workflow } from '../../interface/interfaces';
    import { selectingStep, activeTabValue } from '../../stores';
    import Explanations from '../explanation/Explanations.svelte';
    import MulticolExp from '../explanation/MulticolExp.svelte';
    import ExportCode from '../explanation/ExportCode.svelte';
    import Explanation from '../explanation/Explanation.svelte';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');
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
        {#if steps[$selectingStep].stepName == 'Check Multicollinearity'}
            <Explanations>
                <Explanation
                    slot="step"
                    title="What is this step for"
                    content={steps[$selectingStep].stepExplanation}
                    active={true}
                />
                <MulticolExp
                    slot="concept"
                    assumptionResult={steps[$selectingStep].config
                        ?.assumptionResults[$activeTabValue]}
                />
                <Explanation
                    slot="report"
                    title="Interpretation of the Model"
                    content_html={$workflowInfo?.report}
                />
                <Explanation
                    slot="suggestions"
                    title="What can you do for this step?"
                    items={steps[$selectingStep].suggestions}
                />
                <ExportCode slot="export" />
            </Explanations>
        {:else if steps[$selectingStep].stepName == 'Evaluate the model'}
            <Explanations>
                <Explanation
                    slot="step"
                    title="What is this step for"
                    content={steps[$selectingStep].stepExplanation}
                    active={true}
                />
                <Explanation
                    slot="report"
                    title="Interpretation of the Model"
                    content_html={$workflowInfo?.report}
                />
                <Explanation
                    slot="suggestions"
                    title="What can you do for this step?"
                    items={steps[$selectingStep].suggestions}
                />
                <ExportCode slot="export" />
            </Explanations>
        {:else}
            <Explanations>
                <Explanation
                    slot="step"
                    title="What is this step for"
                    content={steps[$selectingStep].stepExplanation}
                    active={true}
                />
                <Explanation
                    slot="report"
                    title="Interpretation of the Model"
                    content_html={$workflowInfo?.report}
                />
                <Explanation
                    slot="suggestions"
                    title="What can you do for this step"
                    items={steps[$selectingStep].suggestions}
                />
                <ExportCode slot="export" />
            </Explanations>
        {/if}
    {/if}
</div>
