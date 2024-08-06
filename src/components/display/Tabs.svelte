<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import type {
        AssumptionResult,
        Visualization,
        Workflow
    } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { afterUpdate, getContext } from 'svelte';
    import { activeTab } from '../../stores';
    import {
        getBoxplotStats,
        getDensityPlotStats,
        getHeatMapStats,
        getRegressionPlotStats
    } from '../viz/action/visualization';
    export let num: number = undefined;
    export let stepIndex: number = undefined;
    export let assumptionResults: AssumptionResult[] = undefined;
    export let viz: Visualization[] = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const serial: Writable<string> = getContext('serial');

    let vizSubType = 'density';

    function updateChart(viz: Visualization[], activeTab: number) {
        if (!_.isUndefined(viz)) {
            let specs = undefined;
            specs = viz.map(v => {
                if (v.vizType == 'density') {
                    return getDensityPlotStats(v, vizSubType);
                } else if (
                    v.vizType == 'boxplot' ||
                    v.vizType == 'multiBoxplot'
                ) {
                    return getBoxplotStats(v);
                } else if (v.vizType == 'heatmap') {
                    return getHeatMapStats(v);
                } else if (v.vizType == 'regression') {
                    return getRegressionPlotStats(v);
                }
            });
            if (!_.isUndefined(specs)) {
                embed(
                    `#vis-${$serial}-${stepIndex}-${activeTab}`,
                    specs[activeTab],
                    { actions: false, scaleFactor: 250 }
                );
            }
        }
    }

    afterUpdate(() => {
        updateChart(viz, $activeTab);
    });

    $: updateChart(viz, $activeTab);

    const handleClick = tabValue => () => activeTab.set(tabValue);
</script>

<div class="flex-col p-2 w-3/4">
    <ul class="flex flex-wrap list-none pl-0 mb-0 border-b border-gray-300">
        {#each assumptionResults as assumptionResult, i}
            <li>
                <button on:click={handleClick(i)}
                    ><span
                        class={`font-bold rounded-t-md block py-2 px-4 cursor-pointer ${
                            $activeTab === i
                                ? 'text-gray-600 bg-white border border-b-0 border-gray-300'
                                : 'hover:border-gray-200'
                        }`}
                        style={$activeTab === i ? ' margin-bottom:-1px' : ''}
                        >{assumptionResult.name}</span
                    ></button
                >
            </li>
        {/each}
    </ul>
    {#each Array(num) as __, i}
        {#if $activeTab == i}
            <div
                class="mb-2 p-2 border border-gray-300 rounded-b-lg border-t-0"
            >
                <div class="flex">
                    <div class="grow" />
                    <div style="flex-wrap: wrap;width:300px">
                        {#if !_.isUndefined(assumptionResults[$activeTab]?.prompt)}
                            {assumptionResults[$activeTab]?.prompt}
                        {/if}
                    </div>
                    <div class="grow" />
                </div>
                <div class="flex">
                    <div class="grow" />
                    <div
                        id="vis-{$serial}-{stepIndex}-{i}"
                        style="width:300px"
                    />
                    <div class="grow" />
                </div>
                {#if $workflowInfo.steps[stepIndex]?.config?.viz?.length > 0 && $workflowInfo.steps[stepIndex]?.config?.viz[$activeTab].vizType == 'density'}
                    <div class="p-2 flex">
                        <div class="grow" />
                        <span class="py-1 px-2"
                            >Select plot for comparison against normal
                            distribution:</span
                        >
                        <select
                            class="rounded appearance-auto py-1 px-2 mx-1 bg-white border-solid border border-gray-300 focus:border-blue-500"
                            bind:value={vizSubType}
                        >
                            <option value="qq">QQ Plot</option>
                            <option value="density">Density Plot</option>
                        </select>
                        <div class="grow" />
                    </div>
                {/if}
            </div>
        {/if}
    {/each}
</div>
