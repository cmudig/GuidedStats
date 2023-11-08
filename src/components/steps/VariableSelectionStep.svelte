<script lang="ts">
    import _ from 'lodash';
    import type { Step, Option, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    import Done from '../icons/Done.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    //javascript set
    $: variableResults = new Array<Option>();

    function toggleVariable(variable: Option) {
        if(variableResults.includes(variable)){
            variableResults.splice(variableResults.indexOf(variable), 1);
        } else {
            variableResults.push(variable);
        };
        variableResults = [...variableResults];
    };

    function updateVariableResults() {
        let results = variableResults;
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.variableResults = results;
        workflowInfo.set(info);
        console.log("check");
    };
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
    <div class="flex">
        <div class="grow" />
        <div
            class="variable-container py-2 m-2 overflow-hidden bg-white border-2 flex flex-col"
        >
            {#each step.config.variableCandidates as variable}
            <button
                    class="hover:bg-slate-100 {variableResults.map(d => d.name).includes(variable.name)? ' bg-gray-300': ''}"
                    on:click={() => toggleVariable(variable)}
                    ><span class="px-2">{variable.name}{_.isUndefined(variable.score)? "": `: ${variable.score.toFixed(4)}`}</span></button
                >
            {/each}
        </div>
        <div class="grow" />
    </div>
    <div class="flex">
        <div class="grow" />
        <Tooltip title="Done">
            <button on:click={updateVariableResults}><Done /></button>
        </Tooltip>
    </div>
</div>

<style>
    .variable-container {
        height: 120px;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .variable-container::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>
