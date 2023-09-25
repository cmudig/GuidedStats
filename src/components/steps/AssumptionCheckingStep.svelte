<script lang="ts">
    import _ from 'lodash';
    import {deepCopy} from '../../utils';
    import type { Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function stopInspectingAssumption(){
        let info:Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].done = true ;
        workflowInfo.set(info);
    }

    //prompt
    //visualization
    //buttons
</script>

<div>
    {#each step.config.assumptionResults as assumptionResult}
        <div>
            {assumptionResult.name} : {assumptionResult.prompt}
        </div>
    {/each}
    <div class="place-content-center flex">
        <!-- Visualization -->
        <div>
            <!-- draw a white blank svg -->
            <svg width="100" height="100">
                <rect
                    width="100"
                    height="100"
                    style="fill:white;stroke-width:3;stroke:rgb(0,0,0)"
                />
            </svg>
            Should we proceed or not?
        </div>
        <!-- toolbar -->
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2" on:click={stopInspectingAssumption}>
                <span class="font-bold">Yes</span>
            </button>
            <div class="grow" />
            <button class="border-2">
                <span class="font-bold">No</span>
            </button>
        </div>
    </div>
</div>
