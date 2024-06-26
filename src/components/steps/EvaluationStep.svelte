<script lang="ts">
    import _ from 'lodash';
    import type {
        Step,
        Visualization,
        ModelResult
    } from '../../interface/interfaces';
    import {
        getScatterPlotStats,
        getTTestPlotStats
    } from '../viz/action/visualization';
    import embed from 'vega-embed';
    import { afterUpdate, getContext } from 'svelte';
    import Table from '../display/Table.svelte';
    import type { Writable } from 'svelte/store';

    const serial: Writable<string> = getContext('serial');

    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let width: number = 450;
    let group: string = 'Train';
    let modelResults: ModelResult[];

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
                embed(`#vis-${$serial}-${stepIndex}`, spec);
            }
        });
    }

    function renderModelResults(
        results: ModelResult[],
        group: string = 'Train'
    ) {
        afterUpdate(() => {
            if (!_.isUndefined(results)) {
                if (!_.isUndefined(results[0]?.group)) {
                    modelResults = results.filter(d => d.group === group);
                } else {
                    modelResults = results;
                }
            }
        });
    }

    $: renderViz(step?.config?.viz, width, group);

    $: renderModelResults(step?.config?.modelResults, group);
</script>

<div class="overflow-y-scroll">
    <div class="flex flex-col">
        <div class="grow" />
        <div class="place-content-center flex p-4">
            <div class="grow" />
            <div class="flex flex-col">
                <div class="grow" />
                <!-- Visualization -->
                <div id="vis-{$serial}-{stepIndex}" style="width:300px" />
                <!-- create a select menu to select Train or Test-->
                {#if !_.isUndefined(step.config?.viz) && step.config?.viz.length > 0 && step.config?.viz[0]?.vizType === 'scatter'}
                    <div class="p-2 flex">
                        <div class="grow" />
                        <span class="py-1 px-2">Select:</span>
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
            <div class="grow" />
            <div class="flex flex-col">
                {#if !_.isUndefined(modelResults) && modelResults.length > 0}
                    <div class="flex">
                        <div class="grow" />
                        <div class="p-2">
                            <Table
                                headers={['Metric', 'Score']}
                                keys={['name', 'score']}
                                data={modelResults}
                            />
                        </div>
                        <div class="grow" />
                    </div>
                {/if}
                {#if !_.isUndefined(step?.config?.modelParameters) && step?.config?.modelParameters.length > 0}
                    <div class="p-2">
                        {#if step.config.modelParameters[0].hasOwnProperty('pvalue')}
                            <Table
                                headers={!_.isUndefined(step.config?.viz) &&
                                step.config?.viz.length > 0 &&
                                step.config?.viz[0]?.vizType === 'scatter'
                                    ? ['Variable', 'Coefficient', 'P-value']
                                    : ['Test Statistic', 'Value', 'P-value']}
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
        <div class="grow" />
    </div>
</div>
