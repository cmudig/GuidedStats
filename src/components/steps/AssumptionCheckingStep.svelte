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
    import HintIcon from '../icons/HintIcon.svelte';
    import Explanation from '../explanation/Explanation.svelte';
    import BoxplotExp from '../explanation/BoxplotExp.svelte';
    import HeatmapExp from '../explanation/HeatmapExp.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    export let specs: Array<any> = undefined;

    let assumptionName: string = undefined;
    let active: boolean = false;
    let vizType: string = '';

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const builtinAssumptions: Writable<Array<string>> =
        getContext('builtinAssumptions');

    function execute() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
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
                    vizType = 'boxplot';
                    return getBoxplotStats(viz);
                } else if (viz.vizType == 'heatmap') {
                    vizType = 'heatmap';
                    return getHeatMapStats(viz);
                }
            });
        }
    }

    $: updateChart(step?.config?.viz);
</script>

<div>
    {#if !_.isUndefined(step?.config?.assumptionResults)}
        <div class="overflow-y-scroll" style="scrollbar-width: none">
            <div class="flex">
                <div class="grow" />
                <!-- Visualization and Prompt -->
                <Tabs
                    num={step?.config?.viz?.length}
                    {stepIndex}
                    assumptionResults={step.config.assumptionResults}
                    {specs}
                />
                <div class="grow" />
            </div>
        </div>
        {#if active}
            {#if vizType == 'boxplot'}
                <Explanation>
                    <div slot="step">
                        <span>{step?.stepExplanation}</span>
                    </div>
                    <BoxplotExp slot="concept" /></Explanation
                >
            {/if}
            {#if vizType == 'heatmap'}
                <Explanation>
                    <div slot="step">
                        <span>{step?.stepExplanation}</span>
                    </div>
                    <HeatmapExp slot="concept" /></Explanation
                >
            {/if}
        {/if}
        <div class="flex">
            <Tooltip title="Hint">
                <button
                    on:click={() => {
                        active = !active;
                    }}><HintIcon /></button
                >
            </Tooltip>
            <div class="grow" />
            <Tooltip title="Execute">
                <button on:click={execute}><Done /></button>
            </Tooltip>
        </div>
    {:else}
        <!-- This part is for self defining-->
        <div class="flex flex-col h-full">
            <div
                class="overflow-y-scroll place-content-center flex"
                style="scrollbar-width: none"
            >
                <div
                    class="w-3/4 flex flex-col p-2 overflow-hidden bg-white border-2"
                >
                    <div class="flex">
                        <span class="p-3"
                            >Select the assumption you would like to check:
                        </span>
                        <div class="grow" />
                        <select
                            class="rounded py-2 px-4 bg-white border-solid border border-gray-300 focus:border-blue-500"
                            bind:value={assumptionName}
                        >
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
                <Tooltip title="Hint">
                    <button
                        on:click={() => {
                            active = !active;
                        }}><HintIcon /></button
                    >
                </Tooltip>
                <div class="grow" />
                <Tooltip title="Done">
                    <button on:click={updateAssumption}><Done /></button>
                </Tooltip>
            </div>
        </div>
    {/if}
</div>
