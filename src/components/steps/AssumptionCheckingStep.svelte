<script lang="ts">
    import _ from 'lodash';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import {
        getBoxplotStats,
        getDensityPlotStats,
        getHeatMapStats
    } from '../viz/action/visualization';
    import { deepCopy } from '../../utils';
    import type {
        Step,
        Visualization,
        Workflow
    } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import Done from '../icons/Done.svelte';
    import Tabs from '../display/Tabs.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    export let specs: Array<any> = undefined;

    let assumptionName: string = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const builtinAssumptions: Writable<Array<string>> =
        getContext('builtinAssumptions');

    function stopInspectingAssumption() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].done = true;
        workflowInfo.set(info);
    }

    function updateAssumption() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].config.assumptionName = assumptionName;
        workflowInfo.set(info);
    }

    function updateChart(vizs: Visualization[]) {
        if (!_.isUndefined(vizs)) {
            specs = undefined;
            specs = vizs.map(viz => {
                if (viz.vizType == 'density') {
                    return getDensityPlotStats(viz);
                } else if (viz.vizType == 'boxplot') {
                    return getBoxplotStats(viz);
                } else if (viz.vizType == 'heatmap') {
                    return getHeatMapStats(viz);
                }
            });
        }
    }

    $: updateChart(step?.config?.viz);
</script>

<div>
    {#if !_.isUndefined(step?.config?.assumptionResults)}
        <div class="card">
            <div class="flex">
                <div class="grow" />
                <!-- Visualization and Prompt -->
                <Tabs
                    num={step?.config?.viz?.length}
                    {stepIndex}
                    assumptionResults={step.config.assumptionResults}
                    {specs}
                />
                <!-- <div>
                    <Tooltip title="Export Visualization">
                        <button on:click={exportViz}><ExportIcon /></button>
                    </Tooltip>
                    <div class="grow" />
                </div> -->
                <div class="grow" />
            </div>
        </div>
        <div class="flex">
            <div class="grow" />
            <Tooltip title="Done">
                <button on:click={stopInspectingAssumption}><Done /></button>
            </Tooltip>
        </div>
    {:else}
        <!-- This part is for self defining-->
        <div class="flex flex-col h-full">
            <div class="card place-content-center flex">
                <div
                    class="w-3/4 flex flex-col p-2 overflow-hidden bg-white border-2"
                >
                    <div class="flex">
                        <span class="p-2"
                            >Select the assumption you would like to check:
                        </span>
                        <div class="grow" />
                        <select bind:value={assumptionName}>
                            <option disabled selected value>
                                -- option --
                            </option>
                            {#each $builtinAssumptions as assumption}
                                <option value={assumption}>{assumption}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="grow" />
                </div>
            </div>
            <div class="grow" />
            <div class="flex">
                <div class="grow" />
                <Tooltip title="Done">
                    <button on:click={updateAssumption}><Done /></button>
                </Tooltip>
            </div>
        </div>
    {/if}
</div>

<style>
    .card {
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .card::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
    .card span {
        color: #333; /* Consistent text color */
        padding: 10px;
    }
    .card select {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 10px;
        background-color: white;
    }
    .card select:focus {
        border-color: #007bff;
        outline: none;
    }
</style>
