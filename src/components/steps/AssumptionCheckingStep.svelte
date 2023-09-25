<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import { getBoxplotStats } from '../viz/action/visualization';
    import { deepCopy } from '../../utils';
    import type {Step, Visualization, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let assumptionName: string = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function stopInspectingAssumption() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].done = true;
        workflowInfo.set(info);
    }

    function updateAssumption(){
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].config.assumptionName = assumptionName;
        workflowInfo.set(info);
    }
    function updateChart(viz: Visualization) {
        if (!_.isUndefined(viz)) {
        const spec = getBoxplotStats(viz);
        embed('#vis', spec);
    };
    };

    $: updateChart(step?.config?.viz);

</script>

<div>
  {#if !_.isUndefined(step?.config?.assumptionResults)}
    {#each step.config.assumptionResults as assumptionResult}
        <div>
            <span class="font-bold" style="color:#008AFE">{assumptionResult.name}</span> : {assumptionResult.prompt}
        </div>
    {/each}
    <div class="place-content-center flex">
        <!-- Visualization -->
        <div id="vis">
        </div>
        <!-- toolbar -->
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2" on:click={stopInspectingAssumption}>
                <span class="font-bold">Yes</span>
            </button>
            <div class="grow" />
            <button class="border-2">
                <span class="font-bold">No</span>
            </button>
        </div>
    </div>
    {:else}
    <!-- This part is for self defining-->
    <div class="place-content-center flex">
        <div
            class="w-1/2 flex flex-col p-2 overflow-hidden bg-white border-2"
        >
            Select the assumption you would like to check:
            <select bind:value={assumptionName}>
                <option value="outlier">Outlier</option>
            </select>
            <div class="grow" />
        </div>
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2">
                <span class="font-bold">Skip</span>
            </button>
            <div class="grow" />
            <button class="border-2" on:click={updateAssumption}>
                <span class="font-bold">Done</span>
            </button>
        </div>
    </div>
  {/if}
</div>
