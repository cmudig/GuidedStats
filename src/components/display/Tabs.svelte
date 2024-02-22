<script lang="ts">
    import _ from 'lodash';
    import embed from 'vega-embed';
    import type {
        AssumptionResult,
        Workflow
    } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { afterUpdate, getContext, onMount } from 'svelte';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import Done from '../icons/Done.svelte';
    export let num: number = undefined;
    export let stepIndex: number = undefined;
    export let assumptionResults: AssumptionResult[] = undefined;
    export let specs: Array<any> = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const builtinTransformations: Writable<Array<string>> = getContext(
        'builtinTransformations'
    );

    const exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

    const exportVizIdx: Writable<number> = getContext('exportVizIdx');

    const serial: Writable<string> = getContext('serial');

    const exportingItem: Writable<string> = getContext('exportingItem');

    let activeTabValue = 0;
    let active = false;

    function updateTransformation(event: Event) {
        let transformationName = (event.target as HTMLSelectElement).value;
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.transformationName = transformationName;
        info.steps[stepIndex].config.variableResults = [
            { name: assumptionResults[activeTabValue].name }
        ];
        workflowInfo.set(info);
    }

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

    function execute() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].isShown = false;
        workflowInfo.set(info);
    }

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
                                    >{assumptionResults[activeTabValue]
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
                    {#if active}
                        <div class="flex">
                            <div class="grow" />
                            <Tooltip title="Update Visualization">
                                <button on:click={execute}><Done /></button>
                            </Tooltip>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    {/each}
</div>
