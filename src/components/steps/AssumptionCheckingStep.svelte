<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import { getBoxplotStats } from '../viz/action/visualization';
    import { deepCopy } from '../../utils';
    import type {Step, Visualization, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import ExportIcon from '../icons/ExportIcon.svelte';
    import { exportingItem } from '../../stores';
    import Done from '../icons/Done.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let assumptionName: string = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

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
        embed('#vis', spec, { actions: false });
    };
    };

    $: updateChart(step?.config?.viz);

    function exportViz() {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
    };

</script>

<div>
  {#if !_.isUndefined(step?.config?.assumptionResults)}
    {#each step.config.assumptionResults as assumptionResult}
        <div>
            <span class="font-bold" style="color:#008AFE">{assumptionResult.name}</span> : {assumptionResult.prompt}
        </div>
    {/each}
    <div class="flex">
        <!-- Visualization -->
        <div class="grow" />
        <div id="vis" />
        <div>
            <Tooltip title="Export Visualization">
                <button on:click={exportViz}><ExportIcon /></button>
            </Tooltip>
            <div class="grow"></div>
        </div>
        <div class="grow" />
    </div>
    <div class="flex">
        <div class="grow" />
        <Tooltip title="Done">
            <button on:click={stopInspectingAssumption}><Done /></button>
        </Tooltip>
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
