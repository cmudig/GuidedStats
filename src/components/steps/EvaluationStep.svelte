<script lang="ts">
    import _ from 'lodash';
    import type { Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');
    
</script>

<div>
    <div class="place-content-center flex">
        <!-- Visualization -->
        <div>
            {#if !_.isUndefined(step.config.modelResults)}
            {#each step.config.modelResults as modelResult}
                <span>{modelResult.name} : {modelResult.score}</span>
            {/each}
            {/if}
            <!-- draw a white blank svg -->
            <svg width="100" height="100">
                <rect
                    width="100"
                    height="100"
                    style="fill:white;stroke-width:3;stroke:rgb(0,0,0)"
                />
            </svg>
        </div>
    </div>
</div>
