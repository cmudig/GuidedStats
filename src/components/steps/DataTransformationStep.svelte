<script lang="ts">
    import _ from 'lodash';
    import type { Step, Option, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let variableResult: Option = undefined;
    
    let transformationName: string = undefined;


    function updateTransformation() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.variableResults = new Array(variableResult);
        info.steps[stepIndex].config.transformationName = transformationName;
        workflowInfo.set(info);
    }

</script>

<div class="place-content-center flex">
    <div
        class="w-1/2 flex flex-col p-2 overflow-hidden bg-white border-2"
    >
        Select the column:
        {#if !_.isUndefined(step?.config?.variableCandidates)}
            <select class="border-2" bind:value={variableResult}>
            {#each step?.config?.variableCandidates as variable}
                <option value={variable}>{variable.name}</option>
            {/each}
            </select>
        {/if}
        Select the transformation:
        <select class="border-2" bind:value={transformationName}>
            <option value="log">Log transformation</option>
        </select>
        <div class="grow" />
    </div>
    <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
        <button class="border-2">
            <span class="font-bold">Skip</span>
        </button>
        <div class="grow" />
        <button class="border-2" on:click={updateTransformation}>
            <span class="font-bold">Done</span>
        </button>
    </div>
</div>
