<script lang="ts">
    import _ from 'lodash';
    import type { Step, Option, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    //javascript set
    let variableResults: Set<Option> = new Set();

    function addVariable(variable: Option) {
        variableResults.add(variable);
    }

    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function updateVariableResults() {
        let results = Array.from(variableResults);
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.variableResults = results;
        workflowInfo.set(info);
    }

    $: console.log(step);
</script>

<div class="flex flex-col">
    <div>
        {#if !_.isUndefined(step.config.metric)}
            We find these variables have high {step.config.metric} with the target
            variable <span class="font-bold" style="color:#008AFE"
                >{step.config.referenceVariables?.reduce(
                    (previousValue, currentValue) =>
                        previousValue + ', ' + currentValue
                )}</span
            >:
        {:else}
            Please select <span class="font-bold" style="color:#008AFE"
                >{step.config.variableName}</span
            > from below:
        {/if}
    </div>
    <div class="place-content-center flex">
        <div
            class="variable-container w-1/2 p-2 overflow-hidden bg-white border-2"
        >
            {#each step.config.variableCandidates as variable}
                <button
                    class="w-full border-2"
                    on:click={() => addVariable(variable)}
                    >{variable.name}{_.isUndefined(variable.score)? "": `: ${variable.score.toFixed(4)}`}</button
                >
            {/each}
        </div>
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2">
                <span class="font-bold">Skip</span>
            </button>
            <div class="grow" />
            <button class="border-2" on:click={updateVariableResults}>
                <span class="font-bold">Done</span>
            </button>
        </div>
    </div>
</div>

<style>
    .variable-container {
        height: 120px;
        width: 240px;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .variable-container::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>
