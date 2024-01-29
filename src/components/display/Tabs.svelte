<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import type { AssumptionResult } from '../../interface/interfaces';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import ExportIcon from '../icons/ExportIcon.svelte';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    export let num: number = undefined;
    export let stepIndex: number = undefined;
    export let assumptionResults: AssumptionResult[] = undefined;
    export let specs: Array<any> = undefined;

    const exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

    const exportVizIdx: Writable<number> = getContext('exportVizIdx');

    const serial: Writable<string> = getContext('serial');

    const exportingItem: Writable<string> = getContext('exportingItem');

    let activeTabValue = 0;

    function updateChart(specs: Array<any>, activeTabValue: number) {
        if (!_.isUndefined(specs)) {
            embed(
                `#vis-${$serial}-${stepIndex}-${activeTabValue}`,
                specs[activeTabValue],
                { actions: false }
            );
        }
    }

    $: updateChart(specs, activeTabValue);

    const handleClick = tabValue => () => (activeTabValue = tabValue);

    function exportViz(stepIndex, vizIndex) {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
        exportVizIdx.set(vizIndex);
    }
</script>

<div class="flex-col p-2 w-3/4">
    <ul>
        {#each assumptionResults as assumptionResult, i}
            <li class={activeTabValue === i ? 'active' : ''}>
                <button on:click={handleClick(i)}
                    ><span class="font-bold" style="color:#008AFE"
                        >{assumptionResult.name}</span
                    ></button
                >
            </li>
        {/each}
    </ul>
    {#each Array(num) as _, i}
        {#if activeTabValue == i}
            <div class="box">
                <div class="flex">
                    <div class="grow" />
                    <div style="flex-wrap: wrap;width:300px">
                        {assumptionResults[activeTabValue].prompt}
                    </div>
                    <div class="grow" />
                </div>
                <div class="flex">
                    <div class="grow" />
                    <div
                        id="vis-{$serial}-{stepIndex}-{i}"
                        style="width:300px"
                    />
                    <!-- <Tooltip title="Export Visualization">
                        <button on:click={() => exportViz(stepIndex,i)}><ExportIcon /></button>
                    </Tooltip> -->
                    <div class="grow" />
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .box {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #dee2e6;
        border-radius: 0 0 0.5rem 0.5rem;
        border-top: 0;
    }
    ul {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        border-bottom: 1px solid #dee2e6;
    }
    li {
        margin-bottom: -1px;
    }

    span {
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        display: block;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    span:hover {
        border-color: #e9ecef #e9ecef #dee2e6;
    }

    li.active > button > span {
        color: #495057;
        background-color: #fff;
        border-color: #dee2e6 #dee2e6 #fff;
    }
</style>
