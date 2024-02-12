<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import type { AssumptionResult } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { afterUpdate, getContext, onMount } from 'svelte';
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

    onMount(() => {
        updateChart(specs, activeTabValue);
    });

    afterUpdate(() => {
        updateChart(specs, activeTabValue);
    });

    const handleClick = tabValue => () => (activeTabValue = tabValue);

    function exportViz(stepIndex, vizIndex) {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
        exportVizIdx.set(vizIndex);
    }
</script>

<div class="flex-col p-2 w-3/4">
    <ul class="flex flex-wrap list-none pl-0 mb-0 border-b border-gray-300">
        {#each assumptionResults as assumptionResult, i}
            <li>
                <button on:click={handleClick(i)}
                    ><span
                        class={`font-bold rounded-t-md block py-2 px-4 cursor-pointer ${
                            activeTabValue === i
                                ? 'text-gray-600 bg-white border border-b-0 border-gray-300'
                                : 'hover:border-gray-200'
                        }`}
                        style={activeTabValue === i
                            ? ' margin-bottom:-1px'
                            : ''}>{assumptionResult.name}</span
                    ></button
                >
            </li>
        {/each}
    </ul>
    {#each Array(num) as _, i}
        {#if activeTabValue == i}
            <div
                class="mb-2 p-2 border border-gray-300 rounded-b-lg border-t-0"
            >
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
                    <div class="grow" />
                </div>
            </div>
        {/if}
    {/each}
</div>
