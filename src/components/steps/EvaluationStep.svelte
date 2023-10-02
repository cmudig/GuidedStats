<script lang="ts">
    import _ from 'lodash';
    import type { Step } from '../../interface/interfaces';
    import { getScatterPlotStats } from '../viz/action/visualization';
    import embed from 'vega-embed';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

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
            <table>
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
            </table>
        </div>
    </div>
</div>
