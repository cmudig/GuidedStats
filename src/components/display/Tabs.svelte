<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import type {
        AssumptionResult,
        Visualization,
        Workflow
    } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { afterUpdate, getContext, onMount } from 'svelte';
    import { deepCopy } from '../../utils';
    import { activeTabValue } from '../../stores';
    import {
        getBoxplotStats,
        getDensityPlotStats,
        getHeatMapStats
    } from '../viz/action/visualization';
    export let num: number = undefined;
    export let stepIndex: number = undefined;
    export let assumptionResults: AssumptionResult[] = undefined;
    export let viz: Visualization[] = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const builtinTransformations: Writable<Array<string>> = getContext(
        'builtinTransformations'
    );

    const serial: Writable<string> = getContext('serial');

    let active = false;
    let vizSubType = 'density';

    function updateTransformation(event: Event) {
        let transformationName = (event.target as HTMLSelectElement).value;
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.transformationName = transformationName;
        info.steps[stepIndex].config.variableResults = [
            { name: assumptionResults[$activeTabValue].name }
        ];
        workflowInfo.set(info);
    }

    function updateChart(viz: Visualization[], activeTabValue: number) {
        if (!_.isUndefined(viz)) {
            let specs = undefined;
            specs = viz.map(v => {
                if (v.vizType == 'density') {
                    return getDensityPlotStats(v, vizSubType);
                } else if (v.vizType == 'boxplot') {
                    return getBoxplotStats(v);
                } else if (v.vizType == 'heatmap') {
                    return getHeatMapStats(v);
                }
            });
            if (!_.isUndefined(specs)) {
                embed(
                    `#vis-${$serial}-${stepIndex}-${activeTabValue}`,
                    specs[activeTabValue],
                    { actions: false }
                );
            }
        }
    }

    afterUpdate(() => {
        updateChart(viz, $activeTabValue);
    });

    $: updateChart(viz, $activeTabValue);

    const handleClick = tabValue => () => activeTabValue.set(tabValue);
</script>

<div class="flex-col p-2 w-3/4">
    <ul class="flex flex-wrap list-none pl-0 mb-0 border-b border-gray-300">
        {#each assumptionResults as assumptionResult, i}
            <li>
                <button on:click={handleClick(i)}
                    ><span
                        class={`font-bold rounded-t-md block py-2 px-4 cursor-pointer ${
                            $activeTabValue === i
                                ? 'text-gray-600 bg-white border border-b-0 border-gray-300'
                                : 'hover:border-gray-200'
                        }`}
                        style={$activeTabValue === i
                            ? ' margin-bottom:-1px'
                            : ''}>{assumptionResult.name}</span
                    ></button
                >
            </li>
        {/each}
    </ul>
    {#each Array(num) as _, i}
        {#if $activeTabValue == i}
            <div
                class="mb-2 p-2 border border-gray-300 rounded-b-lg border-t-0"
            >
                <div class="flex">
                    <div class="grow" />
                    <div style="flex-wrap: wrap;width:300px">
                        {assumptionResults[$activeTabValue].prompt}
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
                {#if $workflowInfo.steps[stepIndex]?.config?.viz?.length > 0 && $workflowInfo.steps[stepIndex]?.config?.viz[$activeTabValue].vizType == 'density'}
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
                {#if $workflowInfo.steps[stepIndex]?.config?.assumptionName === 'outlier'}
                    <div
                        class="p-2 m-2 flex flex-col border border-gray-300 rounded"
                    >
                        <div class="flex">
                            <div class="grow" />
                            <button
                                on:click={() => {
                                    active = !active;
                                }}
                            >
                                <span class="py-1 px-2">
                                    {#if active}
                                        Select
                                    {:else}
                                        Click to select
                                    {/if}
                                    <span
                                        class="font-bold"
                                        style="color: rgb(0, 138, 254);"
                                        >data transformation</span
                                    >
                                    on column
                                    <span
                                        class="font-bold"
                                        style="color: rgb(0, 138, 254);"
                                        >{assumptionResults[$activeTabValue]
                                            .name}</span
                                    ></span
                                >
                            </button>
                            {#if active}
                                <div class="flex flex-col">
                                    <div class="grow" />
                                    <select
                                        class="rounded appearance-auto py-1 px-2 m-2 bg-white border-solid border border-gray-300 focus:border-blue-500"
                                        on:change={updateTransformation}
                                    >
                                        <option disabled selected value>
                                            -- option --
                                        </option>
                                        {#each $builtinTransformations as transformation}
                                            <option value={transformation}
                                                >{transformation}</option
                                            >
                                        {/each}
                                    </select>
                                    <div class="grow" />
                                </div>
                            {/if}
                            <div class="grow" />
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    {/each}
</div>
