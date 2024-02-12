<script lang="ts">
    import _ from 'lodash';
    import type { Step, Visualization } from '../../interface/interfaces';
    import {
        getScatterPlotStats,
        getTTestPlotStats
    } from '../viz/action/visualization';
    import Done from '../icons/Done.svelte';
    import embed from 'vega-embed';
    import { afterUpdate, getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import Table from '../display/Table.svelte';
    import HintIcon from '../icons/HintIcon.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let width: number = 450;
    let active: boolean = false;

    let group: string = 'Train';

    const exportingItem: Writable<string> = getContext('exportingItem');

    var exportTableStepIdx: Writable<number> = getContext('exportTableStepIdx');
    var exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

    function exportViz() {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
    }

    //buttons
    function renderViz(
        vizs: Visualization[],
        width: number,
        group: string = 'Train'
    ) {
        afterUpdate(() => {
            if (!_.isUndefined(vizs)) {
                let viz = vizs[0];
                let spec;
                if (viz.vizType === 'scatter') {
                    spec = getScatterPlotStats(viz, (group = group));
                } else if (viz.vizType === 'ttest') {
                    spec = getTTestPlotStats(viz);
                }
                embed(`#vis-${stepIndex}`, spec, { actions: false });
            }
        });
    }

    $: renderViz(step?.config?.viz, width, group);
</script>

<div class="overflow-y-scroll overflow-x-scroll">
    <div class="flex flex-col">
        <div class="grow" />
        <div class="place-content-center flex p-4" style="width:{width}px">
            <div class="grow" />
            <div class="flex flex-col">
                <div class="grow" />
                <!-- Visualization -->
                <div id="vis-{stepIndex}" style="width:220px" />
                <!-- create a select menu to select Train or Test-->
                {#if !_.isUndefined(step.config?.viz) && step.config?.viz.length > 0 && step.config?.viz[0]?.vizType === 'scatter'}
                    <div class="p-2 flex">
                        <div class="grow" />
                        Select:
                        <select
                            class="rounded appearance-auto py-1 px-2 mx-1 bg-white border-solid border border-gray-300 focus:border-blue-500"
                            bind:value={group}
                        >
                            <option value="Train">Train</option>
                            <option value="Test">Test</option>
                        </select>
                        <div class="grow" />
                    </div>
                {/if}
                <div class="grow" />
            </div>
            <div class="flex flex-col">
                {#if !_.isUndefined(step?.config?.modelResults) && step?.config?.modelResults.length > 0}
                    <div class="flex">
                        <div class="grow" />
                        <div class="p-2">
                            <Table
                                headers={['Metric', 'Score']}
                                keys={['name', 'score']}
                                data={step?.config?.modelResults}
                            />
                        </div>
                        <div class="grow" />
                    </div>
                {/if}
                {#if !_.isUndefined(step?.config?.modelParameters) && step?.config?.modelParameters.length > 0}
                    <div class="p-2">
                        {#if step.config.modelParameters[0].hasOwnProperty('pvalue')}
                            <Table
                                headers={['Name', 'Value', 'P']}
                                keys={['name', 'value', 'pvalue']}
                                data={step?.config?.modelParameters}
                            />
                        {:else}
                            <Table
                                headers={['Name', 'Value']}
                                keys={['name', 'value']}
                                data={step?.config?.modelParameters}
                            />
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="grow" />
        </div>
        {#if active}
            <div class="bg-gray-100 p-5 m-1 rounded-lg font-sans text-gray-800">
                <h6 class="text-blue-700">Export Options</h6>
                <p>
                    Here are the available commands for exporting various
                    elements of your analysis:
                </p>
                <ul class="list-disc list-inside">
                    <li>
                        <strong>Regression Table</strong> (LaTeX format):
                        <code class="bg-gray-200 text-sm p-1 rounded"
                            >obj.export("table", format="latex")</code
                        >
                    </li>
                    <li>
                        <strong>Analysis Report</strong> on the coefficients:
                        <code class="bg-gray-200 text-sm p-1 rounded"
                            >exported_report = obj.export("report")</code
                        >
                    </li>
                    <li>
                        <strong>Model Export</strong>:
                        <code class="bg-gray-200 text-sm p-1 rounded"
                            >exported_model = obj.export("model")</code
                        >
                    </li>
                    <li>
                        <strong>Dataset Export</strong>, if transformations were
                        applied:
                        <code class="bg-gray-200 text-sm p-1 rounded"
                            >exported_dataset = obj.export("dataset")</code
                        >
                    </li>
                </ul>
                <p class="italic">
                    Note: Replace <code class="bg-gray-200 text-sm p-1 rounded"
                        >obj</code
                    > with the name of the instance you've created for your analysis.
                </p>
            </div>
        {/if}
        <div class="grow" />
    </div>
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
            <button disabled><Done /></button>
        </Tooltip>
    </div>
</div>
