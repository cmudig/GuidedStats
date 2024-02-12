<script lang="ts">
    import _ from 'lodash';
    import type { Step, Visualization } from '../../interface/interfaces';
    import {
        getScatterPlotStats,
        getTTestPlotStats
    } from '../viz/action/visualization';
    import embed from 'vega-embed';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import Table from '../display/Table.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const exportingItem: Writable<string> = getContext('exportingItem');

    var exportTableStepIdx: Writable<number> = getContext('exportTableStepIdx');
    var exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

    function exportViz() {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
    }

    //buttons
    function renderViz(vizs: Visualization[], width: number) {
        if (!_.isUndefined(vizs)) {
            let viz = vizs[0];
            let spec;
            if (viz.vizType === 'scatter') {
                spec = getScatterPlotStats(viz, width * 0.6);
            } else if (viz.vizType === 'ttest') {
                spec = getTTestPlotStats(viz, (width = width * 0.6));
            }
            embed(`#vis-${stepIndex}`, spec, { actions: false });
        }
    }

    $: renderViz(step?.config?.viz, width);

    let width: number = 450;
</script>

<div class="overflow-y-scroll overflow-x-scroll" style="scrollbar-width: none">
    <div class="flex">
        <div class="grow" />
        <div class="place-content-center flex p-4" style="width:{width}px">
            <div class="grow" />
            <div class="flex flex-col">
                <!-- Visualization -->
                <div id="vis-{stepIndex}" style="width:220px" />
            </div>
            {#if !_.isUndefined(step?.config?.modelResults) && step?.config?.modelResults.length > 0}
                <div class="flex flex-col">
                    <div class="p-2">
                        <Table
                            headers={['Metric', 'Score']}
                            keys={['name', 'score']}
                            data={step?.config?.modelResults}
                        />
                    </div>
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
            <div class="grow" />
        </div>
        <div class="grow" />
    </div>
</div>
