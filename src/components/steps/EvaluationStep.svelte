<script lang="ts">
    import _ from 'lodash';
    import SvelteTable from 'svelte-table';

    import type { Step } from '../../interface/interfaces';
    import { getScatterPlotStats } from '../viz/action/visualization';
    import embed from 'vega-embed';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import ExportIcon from '../icons/ExportIcon.svelte';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { exportingItem } from '../../stores';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    var exportTableStepIdx: Writable<number> = getContext('exportTableStepIdx');
    var exportVizStepIdx: Writable<number> = getContext('exportVizStepIdx');

    function exportViz() {
        exportingItem.set('viz');
        exportVizStepIdx.set(stepIndex);
    };
    
    function exportRegressionTable() {
        exportingItem.set("table");
        exportTableStepIdx.set(stepIndex);
    }

    //buttons
    if (!_.isUndefined(step?.config?.viz)) {
        const viz = step.config.viz;
        const spec = getScatterPlotStats(viz);
        embed('#vis', spec, { actions: false });
    }

    const columns = [
        {
            key: 'name',
            title: 'Coefficient',
            value: v => v.name,
            sortable: true
        },
        {
            key: 'value',
            title: 'Value',
            value: v => v.value,
            sortable: true
        },
        {
            key: 'pvalue',
            title: 'P',
            value: v => v.pvalue.toFixed(4),
            sortable: true
        }
    ];
</script>

<div>
    <div class="place-content-center flex p-4">
        <div class="flex flex-col">
            <!-- Visualization -->
            <div id="vis" />
            {#if !_.isUndefined(step.config.modelResults)}
                {#each step.config.modelResults as modelResult}
                    <span>{modelResult.name} : {modelResult.score}</span>
                {/each}
            {/if}
        </div>
        <div>
            <Tooltip title="Export Visualization">
                <button on:click={exportViz}><ExportIcon /></button>
            </Tooltip>
            <div class="grow"></div>
        </div>
        <div class="grow" />
        <div>
            <!-- <table>
                <tr>
                    <th>Coefficient</th>
                    <th>Value</th>
                    <th>P</th>
                </tr>
                {#if !_.isUndefined(step?.config?.modelParameters)}
                {#each step.config.modelParameters as param}
                <tr>
                    <td>{param.name}</td>
                    <td>{param.value}</td>
                    {#if !_.isUndefined(param?.pvalue)}
                    <td>{param.pvalue}</td>
                    {:else}
                    <td></td>
                    {/if}
                </tr>
                {/each}
                {/if}
            </table> -->
            <SvelteTable {columns} rows={step.config.modelParameters} />
        </div>
    </div>
    <div class="flex">
        <div class="grow" />
        <Tooltip title="Export">
            <button on:click={exportRegressionTable}><ExportIcon /></button>
        </Tooltip>
    </div>
</div>
