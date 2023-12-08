<script lang="ts">
    import _ from 'lodash';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import {
        getBoxplotStats,
        getDensityPlotStats
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
    export let height: number = undefined;

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
                }
            });
        }
    }

    $: updateChart(step?.config?.viz);

</script>

<div>
    {#if !_.isUndefined(step?.config?.assumptionResults)}
        <div class="card" style="height:{height - 30}px">
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
        <div class="place-content-center flex">
            <div
                class="w-1/2 flex flex-col p-2 overflow-hidden bg-white border-2"
            >
                <span>Select the assumption you would like to check:</span>
                <div class="grow" />
                <select bind:value={assumptionName}>
                    {#each $builtinAssumptions as assumption}
                        <option value={assumption}>{assumption}</option>
                    {/each}
                </select>
            </div>
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
</style>
