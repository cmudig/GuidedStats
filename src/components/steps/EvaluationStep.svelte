<script lang="ts">
    import _, { isUndefined } from 'lodash';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import type { Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { getScatterPlotStats } from '../viz/action/visualization';
    import embed from 'vega-embed';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    //buttons
    if (!_.isUndefined(step?.config?.viz)) {
        const viz = step.config.viz;
        const spec = getScatterPlotStats(viz);
        embed('#vis', spec);
    };

    if (!_.isUndefined(step?.config?.modelResults)) {
        console.log(step.config.modelResults);
    };
</script>

<div>
    <div class="place-content-center flex">
        <!-- Visualization -->
        <div id="vis" />
        <div>
            {#if !_.isUndefined(step.config.modelResults)}
                {#each step.config.modelResults as modelResult}
                    <span>{modelResult.name} : {modelResult.score}</span>
                {/each}
            {/if}
            <DataTable table$aria-label="People list" style="max-width: 100%;">
                <Head>
                  <Row>
                    <Cell>Coefficient</Cell>
                    <Cell numeric>Value</Cell>
                    <Cell numeric>P</Cell>
                  </Row>
                </Head>
                <Body>
                    {#if !_.isUndefined(step?.config?.modelParameters)}
                    {#each step.config.modelParameters as param}
                    <Row>
                        <Cell>{param.name}</Cell>
                        <Cell numeric>{param.value}</Cell>
                        {#if !_.isUndefined(param?.pvalue)}
                        <Cell numeric>{param.pvalue}</Cell>
                        {/if}
                      </Row>
                    {/each}
                    {/if}
                </Body>
              </DataTable>           
        </div>
    </div>
</div>
