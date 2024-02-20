<script lang="ts">
    import _ from 'lodash';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { afterUpdate, getContext } from 'svelte';
    import Done from '../icons/Done.svelte';
    import HintIcon from '../icons/HintIcon.svelte';
    import Explanation from '../explanation/Explanation.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let percentage: number = 80;
    let active = false;

    // update percentage value before adjusting the slider
    afterUpdate(() => {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.trainSize = percentage / 100;
        workflowInfo.set(info);
    });

    function updateSizeResult(event) {
        let info = deepCopy($workflowInfo);
        percentage = +event.target.value;
        info.steps[stepIndex].config.trainSize = percentage / 100;
        workflowInfo.set(info);
    }

    function execute() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
        workflowInfo.set(info);
    }
</script>

<div class="flex flex-col">
    <div
        class="overflow-y-scroll place-content-center flex"
        style="scrollbar-width: none"
    >
        <div class="w-3/4 p-4 overflow-hidden bg-white border-2">
            <div class="flex slider-container">
                <span>Train Percentage: {percentage} %</span>
                <div class="grow" />
                <div class="w-1/2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        on:input={updateSizeResult}
                    />
                </div>
            </div>
        </div>
    </div>
    {#if active}
    <Explanation>
        <div slot="step">
            <span>{step?.stepExplanation}</span>
        </div>
    </Explanation>
{/if}
    <div class="grow" />
    <div class="flex">
        <Tooltip title="Hint">
            <button
                on:click={() => {
                    active = !active;
                }}><HintIcon /></button>
        </Tooltip>
        <div class="grow" />
        <Tooltip title="Execute">
            <button on:click={execute}><Done /></button>
        </Tooltip>
    </div>
</div>
